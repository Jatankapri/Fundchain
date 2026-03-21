import styles from "../styles/Index.module.css";
import Head from "next/head";
import { Web3Button } from "@web3modal/react";
import logo from "../public/logo.png";
import Image from "next/image";
import { useAccount, useProvider } from "wagmi";
import { useRouter } from "next/router";
import { getFactoryContract } from "../hooks/useContract";
import { useEffect, useState } from "react";

export default function Home() {
  const { address, isConnected } = useAccount();
  const provider  = useProvider();
  const router    = useRouter();
  const [checking, setChecking] = useState(false);

  async function getRole() {
    // Only run when wallet is fully connected
    if (!isConnected || !address || !provider) return;
    if (checking) return;

    setChecking(true);
    try {
      const FactoryContract = getFactoryContract(provider);
      if (!FactoryContract) return;

      const adminAddress = await FactoryContract.admin();
      console.log("admin:", adminAddress);
      console.log("connected:", address);

      if (adminAddress.toLowerCase() === address.toLowerCase()) {
        router.push(`/Admin`);
        return;
      }

      const role = await FactoryContract.authoirzerRoles(address);
      console.log("role:", role);

      if (role === "granted") {
        router.push(`/Authorizer`);
      } else {
        router.push(`/User`);
      }
    } catch (error) {
      console.log("getRole error:", error.message);
      // Only redirect if wallet is genuinely connected
      if (isConnected && address) {
        router.push(`/User`);
      }
    } finally {
      setChecking(false);
    }
  }

  useEffect(() => {
    getRole();
  }, [address, isConnected]); // only re-run when wallet state changes

  return (
    <div className={styles.container}>
      <Head>
        <title>Fundchain.com</title>
        <link rel="icon" href="/ico.svg" />
      </Head>
      <div className={styles.div1}>
        <Image src={logo} alt="logo" width={550} height={800} priority />
      </div>
      <div className={styles.div2}>
        <div>
          <h1 className={styles.h1}>Welcome!</h1>
        </div>
        <div className={styles.button}>
          <Web3Button />
        </div>
        {checking && (
          <p style={{ color: "#94a3b8", fontSize: "0.85rem", marginTop: "12px" }}>
            Detecting your role...
          </p>
        )}
      </div>
    </div>
  );
}