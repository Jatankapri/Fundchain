import { useState, useEffect } from "react";
import Image from "next/image";
import Navbar from "../Navbar/Navbar";
import styles from "./campaign.module.css";
import {
  Card,
  Row,
  Col,
  Button,
  Text,
  Loading,
  Collapse,
} from "@nextui-org/react";
import { useCampaign } from "../../context/CampaignContext";
import DonationLog from "../../components/logs/DonationLog";
import { useRouter } from "next/router";
import { utils } from "ethers";
import Request from "./requests/Request";

const campaign = () => {
  const router = useRouter();
  const { query } = router;
  const { campaign } = query;
  const [details, setDetails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState();
  const [yourDonation, setYourDonation] = useState(0);
  const [campaignBalance, setBalance] = useState(0);

  const [donorComp, setDonorComp] = useState(false);
  const [reqComp, setReqComp] = useState(false);

  const {
    getTenderInfo,
    donateToCampaign,
    getYourDonation,
    refund,
    getContractBalance,
  } = useCampaign();

  useEffect(() => {
    async function getDetails() {
      console.log(await getTenderInfo(`${campaign}`));
      setDetails(await getTenderInfo(`${campaign}`));
      setYourDonation(await getYourDonation(`${campaign}`));
      setBalance(await getContractBalance(`${campaign}`));
      setLoading(true);
    }
    getDetails();
  }, [loading]);

  return (
    <div className={styles.main}>
      <Navbar />

      <div className={styles.center}>
        {(details && campaign) != undefined && loading ? (
          <>
            <h1 className={styles.heading}>Campaign Details</h1>

            <br />

            <div className={styles.sidediv}>
              <Card css={{ w: "100%", h: "420px" }}>
                <Card.Header css={{ position: "absolute", zIndex: 1, top: 5 }}>
                  <Col>
                    <Text
                      h5
                      weight="bold"
                      transform="uppercase"
                      color="#ffffffAA"
                    >
                      Transfer From Your Mobile Wallet
                    </Text>
                  </Col>
                </Card.Header>
                <Card.Body css={{ p: 0 }}>
                  <Card.Image
                    src="/bu.jpg"
                    width="100%"
                    height="100%"
                    objectFit="cover"
                    alt="Card example background"
                  />
                </Card.Body>
                <Card.Footer
                  isBlurred
                  css={{
                    position: "absolute",
                    bgBlur: "#ffffff66",
                    borderTop:
                      "$borderWeights$light solid rgba(255, 255, 255, 0.2)",
                    bottom: 0,
                    zIndex: 1,
                  }}
                >
                  <Row>
                    <Col>
                      <Text color="#000" size={18}>
                        Available soon.
                      </Text>
                    </Col>
                    <Col>
                      <Row justify="flex-end">
                        <Button flat auto rounded color="secondary">
                          <Text
                            css={{ color: "inherit" }}
                            size={12}
                            weight="bold"
                            transform="uppercase"
                          >
                            Notify Me
                          </Text>
                        </Button>
                      </Row>
                    </Col>
                  </Row>
                </Card.Footer>
              </Card>
            </div>

            <hr className={styles.line} />
            <br />

            {/* <div className={styles.detail}> */}
            <font className={styles.font}>Contract Address : {campaign}</font>
            <br />

            <Text i css={{ color: "blue" }}>
              {" "}
              Authorizer: {details[0]}
            </Text>
            <br />
            <Text i css={{ color: "blue" }}>
              Owner: {details[8]}
            </Text>

            <br />
            <br />

            <h3>Verified</h3>

            <div className={styles.image}>
              <Image
                src={"/bluetick.png"}
                height={30}
                width={30}
                quality={100}
                alt={"logo"}
                priority
              ></Image>

              <span className={styles.target}>
                TARGET AMOUNT: {utils.formatEther(`${details[2]}`)} ETH
                <br />
              </span>
            </div>

            <br />
            <font className={styles.font}>
              Minimum Contribution: {utils.formatEther(details[4])} ETH
              <br />
              Amount Raised : {utils.formatEther(details[5])} ETH
              <br />
              Deadline : {new Date(parseInt(details[3] * 1000)).toString()}
              <br />
              Donors Count :{details[6].toString()}
              <br />
              No. of Requests: {details[7].toString()}
              <br />
              Application :{" "}
              <a href={details[1]} target="_blank">
                View Protocol
              </a>
              <br />
              
            </font>
            <br />
            <br />
            <form>
              <input
                type="number"
                placeholder="Amount"
                onChange={(e) => {
                  setAmount(e.target.value);
                }}
              ></input>

              <br />
              <br />
              <Button
                shadow
                color="primary"
                onPress={async () => {
                  const minContribution = details[4] ? parseFloat(utils.formatEther(details[4])) : 0;
                  const deadline = details[3] ? parseInt(details[3]) * 1000 : 0;
                  const currentTime = Date.now();
                  const enteredAmount = parseFloat(amount);
                  
                  if (currentTime > deadline) {
                    alert("Donation is closed as the campaign deadline has passed.");
                    return;
                  }
                  if (!enteredAmount || enteredAmount <= 0 || enteredAmount < minContribution) {
                    alert("Please enter a valid amount greater than or equal to the minimum contribution.");
                    return;
                  }
                  try {
                    await donateToCampaign(campaign, amount);
                    setTimeout(() => setLoading((prev) => !prev), 2500);
                  } catch (error) {
                    console.error("Donation failed:", error);
                  }
                }}
                auto
              >
                Donate
              </Button>
            </form>

            {/* Your donation part here */}
            <div className={styles.donationdiv}>
              <Card
                css={{
                  width: "40%",
                  height: "10%",
                }}
              >
                <Card.Body>
                  <Text b>
                    <big>Campaign Current Balance: {campaignBalance} ETH</big>
                  </Text>
                  <br />
                  <Text b>
                    <i>Your Contribution: {yourDonation} ETH</i>
                  </Text>
                </Card.Body>

                <Button
                  color="error"
                  css={{
                    width: "10%",
                    marginLeft: "35%",
                    marginBottom: "3%",
                  }}
                  shadow
                  auto
                  onPress={async () => {
                    await refund(`${campaign}`);
                  }}
                >
                  Refund
                </Button>
              </Card>
            </div>

            <br />
            <br />
            <br />
            <hr />
            <div className={styles.navbar}>
              <span>
                <Button
                  color="primary"
                  css={{
                    marginTop: "20px",
                    fontSize: "18px",
                  }}
                  auto
                  ghost
                  onPress={() => {
                    setDonorComp(true);
                    setReqComp(false);
                    window.scroll({
                      top: 500,
                      behavior: "auto",
                    });
                  }}
                >
                  Campaign Donation Log
                </Button>
              </span>

              <span>
                <Button
                  color="primary"
                  css={{
                    marginTop: "20px",
                    fontSize: "18px",
                  }}
                  auto
                  ghost
                  onPress={() => {
                    setReqComp(true);
                    setDonorComp(false);
                    window.scroll({
                      top: 800,
                      behavior: "auto",
                    });
                  }}
                >
                  Campaign RequestLog
                </Button>
              </span>
            </div>

            <div className={styles.log}>
              {donorComp && <DonationLog campaignAddress={campaign} />}
              {reqComp && (
                <Request campaignAddress={campaign} owner={details[8]} />
              )}
            </div>
          </>
        ) : (
          <Loading
            loadingCss={{ $$loadingSize: "100px", $$loadingBorder: "10px" }}
          />
        )}
      </div>
      <br />
    </div>
  );
};

export default campaign;
