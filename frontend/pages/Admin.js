import Image from "next/image";
import { Web3Button } from "@web3modal/react";
import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/router";
import styles from "../styles/Admin.module.css";
import { useFactory } from "../context/CampaignFactory";
import { Button, Input } from "@nextui-org/react";

const Admin = () => {
  const { grantRole, revokeRole, getAuthorizersCurrentRoles } = useFactory();
  const inputRef = useRef();
  const [authorizers, setAuthorizers] = useState([]);
  const [reRender, setRender]         = useState(false);
  const [isLoading, setIsLoading]     = useState(false);
  const router = useRouter();

  const fetchData = async () => {
    try {
      const data = await getAuthorizersCurrentRoles();
      setAuthorizers(data);
    } catch (e) {
      console.error("Error fetching authorizers:", e);
    }
  };

  useEffect(() => { fetchData(); }, [reRender]);

  const grantedList = authorizers.filter(a => a.role === "granted").map(a => a.address);
  const revokedList = authorizers.filter(a => a.role === "revoked").map(a => a.address);
  const maxLength   = Math.max(grantedList.length, revokedList.length);
  const paddedGranted = [...grantedList, ...Array(maxLength - grantedList.length).fill("")];
  const paddedRevoked = [...revokedList, ...Array(maxLength - revokedList.length).fill("")];

  const checkInput = () => {
    if (!inputRef.current.value.length) { alert("Please provide an account address!"); return false; }
    return true;
  };

  async function grantRoleFor() {
    if (!checkInput()) return;
    setIsLoading(true);
    try {
      await grantRole(inputRef.current.value);
      setTimeout(() => { setRender(p => !p); setIsLoading(false); }, 2000);
    } catch { alert("Unable to grant the role"); setIsLoading(false); }
  }

  async function revokeRoleFor() {
    if (!checkInput()) return;
    setIsLoading(true);
    try {
      await revokeRole(inputRef.current.value);
      setTimeout(() => { setRender(p => !p); setIsLoading(false); }, 2000);
    } catch { alert("Unable to revoke the role"); setIsLoading(false); }
  }

  return (
    <div className={styles.page}>

      {/* ── Navbar ── */}
      <nav className={styles.navbar}>
        <div className={styles.navLogo}>
          <Image src={"/navBarLogo.png"} height={110} width={300} quality={100} alt="logo" priority />
        </div>
        <span className={styles.navTitle}>Admin Panel</span>
        <div className={styles.navRight}>
          <button className={styles.metricsBtn} onClick={() => router.push("/Metrics")}>
            📊 View Metrics
          </button>
          <Web3Button />
        </div>
      </nav>

      {/* ── Hero ── */}
      <div className={styles.hero}>
        <div className={styles.heroInner}>
          <span className={styles.heroTag}>Administrator</span>
          <h1 className={styles.heroTitle}>Role Access Control</h1>
          <p className={styles.heroSub}>
            Grant or revoke authorizer roles to manage who can verify campaign applications.
          </p>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className={styles.container}>
        <div className={styles.grid}>

          {/* ── Input form ── */}
          <div className={styles.formCard}>
            <h2 className={styles.cardTitle}>Manage Roles</h2>
            <p className={styles.cardSub}>Enter a wallet address to grant or revoke the Authorizer role.</p>

            <div className={styles.inputWrap}>
              <label className={styles.label}>Wallet Address</label>
              <input
                ref={inputRef}
                type="text"
                placeholder="0x..."
                className={styles.input}
              />
            </div>

            <div className={styles.btnRow}>
              <button
                className={styles.grantBtn}
                onClick={grantRoleFor}
                disabled={isLoading}
              >
                {isLoading ? "Processing..." : "Grant Role"}
              </button>
              <button
                className={styles.revokeBtn}
                onClick={revokeRoleFor}
                disabled={isLoading}
              >
                {isLoading ? "Processing..." : "Revoke Role"}
              </button>
            </div>
          </div>

          {/* ── Table ── */}
          <div className={styles.tableCard}>
            <div className={styles.tableHeader}>
              <h2 className={styles.cardTitle}>Authorizer Registry</h2>
              <span className={styles.count}>{grantedList.length} active</span>
            </div>

            {maxLength === 0 ? (
              <div className={styles.empty}>
                <span>👥</span>
                <p>No authorizers assigned yet.</p>
              </div>
            ) : (
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Granted</th>
                      <th>Revoked</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paddedGranted.map((granted, i) => (
                      <tr key={i}>
                        <td className={styles.addrGranted}>{granted || "—"}</td>
                        <td className={styles.addrRevoked}>{paddedRevoked[i] || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default Admin;