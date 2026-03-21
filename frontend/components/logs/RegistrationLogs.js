import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useFactory } from "../../context/CampaignFactory";
import { Loading } from "@nextui-org/react";

const styles = {
  wrap: { background: "#fff", border: "1px solid #e2e8f0", borderRadius: "16px", overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" },
  header: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 28px", borderBottom: "1px solid #f1f5f9" },
  title: { fontFamily: "'Playfair Display', serif", fontSize: "1rem", fontWeight: 700, color: "#0f172a", margin: 0 },
  count: { fontSize: "0.75rem", color: "#64748b", background: "#f1f5f9", padding: "3px 10px", borderRadius: "100px" },
  loadingWrap: { display: "flex", justifyContent: "center", padding: "40px" },
  empty: { textAlign: "center", padding: "48px", color: "#94a3b8", fontSize: "0.9rem" },
  tableWrap: { overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" },
};

const RegistrationLogs = ({ getDatas }) => {
  const { validateProtocolOf } = useFactory();

  const [loading, setLoading]     = useState(false);
  const [datas, setDatas]         = useState([]);
  const [reRender, setRender]     = useState(false);
  const [actionIdx, setActionIdx] = useState(null);

  const authorize = async (address, protocolNum, index) => {
    setActionIdx(index);
    await validateProtocolOf(address, protocolNum);
    setTimeout(() => {
      setActionIdx(null);
      setLoading(false);
      setRender((prev) => !prev);
    }, 2500);
  };

  useEffect(() => {
    async function call() {
      const data = await getDatas();
      setDatas(data || []);
      setLoading(true);
    }
    call();
  }, [loading, reRender]);

  const filtered = datas.filter(
    (e) => e[4] !== "0x0000000000000000000000000000000000000000"
  );

  return (
    <div style={styles.wrap}>
      <div style={styles.header}>
        <h3 style={styles.title}>Pending Applications</h3>
        <span style={styles.count}>{filtered.length} pending</span>
      </div>

      {!loading ? (
        <div style={styles.loadingWrap}>
          <Loading type="spinner" size="lg" />
        </div>
      ) : filtered.length === 0 ? (
        <div style={styles.empty}>
          <div style={{ fontSize: "2rem", marginBottom: "8px" }}>📋</div>
          <p style={{ margin: 0 }}>No pending applications at the moment.</p>
        </div>
      ) : (
        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr>
                {["Applicant Address", "Application No.", "Document", "Status", "Action"].map((h) => (
                  <th key={h} style={{ textAlign: "left", padding: "12px 18px", fontSize: "0.7rem", fontWeight: 500, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", borderBottom: "1px solid #f1f5f9", background: "#fafafa", whiteSpace: "nowrap" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((e, index) => {
                const isBusy = actionIdx === index;
                return (
                  <tr key={index} style={{ borderBottom: "1px solid #f8fafc" }}>
                    <td style={{ padding: "16px 18px", fontFamily: "monospace", fontSize: "0.82rem", color: "#2563eb" }}>
                      {e[4].slice(0, 10)}...{e[4].slice(-6)}
                    </td>
                    <td style={{ padding: "16px 18px", fontFamily: "monospace", fontWeight: 600, color: "#0f172a" }}>
                      #{e[8].toString()}
                    </td>
                    <td style={{ padding: "16px 18px" }}>
                      <Link href={e[0]} passHref legacyBehavior>
                        <a target="_blank" rel="noopener noreferrer"
                          style={{ fontSize: "0.85rem", color: "#2563eb", fontWeight: 500, textDecoration: "none" }}>
                          Preview →
                        </a>
                      </Link>
                    </td>
                    <td style={{ padding: "16px 18px" }}>
                      <span style={{ display: "inline-block", padding: "4px 12px", borderRadius: "100px", fontSize: "0.75rem", fontWeight: 500, background: "#fef9c3", color: "#a16207" }}>
                        ⏳ Pending
                      </span>
                    </td>
                    <td style={{ padding: "16px 18px" }}>
                      <button
                        disabled={isBusy}
                        onClick={() => authorize(e[4], e[8].toString(), index)}
                        style={{ padding: "8px 20px", background: isBusy ? "#86efac" : "#16a34a", color: "#fff", border: "none", borderRadius: "8px", fontSize: "0.85rem", fontWeight: 500, cursor: isBusy ? "not-allowed" : "pointer", fontFamily: "'DM Sans', sans-serif", transition: "background 0.15s" }}
                      >
                        {isBusy ? "Processing..." : "Authorize"}
                      </button>
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

export default RegistrationLogs;