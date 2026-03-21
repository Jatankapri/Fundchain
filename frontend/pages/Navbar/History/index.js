import React, { useState, useEffect } from "react";
import Navbar from "../Navbar";
import Link from "next/link";
import styles from "./History.module.css";
import { ethers, Contract } from "ethers";
import { factoryAddress, factoryAbi } from "../../../constants";
import { useAccount } from "wagmi";

const History = () => {
  const { address } = useAccount();

  const provider =
    typeof window === "undefined"
      ? ethers.getDefaultProvider()
      : new ethers.providers.Web3Provider(window.ethereum);

  const contract = new Contract(factoryAddress, factoryAbi, provider);

  const [campaignLog, setClog] = useState([]);
  const [regLog, setRlog]      = useState([]);
  const [loading, setLoading]  = useState(true);

  useEffect(() => {
    if (!address) return;
    async function call() {
      setLoading(true);
      const filter  = contract.filters.CreatedTender(address, null, null, null, null);
      const filter2 = contract.filters.RegisteredProtocol(null, address, null, null);
      const [logs, logs2] = await Promise.all([
        contract.queryFilter(filter),
        contract.queryFilter(filter2),
      ]);
      setClog(logs);
      setRlog(logs2);
      setLoading(false);
    }
    call();
  }, [address]);

  const formatDate = (timestamp) =>
    new Date(parseInt(timestamp * 1000)).toLocaleDateString("en-US", {
      year: "numeric", month: "short", day: "numeric",
    });

  return (
    <div className={styles.page}>
      <Navbar />

      {/* ── Hero ── */}
      <div className={styles.hero}>
        <span className={styles.heroTag}>My Portal</span>
        <h1 className={styles.heroTitle}>Application Status</h1>
        <p className={styles.heroSub}>
          Track your submitted applications and deployed campaigns.
        </p>
      </div>

      <div className={styles.container}>

        {loading ? (
          <div className={styles.loadingWrap}>
            <div className={styles.spinner} />
            <p>Fetching your records...</p>
          </div>
        ) : (
          <>
            {/* ── Application History ── */}
            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Application History</h2>
                <span className={styles.badge}>{regLog.length}</span>
              </div>

              {regLog.length === 0 ? (
                <div className={styles.empty}>
                  <span className={styles.emptyIcon}>📋</span>
                  <p>No applications submitted yet.</p>
                </div>
              ) : (
                <div className={styles.tableWrap}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Application No.</th>
                        <th>Document</th>
                        <th>Registered Date</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {regLog.map((e, index) => {
                        // Check if this protocol was deployed (approved)
                        const isApproved = campaignLog.some(
                          (c) => c.args.owner?.toLowerCase() === address?.toLowerCase()
                        );
                        return (
                          <tr key={index}>
                            <td className={styles.numCell}>
                              #{e.args.regNumber.toString()}
                            </td>
                            <td>
                              <a
                                href={e.args.pdf}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.viewLink}
                              >
                                View Document →
                              </a>
                            </td>
                            <td className={styles.dateCell}>
                              {formatDate(e.args.registeredTime)}
                            </td>
                            <td>
                              <span className={`${styles.statusBadge} ${isApproved ? styles.statusApproved : styles.statusPending}`}>
                                {isApproved ? "✓ Approved" : "⏳ Pending"}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            {/* ── Deployed Campaigns ── */}
            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Deployed Campaigns</h2>
                <span className={styles.badge}>{campaignLog.length}</span>
              </div>

              {campaignLog.length === 0 ? (
                <div className={styles.empty}>
                  <span className={styles.emptyIcon}>🚀</span>
                  <p>No campaigns deployed yet. Submit an application to get started.</p>
                </div>
              ) : (
                <div className={styles.tableWrap}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Category</th>
                        <th>Contract Address</th>
                        <th>Created Date</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {campaignLog.map((e, index) => (
                        <tr key={index}>
                          <td>
                            <span className={styles.categoryTag}>
                              {e.args.category}
                            </span>
                          </td>
                          <td className={styles.addrCell}>
                            {e.args.deployedTender.slice(0, 10)}...
                            {e.args.deployedTender.slice(-6)}
                          </td>
                          <td className={styles.dateCell}>
                            {formatDate(e.args.createTime)}
                          </td>
                          <td>
                            <Link
                              href={`/campaigns/${e.args.deployedTender}`}
                              className={styles.viewLink}
                            >
                              Open Campaign →
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}

      </div>
    </div>
  );
};

export default History;