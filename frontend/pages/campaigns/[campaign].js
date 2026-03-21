import { useState, useEffect } from "react";
import Image from "next/image";
import Navbar from "../Navbar/Navbar";
import styles from "./campaign.module.css";
import { Card, Row, Col, Button, Text, Loading } from "@nextui-org/react";
import { useCampaign } from "../../context/CampaignContext";
import DonationLog from "../../components/logs/DonationLog";
import { useRouter } from "next/router";
import { utils } from "ethers";
import Request from "./requests/Request";

const campaign = () => {
  const router = useRouter();
  const { query, isReady } = router;
  const { campaign } = query;

  const [details, setDetails]           = useState([]);
  const [loading, setLoading]           = useState(false);
  const [amount, setAmount]             = useState();
  const [yourDonation, setYourDonation] = useState(0);
  const [campaignBalance, setBalance]   = useState(0);
  const [donorComp, setDonorComp]       = useState(false);
  const [reqComp, setReqComp]           = useState(false);

  const { getTenderInfo, donateToCampaign, getYourDonation, refund, getContractBalance } = useCampaign();

  useEffect(() => {
    if (!isReady || !campaign || campaign === "undefined") return;
    async function getDetails() {
      try {
        const info = await getTenderInfo(`${campaign}`);
        if (!info) return;
        setDetails(info);
        setYourDonation(await getYourDonation(`${campaign}`));
        setBalance(await getContractBalance(`${campaign}`));
        setLoading(true);
      } catch (e) {
        console.error("getDetails error:", e.message);
      }
    }
    getDetails();
  }, [isReady, campaign, loading]);

  const getStatus = () => {
    if (!details.length) return null;
    const now      = Math.floor(Date.now() / 1000);
    const deadline = parseInt(details[3]);
    const raised   = parseFloat(utils.formatEther(details[5]));
    const target   = parseFloat(utils.formatEther(details[2]));

    if (deadline < now && raised < target) return {
      label: "❌ Campaign Failed — Target not met. Donors can claim refunds.",
      style: { background: "#fee2e2", border: "1px solid #fca5a5", color: "#b91c1c" }
    };
    if (deadline < now && raised >= target) return {
      label: "✅ Campaign Successful — Target reached! Owner can create a withdrawal request.",
      style: { background: "#dcfce7", border: "1px solid #86efac", color: "#166534" }
    };
    const hoursLeft = Math.floor((deadline - now) / 3600);
    const daysLeft  = Math.floor(hoursLeft / 24);
    return {
      label: `⏳ Campaign Active — ${daysLeft > 0 ? `${daysLeft} days` : `${hoursLeft} hours`} remaining`,
      style: { background: "#dbeafe", border: "1px solid #93c5fd", color: "#1e40af" }
    };
  };

  const status = getStatus();

  return (
    <div className={styles.main}>
      <Navbar />

      <div className={styles.center}>
        {details.length > 0 && campaign && loading ? (
          <>
            <h1 className={styles.heading}>Campaign Details</h1>

          

            <hr className={styles.line} />

            {/* Contract info */}
            <div className={styles.font}>
              <div style={{ color: "#64748b", fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "4px" }}>Contract Address</div>
              <div style={{ fontFamily: "monospace", fontSize: "0.88rem", color: "#0f172a", marginBottom: "18px", wordBreak: "break-all" }}>{campaign}</div>
              <div style={{ display: "flex", gap: "32px", flexWrap: "wrap" }}>
                <div>
                  <div style={{ color: "#64748b", fontSize: "0.75rem", marginBottom: "3px" }}>Authorizer</div>
                  <div style={{ fontFamily: "monospace", fontSize: "0.85rem", color: "#2563eb" }}>{details[0]}</div>
                </div>
                <div>
                  <div style={{ color: "#64748b", fontSize: "0.75rem", marginBottom: "3px" }}>Owner</div>
                  <div style={{ fontFamily: "monospace", fontSize: "0.85rem", color: "#2563eb" }}>{details[8]}</div>
                </div>
              </div>
            </div>

            {/* Verified + target */}
            <div style={{ display: "flex", alignItems: "center", gap: "16px", margin: "20px 0 8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Image src={"/bluetick.png"} height={22} width={22} quality={100} alt="verified" priority />
                <span style={{ fontSize: "0.85rem", color: "#16a34a", fontWeight: 500 }}>Verified</span>
              </div>
              <div className={styles.target}>
                TARGET: {utils.formatEther(`${details[2]}`)} ETH
              </div>
            </div>

            {/* Stats grid */}
            <div className={styles.font} style={{ marginTop: "12px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "16px" }}>
                {[
                  { label: "Min. Contribution", value: `${utils.formatEther(details[4])} ETH` },
                  { label: "Amount Raised",     value: `${utils.formatEther(details[5])} ETH` },
                  { label: "Deadline",          value: new Date(parseInt(details[3] * 1000)).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) },
                  { label: "Donors",            value: details[6].toString() },
                  { label: "Requests",          value: details[7].toString() },
                ].map((item) => (
                  <div key={item.label}>
                    <div style={{ fontSize: "0.72rem", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "4px" }}>{item.label}</div>
                    <div style={{ fontSize: "0.98rem", fontWeight: 500, color: "#0f172a" }}>{item.value}</div>
                  </div>
                ))}
                <div>
                  <div style={{ fontSize: "0.72rem", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "4px" }}>Application</div>
                  <a href={details[1]} target="_blank" style={{ fontSize: "0.95rem", fontWeight: 500, color: "#2563eb", textDecoration: "none" }}>View Protocol →</a>
                </div>
              </div>
            </div>

            {/* Status banner */}
            {status && (
              <div style={{ ...status.style, borderRadius: "10px", padding: "12px 20px", fontSize: "0.9rem", fontWeight: 500, margin: "20px 0" }}>
                {status.label}
              </div>
            )}

            {/* Donate */}
            <div className={styles.donateForm}>
              <div style={{ fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "12px", fontWeight: 500 }}>
                Make a Donation
              </div>
              <input
                type="number"
                placeholder={`Min. ${details[4] ? utils.formatEther(details[4]) : "0"} ETH`}
                onChange={(e) => setAmount(e.target.value)}
              />
              <div style={{ marginTop: "14px" }}>
                <Button
                  shadow color="primary"
                  css={{ borderRadius: "8px", fontWeight: 500 }}
                  onPress={async () => {
                    const minContribution = details[4] ? parseFloat(utils.formatEther(details[4])) : 0;
                    const deadline        = details[3] ? parseInt(details[3]) * 1000 : 0;
                    const enteredAmount   = parseFloat(amount);
                    if (Date.now() > deadline) { alert("Donation period is over."); return; }
                    if (!enteredAmount || enteredAmount < minContribution) { alert("Amount must meet the minimum contribution."); return; }
                    try {
                      await donateToCampaign(campaign, amount);
                      setTimeout(() => setLoading((prev) => !prev), 2500);
                    } catch (e) { console.error(e); }
                  }}
                  auto
                >
                  Donate
                </Button>
              </div>
            </div>

            {/* Contribution card */}
            <div className={styles.donationdiv}>
              <Card css={{ borderRadius: "14px", border: "1px solid #e2e8f0", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
                <Card.Body css={{ padding: "20px 24px" }}>
                  <div style={{ fontSize: "0.75rem", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "12px" }}>Your Position</div>
                  <div style={{ display: "flex", gap: "40px" }}>
                    <div>
                      <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginBottom: "4px" }}>Campaign Balance</div>
                      <div style={{ fontSize: "1.15rem", fontWeight: 600, color: "#0f172a" }}>{campaignBalance} ETH</div>
                    </div>
                    <div>
                      <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginBottom: "4px" }}>Your Contribution</div>
                      <div style={{ fontSize: "1.15rem", fontWeight: 600, color: "#0f172a" }}>{yourDonation} ETH</div>
                    </div>
                  </div>
                </Card.Body>
                <Card.Footer css={{ padding: "0 24px 20px", borderTop: "none" }}>
                  <Button color="error" flat auto css={{ borderRadius: "8px" }} onPress={async () => { await refund(`${campaign}`); }}>
                    Request Refund
                  </Button>
                </Card.Footer>
              </Card>
            </div>

            <hr className={styles.line} />

            {/* Log nav */}
            <div className={styles.navbar}>
              <Button color="primary" ghost auto css={{ borderRadius: "8px" }}
                onPress={() => { setDonorComp(true); setReqComp(false); window.scroll({ top: 600, behavior: "smooth" }); }}>
                Campaign Donation Log
              </Button>
              <Button color="primary" ghost auto css={{ borderRadius: "8px" }}
                onPress={() => { setReqComp(true); setDonorComp(false); window.scroll({ top: 600, behavior: "smooth" }); }}>
                Campaign Request Log
              </Button>
            </div>

            <div className={styles.log}>
              {donorComp && <DonationLog campaignAddress={campaign} />}
              {reqComp && <Request campaignAddress={campaign} owner={details[8]} />}
            </div>
          </>
        ) : (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
            <Loading loadingCss={{ $$loadingSize: "80px", $$loadingBorder: "8px" }} />
          </div>
        )}
      </div>
    </div>
  );
};

export default campaign;