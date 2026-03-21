import { Web3Button } from "@web3modal/react";
import Image from "next/image";
import styles from "../styles/authorizer.module.css";
import RegistrationLogs from "../components/logs/RegistrationLogs";
import { useFactory } from "../context/CampaignFactory";

const Authorizer = () => {
  const { getProtocols } = useFactory();

  return (
    <div className={styles.page}>

      {/* ── Navbar ── */}
      <nav className={styles.navbar}>
        <div className={styles.navLogo}>
          <Image src={"/navbarLogo.png"} height={110} width={300} quality={100} alt="logo" priority />
        </div>
        <span className={styles.navTitle}>Authorizer Panel</span>
        <div className={styles.navRight}>
          <Web3Button />
        </div>
      </nav>

      {/* ── Hero ── */}
      <div className={styles.hero}>
        <div className={styles.heroInner}>
          <span className={styles.heroTag}>Authorizer</span>
          <h1 className={styles.heroTitle}>Campaign Verifications</h1>
          <p className={styles.heroSub}>
            Review pending campaign applications and approve or reject them.
            Only verified campaigns are shown to donors.
          </p>
        </div>
      </div>

      {/* ── Content ── */}
      <div className={styles.container}>
        <RegistrationLogs getDatas={getProtocols} />
      </div>

    </div>
  );
};

export default Authorizer;