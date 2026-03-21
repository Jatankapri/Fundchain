// hooks/useMetrics.js
import { useProvider } from "wagmi";
import { getFactoryContract } from "./useContract";
import { useEffect, useState } from "react";
import { ethers } from "ethers";

export function useMetrics() {
  const provider = useProvider();
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!provider) return;
    let cancelled = false;

    async function run() {
      try {
        const factory = getFactoryContract(provider);
        if (!factory) throw new Error("Factory contract is null — check address/ABI in useContract.js");

        const m = await calculateMetrics(provider);
        if (!cancelled) { setMetrics(m); setLoading(false); }
      } catch (err) {
        if (!cancelled) {
          console.error("Metrics error:", err);
          setError(err.message);
          setLoading(false);
        }
      }
    }

    run();
    return () => { cancelled = true; };
  }, [provider]);

  return { metrics, loading, error };
}

async function calculateMetrics(provider) {
  const factory = getFactoryContract(provider);
  if (!factory) throw new Error("Factory contract returned null — check address/ABI in useContract.js");

  // ── 1. Fetch all TenderFactory events ─────────────────────────────────
  const t0 = Date.now(); // start read latency timer

  const [
    registeredProtocolEvents,
    createdTenderEvents,
    roleGrantedEvents,
    revokedRoleEvents,
    protocolValidatedEvents,
    protocolRejectedEvents,
  ] = await Promise.all([
    factory.queryFilter("RegisteredProtocol"),
    factory.queryFilter("CreatedTender"),
    (async () => { try { return await factory.queryFilter(ethers.utils.id("RoleGranted(bytes32,address,address)")); } catch { return []; } })(),
    (async () => { try { return await factory.queryFilter(ethers.utils.id("RoleRevoked(bytes32,address,address)")); } catch { return []; } })(),
    (async () => { try { return await factory.queryFilter("ProtocolValidated"); } catch { return []; } })(),
    (async () => { try { return await factory.queryFilter("ProtocolRejected"); } catch { return []; } })()
  ]);

  const contractReadLatency = Date.now() - t0; // ms

  // ── 2. Fetch all deployed Tender addresses ─────────────────────────────
  const tenderAddresses = await factory.getDeployedTenders();

  // ── 3. For each Tender, fetch its events and status ───────────────────
  const tenderABI = [
    "event DonorEvent(address indexed donor, uint amount, uint time)",
    "event RefundIssued(address indexed donor, uint256 amount, uint256 timestamp)",
    "event RequestCreated(uint256 indexed requestNo, string description, address recipient, uint256 value, uint256 timestamp)",
    "event RequestVoted(uint256 indexed requestNo, address indexed voter, uint256 timestamp)",
    "event RequestSettled(uint256 indexed requestNo, address indexed recipient, uint256 value, uint256 timestamp)",
    "function readTenderStatus() view returns (address, string, uint, uint, uint, uint, uint, uint, address, bool)",
  ];

  let allDonorEvents        = [];
  let allRefundEvents       = [];
  let allRequestCreatedEvents = [];
  let allRequestVotedEvents = [];
  let allRequestSettledEvents = [];
  let tenderStatuses        = [];
  let allTxHashes           = []; // collect every tx hash for success rate + gas

  // Collect factory-level tx hashes
  [
    ...registeredProtocolEvents,
    ...createdTenderEvents,
    ...roleGrantedEvents,
    ...revokedRoleEvents,
    ...protocolValidatedEvents,
    ...protocolRejectedEvents,
  ].forEach((e) => { if (e.transactionHash) allTxHashes.push(e.transactionHash); });

  await Promise.all(
    tenderAddresses.map(async (addr) => {
      try {
        const tender = new ethers.Contract(addr, tenderABI, provider);
        const [donors, refunds, reqCreated, reqVoted, reqSettled, status] =
          await Promise.all([
            tender.queryFilter("DonorEvent"),
            tender.queryFilter("RefundIssued"),
            tender.queryFilter("RequestCreated"),
            tender.queryFilter("RequestVoted"),
            tender.queryFilter("RequestSettled"),
            tender.readTenderStatus(),
          ]);

        donors.forEach((e) => {
          e._tenderAddress = addr.toLowerCase();
          if (e.transactionHash) allTxHashes.push(e.transactionHash);
        });
        [...refunds, ...reqCreated, ...reqVoted, ...reqSettled].forEach((e) => {
          if (e.transactionHash) allTxHashes.push(e.transactionHash);
        });

        allDonorEvents.push(...donors);
        allRefundEvents.push(...refunds);
        allRequestCreatedEvents.push(...reqCreated);
        allRequestVotedEvents.push(...reqVoted);
        allRequestSettledEvents.push(...reqSettled);

        tenderStatuses.push({
          address:     addr,
          authorizer:  status[0],
          pdfUrl:      status[1],
          target:      parseFloat(ethers.utils.formatEther(status[2])),
          deadline:    status[3].toNumber(),
          minContrib:  parseFloat(ethers.utils.formatEther(status[4])),
          raised:      parseFloat(ethers.utils.formatEther(status[5])),
          noOfDonors:  status[6].toNumber(),
          numRequests: status[7].toNumber(),
          owner:       status[8],
          destroyed:   status[9],
        });
      } catch (err) {
        console.warn(`Skipping tender ${addr}:`, err.message);
      }
    })
  );

  // ── 4. PERFORMANCE METRICS ────────────────────────────────────────────

  // Deduplicate tx hashes
  const uniqueTxHashes = [...new Set(allTxHashes)];

  // Fetch all receipts in parallel
  const receipts = await Promise.all(
    uniqueTxHashes.map((hash) =>
      provider.getTransactionReceipt(hash).catch(() => null)
    )
  );
  const validReceipts = receipts.filter(Boolean);

  // ── Transaction Success Rate ──────────────────────────────────────────
  // status: 1 = success, 0 = failed (EIP-658, supported on Ganache)
  const successfulTxns = validReceipts.filter((r) => r.status === 1).length;
  const failedTxns     = validReceipts.filter((r) => r.status === 0).length;
  const txSuccessRate  = validReceipts.length > 0
    ? ((successfulTxns / validReceipts.length) * 100).toFixed(2) : "0.00";

  // ── Gas Metrics ───────────────────────────────────────────────────────
  const totalGasUsed = validReceipts.reduce(
    (sum, r) => sum + r.gasUsed.toNumber(), 0
  );
  const avgGasPerTx = validReceipts.length > 0
    ? Math.round(totalGasUsed / validReceipts.length) : 0;

  // ── Transaction Confirmation Latency (avg time between block and tx) ──
  // We measure block timestamps for all tx blocks to compute avg confirmation gap
  const blockNums  = [...new Set(validReceipts.map((r) => r.blockNumber))];
  const blocks     = await Promise.all(
    blockNums.map((n) => provider.getBlock(n).catch(() => null))
  );
  const blockTimeMap = {};
  blocks.filter(Boolean).forEach((b) => { blockTimeMap[b.number] = b.timestamp; });

  // Confirmation latency = time between consecutive blocks (avg block time on Ganache)
  const blockTimestamps = Object.values(blockTimeMap).sort((a, b) => a - b);
  let avgBlockTime = 0;
  if (blockTimestamps.length > 1) {
    const gaps = [];
    for (let i = 1; i < blockTimestamps.length; i++) {
      gaps.push(blockTimestamps[i] - blockTimestamps[i - 1]);
    }
    avgBlockTime = (gaps.reduce((a, b) => a + b, 0) / gaps.length).toFixed(2);
  }

  // ── Throughput: txns per day (last 7 days) ────────────────────────────
  const now = Math.floor(Date.now() / 1000);
  const throughputLast7Days = [];
  for (let i = 6; i >= 0; i--) {
    const dayStart = now - (i + 1) * 86400;
    const dayEnd   = now - i * 86400;
    const label    = new Date(dayEnd * 1000).toLocaleDateString("en-US", { weekday: "short" });

    // Count txns whose block timestamp falls in this day
    const count = validReceipts.filter((r) => {
      const ts = blockTimeMap[r.blockNumber];
      return ts && ts >= dayStart && ts < dayEnd;
    }).length;

    throughputLast7Days.push({ label, count });
  }

  // ── Marshal/Unmarshal: time to decode all event data ─────────────────
  const marshalStart = Date.now();
  const allEvents = [
    ...allDonorEvents,
    ...allRefundEvents,
    ...allRequestCreatedEvents,
    ...allRequestVotedEvents,
    ...allRequestSettledEvents,
    ...registeredProtocolEvents,
    ...createdTenderEvents,
    ...protocolValidatedEvents,
  ];
  // Force decode all args (triggers ethers.js ABI unmarshal)
  allEvents.forEach((e) => { try { JSON.stringify(e.args); } catch (_) {} });
  const marshalLatency = Date.now() - marshalStart; // ms

  // ── Total txns per day chart (donations) ─────────────────────────────
  const donationsLast7Days = [];
  for (let i = 6; i >= 0; i--) {
    const dayStart = now - (i + 1) * 86400;
    const dayEnd   = now - i * 86400;
    const label    = new Date(dayEnd * 1000).toLocaleDateString("en-US", { weekday: "short" });

    const dayEvents = allDonorEvents.filter((e) => {
      const ts = e.args.time.toNumber();
      return ts >= dayStart && ts < dayEnd;
    });
    const volume = dayEvents.reduce(
      (sum, e) => sum + parseFloat(ethers.utils.formatEther(e.args.amount)), 0
    );
    donationsLast7Days.push({ label, count: dayEvents.length, volume: volume.toFixed(4) });
  }

  // ── TENDER METRICS ─────────────────────────────────────────────────────
  const totalProtocols  = registeredProtocolEvents.length;
  const totalTenders    = tenderAddresses.length;

  const protocolApprovalRate = totalProtocols > 0
    ? ((totalTenders / totalProtocols) * 100).toFixed(2) : 0;

  const successfulTenders = tenderStatuses.filter((t) => t.raised >= t.target).length;
  const activeTenders     = tenderStatuses.filter((t) => t.deadline > now && !t.destroyed).length;
  const failedTenders     = tenderStatuses.filter(
    (t) => t.deadline <= now && t.raised < t.target && !t.destroyed
  ).length;

  const tenderSuccessRate  = totalTenders > 0
    ? ((successfulTenders / totalTenders) * 100).toFixed(2) : 0;

  const totalRaised        = tenderStatuses.reduce((sum, t) => sum + t.raised, 0);
  const avgRaisedPerTender = totalTenders > 0
    ? (totalRaised / totalTenders).toFixed(4) : 0;

  const totalTargets  = tenderStatuses.reduce((sum, t) => sum + t.target, 0);
  const avgTargetSize = totalTenders > 0
    ? (totalTargets / totalTenders).toFixed(4) : 0;

  const validatedProtocolNums = new Set(
    protocolValidatedEvents.map((e) => e.args.protocolNum.toString())
  );
  const pendingProtocols = registeredProtocolEvents.filter(
    (e) => !validatedProtocolNums.has(e.args.regNumber.toString())
  ).length;

  // ── FINANCIAL METRICS ─────────────────────────────────────────────────
  const totalVolume = allDonorEvents.reduce(
    (sum, e) => sum + parseFloat(ethers.utils.formatEther(e.args.amount)), 0
  );
  const totalRefunded = allRefundEvents.reduce(
    (sum, e) => sum + parseFloat(ethers.utils.formatEther(e.args.amount)), 0
  );
  const totalSettled = allRequestSettledEvents.reduce(
    (sum, e) => sum + parseFloat(ethers.utils.formatEther(e.args.value)), 0
  );
  const tvl = Math.max(0, totalVolume - totalRefunded - totalSettled).toFixed(4);
  const refundRate = allDonorEvents.length > 0
    ? ((allRefundEvents.length / allDonorEvents.length) * 100).toFixed(2) : 0;

  // ── DONOR METRICS ─────────────────────────────────────────────────────
  const allDonorAddresses = allDonorEvents.map((e) => e.args.donor.toLowerCase());
  const uniqueDonors      = new Set(allDonorAddresses).size;
  const avgDonationSize   = allDonorEvents.length > 0
    ? (totalVolume / allDonorEvents.length).toFixed(4) : 0;

  const donorTenderMap = {};
  allDonorEvents.forEach((e) => {
    const addr       = e.args.donor.toLowerCase();
    const tenderAddr = e._tenderAddress;
    if (!donorTenderMap[addr]) donorTenderMap[addr] = new Set();
    donorTenderMap[addr].add(tenderAddr);
  });
  const returningDonors    = Object.values(donorTenderMap).filter((t) => t.size > 1).length;
  const donorRetentionRate = uniqueDonors > 0
    ? ((returningDonors / uniqueDonors) * 100).toFixed(2) : 0;

  const donorTotals = {};
  allDonorEvents.forEach((e) => {
    const addr   = e.args.donor.toLowerCase();
    const amount = parseFloat(ethers.utils.formatEther(e.args.amount));
    donorTotals[addr] = (donorTotals[addr] || 0) + amount;
  });
  const topDonors = Object.entries(donorTotals)
    .sort((a, b) => b[1] - a[1]).slice(0, 5)
    .map(([address, amount]) => ({ address, amount: amount.toFixed(4) }));

  // ── AUTHORIZATION METRICS ─────────────────────────────────────────────
  const totalGranted      = roleGrantedEvents.length;
  const totalRevoked      = revokedRoleEvents.length;
  const activeAuthorizers = Math.max(0, totalGranted - totalRevoked);

  const campaignApprovalRate = totalProtocols > 0
    ? ((protocolValidatedEvents.length / totalProtocols) * 100).toFixed(2) : 0;
  const campaignRejectionRate = totalProtocols > 0
    ? ((protocolRejectedEvents.length / totalProtocols) * 100).toFixed(2) : 0;

  const authorizerActivity = {};
  protocolValidatedEvents.forEach((e) => {
    const addr = e.args.authorizer.toLowerCase();
    authorizerActivity[addr] = (authorizerActivity[addr] || 0) + 1;
  });
  const topAuthorizerEntry = Object.entries(authorizerActivity).sort((a, b) => b[1] - a[1])[0] || null;
  const topAuthorizer = topAuthorizerEntry
    ? { address: topAuthorizerEntry[0], count: topAuthorizerEntry[1] } : null;

  // ── GOVERNANCE METRICS ────────────────────────────────────────────────
  const totalRequests        = allRequestCreatedEvents.length;
  const totalSettledRequests = allRequestSettledEvents.length;
  const requestSettlementRate = totalRequests > 0
    ? ((totalSettledRequests / totalRequests) * 100).toFixed(2) : 0;
  const avgVotesPerRequest = totalRequests > 0
    ? (allRequestVotedEvents.length / totalRequests).toFixed(2) : 0;

  // ── Return all metrics ────────────────────────────────────────────────
  return {
    tender: {
      totalProtocols, pendingProtocols, totalTenders,
      activeTenders, successfulTenders, failedTenders,
      tenderSuccessRate, protocolApprovalRate,
      avgRaisedPerTender, avgTargetSize,
    },
    financial: {
      totalVolume:   totalVolume.toFixed(4),
      tvl,
      totalRefunded: totalRefunded.toFixed(4),
      totalSettled:  totalSettled.toFixed(4),
      refundRate,
    },
    donor: {
      totalDonations: allDonorEvents.length,
      uniqueDonors, returningDonors,
      donorRetentionRate, avgDonationSize, topDonors,
    },
    authorization: {
      totalGranted, totalRevoked, activeAuthorizers,
      campaignApprovalRate, campaignRejectionRate, topAuthorizer,
    },
    governance: {
      totalRequests, totalSettledRequests,
      requestSettlementRate, avgVotesPerRequest,
      totalVotes: allRequestVotedEvents.length,
    },
    // ── NEW: Performance metrics ────────────────────────────────────────
    performance: {
      totalTxns:          uniqueTxHashes.length,
      successfulTxns,
      failedTxns,
      txSuccessRate,                          // %
      avgGasPerTx,                            // gas units
      totalGasUsed,                           // gas units
      avgBlockTime,                           // seconds between blocks
      contractReadLatency,                    // ms to fetch all factory events
      marshalLatency,                         // ms to decode all event args
      throughputLast7Days,                    // [{label, count}] txns per day
    },
    chart: { donationsLast7Days },
  };
}