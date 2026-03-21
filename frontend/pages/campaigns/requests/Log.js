import React, { useState, useEffect } from "react";
import styles from "./index.module.css";
import { useCampaign } from "../../../context/CampaignContext";
import { useAccount } from "wagmi";
import { utils } from "ethers";
import { Button, Loading } from "@nextui-org/react";

const Log = ({ campaignAddress, owner }) => {
  const { address } = useAccount();
  const { getRequestStatus, voteRequestToCampaign, settleRequestOf } = useCampaign();

  const [log, setLog]         = useState([]);
  const [refresh, setRefresh] = useState(false);
  const [loadingLog, setLoadingLog] = useState(true);
  const [actionIdx, setActionIdx]   = useState(null); // tracks which row is busy

  useEffect(() => {
    async function call() {
      setLoadingLog(true);
      const data = await getRequestStatus(`${campaignAddress}`);
      setLog(data || []);
      setLoadingLog(false);
    }
    call();
  }, [refresh]);

  // Parse proof URL out of description if present
  const parseDescription = (raw) => {
    if (!raw) return { desc: "—", proof: null };
    const parts = raw.split(" | Proof: ");
    return {
      desc:  parts[0] || raw,
      proof: parts[1] || null,
    };
  };

  return (
    <div className={styles.logWrap}>
      <div className={styles.logHeader}>
        <h3 className={styles.logTitle}>Payment Request Log</h3>
        <span className={styles.logCount}>{log.length} request{log.length !== 1 ? "s" : ""}</span>
      </div>

      {loadingLog ? (
        <div className={styles.logLoading}>
          <Loading type="spinner" size="lg" />
        </div>
      ) : log.length === 0 ? (
        <div className={styles.logEmpty}>
          No withdrawal requests have been created yet.
        </div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>#</th>
                <th>Description</th>
                <th>Recipient</th>
                <th>Amount</th>
                <th>Votes</th>
                <th>Proof</th>
                <th>Status</th>
                <th>Vote</th>
                <th>Settle</th>
              </tr>
            </thead>
            <tbody>
              {log.map((e, index) => {
                const { desc, proof } = parseDescription(e[5]);
                const completed       = e[1];
                const isBusy          = actionIdx === index;

                return (
                  <tr key={index} className={completed ? styles.rowDone : ""}>
                    <td>{index}</td>
                    <td className={styles.descCell}>{desc}</td>
                    <td className={styles.addrCell}>
                      {e[3].slice(0, 6)}...{e[3].slice(-4)}
                    </td>
                    <td>{utils.formatEther(e[2])} ETH</td>
                    <td>
                      <span className={styles.votes}>
                        {e[7].toString()} / {e[4].toString()}
                      </span>
                    </td>
                    <td>
                      {proof ? (
                        <a href={proof} target="_blank" rel="noopener noreferrer" className={styles.proofBadge}>
                          View
                        </a>
                      ) : (
                        <span className={styles.noProof}>—</span>
                      )}
                    </td>
                    <td>
                      <span className={`${styles.statusBadge} ${completed ? styles.statusDone : styles.statusPending}`}>
                        {completed ? "Settled" : "Pending"}
                      </span>
                    </td>
                    <td>
                      {!completed && (
                        <Button
                          auto flat color="primary" size="sm"
                          css={{ borderRadius: "7px", minWidth: "60px" }}
                          disabled={isBusy}
                          onPress={async () => {
                            setActionIdx(index);
                            await voteRequestToCampaign(campaignAddress, index);
                            setTimeout(() => { setRefresh((p) => !p); setActionIdx(null); }, 4000);
                          }}
                        >
                          {isBusy ? "..." : "Vote"}
                        </Button>
                      )}
                    </td>
                    <td>
                      {!completed && address === owner && (
                        <Button
                          auto flat color="success" size="sm"
                          css={{ borderRadius: "7px", minWidth: "70px" }}
                          disabled={isBusy}
                          onPress={async () => {
                            setActionIdx(index);
                            await settleRequestOf(campaignAddress, index);
                            setTimeout(() => { setRefresh((p) => !p); setActionIdx(null); }, 4000);
                          }}
                        >
                          {isBusy ? "..." : "Settle"}
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Log;