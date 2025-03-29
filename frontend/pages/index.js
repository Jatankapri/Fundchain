import styles from "../styles/Index.module.css";
import Head from "next/head";
import { Web3Button } from "@web3modal/react";
import logo from "../public/logo.png";
import Image from "next/image";
import { useAccount, useProvider } from "wagmi";
import { useRouter } from "next/router";
import { getFactoryContract } from "../hooks/useContract";
import { useEffect } from "react";

export default function Home() {
  const { address, isConnected } = useAccount();
  const provider = useProvider();

  const router = useRouter();
  const FactoryContract = getFactoryContract(provider);

  async function getRole() {
    try {
      if (isConnected && address) {
        const role = await FactoryContract.authoirzerRoles(`${address}`);
        console.log("role", role);
        if (role == "granted") {
          router.push(`/Authorizer`);
        } else if (role == "admin") {
          router.push(`/Admin`);
        } else {
          router.push(`/User`);
        }
      }
    } catch (error) {
      alert("Proceed to connecting your wallet....");
      console.log( "proceed",error);
    }
  }

  useEffect(() => {
    getRole();
  }, [address, isConnected]);

  return (
    <div className={styles.container}>
      <Head>
        <title>donorchain.com</title>
        <link rel="icon" href="/ico.svg" />
      </Head>
      <div className={styles.div1}>
        <Image src={logo} alt="logo" width={550} height={800} />
      </div>
      <div className={styles.div2}>
        <div>
          <h1 className={styles.h1}>Welcome!</h1>
        </div>

        <div className={styles.button}>
          <Web3Button />
        </div>
      </div>
    </div>
  );
}
