// pages/Metrics.js
import Head from "next/head";
import { useMetrics } from "../hooks/useMetrics";
import styles from "../styles/Metrics.module.css";

function StatCard({ label, value, unit = "", sub = "", color = "blue" }) {
  return (
    <div className={`${styles.card} ${styles[color]}`}>
      <p className={styles.cardLabel}>{label}</p>
      <p className={styles.cardValue}>
        {value}
        {unit && <span className={styles.cardUnit}>{unit}</span>}
      </p>
      {sub && <p className={styles.cardSub}>{sub}</p>}
    </div>
  );
}

function BarChart({ data, title, color = "#3b82f6" }) {
  const maxVal = Math.max(...data.map((d) => d.volume !== undefined ? parseFloat(d.volume) : d.count), 0.0001);
  return (
    <div className={styles.chartWrap}>
      <p className={styles.sectionTitle}>{title}</p>
      <div className={styles.barChart}>
        {data.map((d, i) => {
          const val = d.volume !== undefined ? parseFloat(d.volume) : d.count;
          return (
            <div key={i} className={styles.barCol}>
              <span className={styles.barVolLabel}>
                {d.volume !== undefined ? `${d.volume} ETH` : d.count}
              </span>
              <div className={styles.barTrack}>
                <div
                  className={styles.bar}
                  style={{
                    height: `${(val / maxVal) * 100}%`,
                    background: `linear-gradient(180deg, ${color}cc, ${color})`,
                  }}
                />
              </div>
              <span className={styles.barLabel}>{d.label}</span>
              {d.count !== undefined && d.volume !== undefined && (
                <span className={styles.barCount}>{d.count} txns</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TopDonors({ donors }) {
  if (!donors.length) return null;
  return (
    <div className={styles.tableWrap}>
      <p className={styles.sectionTitle}>Top 5 Donors</p>
      <table className={styles.table}>
        <thead>
          <tr><th>#</th><th>Wallet</th><th>Total Donated (ETH)</th></tr>
        </thead>
        <tbody>
          {donors.map((d, i) => (
            <tr key={i}>
              <td>{i + 1}</td>
              <td className={styles.address}>
                {d.address.slice(0, 6)}...{d.address.slice(-4)}
              </td>
              <td>{d.amount} ETH</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function Metrics() {
  const { metrics, loading, error } = useMetrics();

  if (loading) {
    return (
      <div className={styles.centered}>
        <div className={styles.spinner} />
        <p>Fetching on-chain metrics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.centered}>
        <p className={styles.error}>Error: {error}</p>
      </div>
    );
  }

  if (!metrics) return null;

  const { tender, financial, donor, authorization, governance, performance, chart } = metrics;

  return (
    <div className={styles.page}>
      <Head><title>Fundchain — Metrics</title></Head>

      <div className={styles.header}>
        <h1 className={styles.title}>📊 Platform Metrics</h1>
        <p className={styles.subtitle}>Live on-chain performance data</p>
      </div>

      {/* ── Performance Metrics ── */}
      <section className={styles.section}>
        <h2 className={styles.sectionHeading}>⚡ Performance</h2>
        <div className={styles.grid}>
          <StatCard label="Total Transactions"   value={performance.totalTxns}        color="blue" />
          <StatCard label="Successful Txns"      value={performance.successfulTxns}   color="green" />
          <StatCard label="Failed Txns"          value={performance.failedTxns}       color="red" />
          <StatCard label="Tx Success Rate"      value={performance.txSuccessRate}    unit="%" color="green" sub="on-chain confirmed" />
          <StatCard label="Avg Gas / Tx"         value={performance.avgGasPerTx.toLocaleString()} color="yellow" sub="gas units" />
          <StatCard label="Total Gas Used"       value={performance.totalGasUsed.toLocaleString()} color="yellow" sub="all time" />
          <StatCard label="Avg Block Time"       value={performance.avgBlockTime}     unit=" s" color="purple" sub="confirmation latency" />
          <StatCard label="Contract Read Time"   value={performance.contractReadLatency} unit=" ms" color="blue" sub="fetch all events" />
          <StatCard label="ABI Decode Time"      value={performance.marshalLatency}   unit=" ms" color="purple" sub="marshal/unmarshal" />
        </div>

        {/* Throughput chart */}
        <div style={{ marginTop: "1.5rem" }}>
          <BarChart
            data={performance.throughputLast7Days}
            title="Transaction Throughput — Last 7 Days"
            color="#a78bfa"
          />
        </div>
      </section>

      {/* ── Tender / Protocol Metrics ── */}
      <section className={styles.section}>
        <h2 className={styles.sectionHeading}>📋 Tender Performance</h2>
        <div className={styles.grid}>
          <StatCard label="Protocols Submitted"    value={tender.totalProtocols}       color="blue" />
          <StatCard label="Pending Protocols"      value={tender.pendingProtocols}      color="yellow" />
          <StatCard label="Tenders Created"        value={tender.totalTenders}          color="blue" />
          <StatCard label="Active Tenders"         value={tender.activeTenders}         color="green" />
          <StatCard label="Successful Tenders"     value={tender.successfulTenders}     color="green" />
          <StatCard label="Failed Tenders"         value={tender.failedTenders}         color="red" />
          <StatCard label="Success Rate"           value={tender.tenderSuccessRate}     unit="%" color="green" />
          <StatCard label="Protocol Approval Rate" value={tender.protocolApprovalRate}  unit="%" color="purple" sub="protocols → tenders" />
          <StatCard label="Avg Raised / Tender"    value={tender.avgRaisedPerTender}    unit=" ETH" color="blue" />
          <StatCard label="Avg Target Size"        value={tender.avgTargetSize}         unit=" ETH" color="blue" />
        </div>
      </section>

      {/* ── Financial Metrics ── */}
      <section className={styles.section}>
        <h2 className={styles.sectionHeading}>💰 Financial Overview</h2>
        <div className={styles.grid}>
          <StatCard label="Total Volume"   value={financial.totalVolume}   unit=" ETH" color="green" sub="all-time donations" />
          <StatCard label="TVL"            value={financial.tvl}           unit=" ETH" color="blue"  sub="currently locked" />
          <StatCard label="Total Refunded" value={financial.totalRefunded} unit=" ETH" color="red" />
          <StatCard label="Total Settled"  value={financial.totalSettled}  unit=" ETH" color="yellow" sub="via requests" />
          <StatCard label="Refund Rate"    value={financial.refundRate}    unit="%"    color="red" />
        </div>
      </section>

      {/* ── Donor Metrics ── */}
      <section className={styles.section}>
        <h2 className={styles.sectionHeading}>👥 Donor Insights</h2>
        <div className={styles.grid}>
          <StatCard label="Total Donations"  value={donor.totalDonations}     color="blue" />
          <StatCard label="Unique Donors"    value={donor.uniqueDonors}       color="purple" />
          <StatCard label="Returning Donors" value={donor.returningDonors}    color="green" sub="donated to 2+ tenders" />
          <StatCard label="Retention Rate"   value={donor.donorRetentionRate} unit="%" color="green" />
          <StatCard label="Avg Donation"     value={donor.avgDonationSize}    unit=" ETH" color="blue" />
        </div>
        <TopDonors donors={donor.topDonors} />
      </section>

      {/* ── Authorization Metrics ── */}
      <section className={styles.section}>
        <h2 className={styles.sectionHeading}>🔐 Authorization</h2>
        <div className={styles.grid}>
          <StatCard label="Roles Granted"        value={authorization.totalGranted}        color="green" />
          <StatCard label="Roles Revoked"        value={authorization.totalRevoked}        color="red" />
          <StatCard label="Active Authorizers"   value={authorization.activeAuthorizers}   color="blue" />
          <StatCard label="Protocol Approval Rate"   value={authorization.campaignApprovalRate}   unit="%" color="green" />
          <StatCard label="Protocol Rejection Rate"  value={authorization.campaignRejectionRate}  unit="%" color="red" />
          {authorization.topAuthorizer && (
            <StatCard
              label="Top Authorizer"
              value={`${authorization.topAuthorizer.address.slice(0,6)}...${authorization.topAuthorizer.address.slice(-4)}`}
              sub={`${authorization.topAuthorizer.count} validations`}
              color="purple"
            />
          )}
        </div>
      </section>

      {/* ── Governance Metrics ── */}
      <section className={styles.section}>
        <h2 className={styles.sectionHeading}>🗳️ Governance & Requests</h2>
        <div className={styles.grid}>
          <StatCard label="Total Requests"      value={governance.totalRequests}        color="blue" />
          <StatCard label="Settled Requests"    value={governance.totalSettledRequests} color="green" />
          <StatCard label="Settlement Rate"     value={governance.requestSettlementRate} unit="%" color="green" />
          <StatCard label="Total Votes Cast"    value={governance.totalVotes}           color="purple" />
          <StatCard label="Avg Votes / Request" value={governance.avgVotesPerRequest}   color="blue" />
        </div>
      </section>

      {/* ── Charts ── */}
      <section className={styles.section}>
        <BarChart
          data={chart.donationsLast7Days}
          title="Donations — Last 7 Days"
          color="#3b82f6"
        />
      </section>
    </div>
  );
}