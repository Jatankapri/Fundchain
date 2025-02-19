import { Web3Button } from "@web3modal/react";
import Image from "next/image";
import styles from "../styles/authorizer.module.css";
import RegistrationLogs from "../components/logs/RegistrationLogs";
import { useFactory } from "../context/CampaignFactory";

const Authorizer = () => {
  const { getProtocols } = useFactory();
  return (
    <>
      <div className={styles.navbar}>
        <div
          style={{
            marginLeft: "-5%",
          }}
        >
          <Image
            src={"/navbarLogo.png"}
            height={150}
            width={400}
            quality={100}
            alt={"image"}
          ></Image>
        </div>

        <font className={styles.heading}>AUTHORIZER</font>

        <div className={styles.option}>
          <Web3Button />
        </div>
      </div>

      <div className={styles.body}>
        <h1 className={styles.bodyHead}>Campaigns Verifications</h1>
      </div>
      <RegistrationLogs getDatas={getProtocols} />
    </>
  );
};

export default Authorizer;
