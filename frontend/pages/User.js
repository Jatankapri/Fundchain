import Navbar from "./Navbar/Navbar";
import styles from "../styles/User.module.css";
import Image from "next/image";
import { Text } from "@nextui-org/react";

const User = () => {
  return (
    <>
      <Navbar />
      <div className={styles.main}>
        <h1 className={styles.heading}>USER GUIDELINES</h1>
      </div>

      <div className={styles.body}>
        <h2>
          How Donorchain works{" "}
          <big>
            <i>?</i>
          </big>
        </h2>
        The Donorchain system consists of three main participants: <b>Admin </b>
        , <b>Authorizers</b> and <b>Users</b> .
        <br />
        Their roles and responsibilities are as follows:
        <br />
        <br />
        <h3>1. ADMIN</h3>
        <div className={styles.paragraph}>
          The <b>Admin</b> is responsible for deploying the entire system and
          managing authorizers by assigning or revoking their access. Since
          Donorchain is a decentralized system, the Admin cannot modify or
          delete donation details or requests. The identity of the Admin remains
          anonymous.
        </div>
        <br />
        <h3>2. AUTHORIZERS</h3>
        <div className={styles.paragraph}>
          <b>Authorizers</b> are designated by the Admin and are responsible for
          verifying donation requests. Only after successful verification by an
          authorizer will a donation request be displayed to users for
          contributions. The identities of Authorizers remain anonymous.
        </div>
        <br />
        <h3>3. USERS</h3>
        <div className={styles.paragraph}>
          <b>Users</b> are individuals who interact with the system to either
          request donations or make donations to verified beneficiaries. They
          can track all transactions transparently, ensuring security and trust
          in the donation process.
        </div>
        <br />
        <h2>
          How to use Donorchain{" "}
          <big>
            <i>?</i>
          </big>
        </h2>
        <h3> 1. Creating a Donation Request</h3>
        To request a donation, navigate to the <b>Create</b> section in the
        Navbar and fill out the required form.
        <div className={styles.paragraph}>
          <Image
            src={"/registration.png"}
            height={700}
            width={1300}
            quality={100}
            className={styles.image}
            alt="image"
          ></Image>
          <br />
        </div>
        Once submitted, you can check your registered campaign status in the{" "}
        <i>Application Status</i> section.
        <br />
        <br />
        <Image
          src={"/check.png"}
          height={700}
          width={1300}
          quality={100}
          className={styles.image}
          alt="image"
        ></Image>
        <br />
        <br />
        <hr className={styles.line}></hr>
        <br />
        <h3>
          <b>2.</b> Checking Application Status
        </h3>
        <Image
          src={"/applicationStatus.png"}
          height={700}
          width={1300}
          quality={100}
          className={styles.image}
          alt="image"
        ></Image>
        <br />
        <br />
        <u>
          <b>Application History: </b>
        </u>{" "}
        Lists all submitted applications awaiting authorizer approval.
        <br />
        <u>
          <b>Deployed Campaign: </b>
        </u>{" "}
        Displays verified campaigns ready for public donations.
        <br />
        <hr className={styles.line}></hr>
        <br />
        <h3>3. Exploring Campaigns </h3>
        Click on <b>Campaigns</b> in the Navbar to browse all verified
        campaigns.
        <br />
        <Image
          src={"/campaignPage.png"}
          height={700}
          width={1300}
          quality={100}
          className={styles.image}
          alt="image"
        ></Image>
        <br />
        In this page a number of verified campaigns are displayed. You can
        search for campaigns based on categories using the search bar.
        <br />
        <br />
        <hr className={styles.line}></hr>
        <br />
        <h3>4. Viewing Campaign Details </h3>
        Clicking on a campaigns will open its details page, where you can see
        information like the authorizer’s address, campaign owner, target
        amount, and deadline.
        <br />
        <br />
        {/* <hr className={styles.line}></hr> */}
        <b>4.1</b> How To Donate{" "}
        <b>
          <i>?</i>
        </b>
        <br />
        <br />
        <div className={styles.donate}>
          <Image
            src={"/howToDonate.png"}
            height={500}
            width={500}
            quality={100}
            className={styles.image}
            alt="image"
          ></Image>

          <div className={styles.sideInfo}>
            - View detailed campaign information in the Campaign Details
            section.
            <br />- To access related documents Click{" "}
            <Text style={{ color: "blue" }}>View Protocol.</Text>- Enter the
            donation amount and click{" "}
            <font
              style={{
                border: "1px solid grey",
                color: "grey",
                padding: "5px",
              }}
            >
              Amount
            </font>{" "}
            <br />
            - Your crypto wallet will prompt you to confirm the transaction.
            <br />- After confirmation, the transaction is processed, and
            details can be tracked on{" "}
            <a href="https://mumbai.polygonscan.com/" target="_blank">
              POLYGONSCAN
            </a>
          </div>
        </div>
        <br />
        <b>4.2</b> Viewing Donation Records <br />
        To see a list of donors, donation amounts, and timestamps you can Click{" "}
        <Text
          style={{
            padding: "5px",
            color: "blue",
            border: "1px solid blue",
            borderRadius: "10px",
          }}
        >
          {" "}
          Campaign Donation Log
        </Text>
        You can also search donations by donor address.
        <br />
        <br />
        <Image
          src={"/campaignDonationLog.png"}
          height={700}
          width={1300}
          quality={100}
          className={styles.image}
          alt="image"
        ></Image>
        <br />
        <br />
        <hr className={styles.line}></hr>
        <br />
        <h3>5. Requesting Withdrawals</h3>
        <Image
          src={"/campaignRequestLog.png"}
          height={700}
          width={1300}
          quality={100}
          className={styles.image}
          alt="image"
        ></Image>
        <br />
        <br />
        To withdraw donated funds, go to{" "}
        <Text
          style={{
            padding: "5px",
            color: "blue",
            border: "1px solid blue",
            borderRadius: "10px",
          }}
        >
          Donation Request Log
        </Text>
        As shown in picture, a form and a table will be seen in the same page at
        the bottom.
        <br />- The <b>Activity Log</b> table shows received donations along
        with transaction dates.
        <br />- Fill out the withdrawal request form and click{" "}
        <Text
          style={{
            padding: "5px",
            color: "white",
            background: "blue",
            border: "1px solid none",
            borderRadius: "10px",
          }}
        >
          CREATE REQUEST
        </Text>
        <br />
        <br />
      </div>
    </>
  );
};

export default User;
