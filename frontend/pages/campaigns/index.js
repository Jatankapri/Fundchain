import Navbar from "../Navbar/Navbar";
import styles from "./campaigns.module.css";
import { useState, useEffect } from "react";
import { ethers, Contract } from "ethers";
import { factoryAddress, factoryAbi } from "../../constants";
import { useRouter } from "next/router";

const CATEGORIES = [
  "All",
  "Miscellaneous",
  "Education",
  "Health",
  "Sports",
  "Community support",
  "Woman",
];

const index = () => {
  const provider =
    typeof window === "undefined"
      ? ethers.getDefaultProvider()
      : new ethers.providers.Web3Provider(window.ethereum);

  const contract = new Contract(factoryAddress, factoryAbi, provider);
  const router   = useRouter();

  const [campaigns, setCampaigns] = useState([]);
  const [selected, setSelected]   = useState("All");
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    async function call() {
      setLoading(true);
      const logs = await contract.queryFilter("CreatedTender");
      setCampaigns(logs);
      setLoading(false);
    }
    call();
  }, []);

  const filtered = campaigns.filter((c) =>
    selected === "All" ? true : c.args.category === selected
  );

  const formatDate = (timestamp) =>
    new Date(parseInt(timestamp * 1000)).toLocaleDateString("en-US", {
      year: "numeric", month: "short", day: "numeric",
    });

  return (
    <div className={styles.page}>
      <Navbar />

      {/* ── Hero ── */}
      <div className={styles.hero}>
        <span className={styles.heroTag}>Verified Campaigns</span>
        <h1 className={styles.heroTitle}>
          Browse <span className={styles.heroAccent}>Campaigns</span>
        </h1>
        <p className={styles.heroSub}>
          All campaigns listed here have been verified by authorizers.
          Your donation goes directly to the beneficiary — no middlemen.
        </p>
      </div>

      {/* ── Filter ── */}
      <div className={styles.filterWrap}>
        <div className={styles.filterRow}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`${styles.filterBtn} ${selected === cat ? styles.filterActive : ""}`}
              onClick={() => setSelected(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
        <span className={styles.resultCount}>
          {filtered.length} campaign{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* ── Grid ── */}
      <div className={styles.container}>
        {loading ? (
          <div className={styles.loadingWrap}>
            <div className={styles.spinner} />
            <p>Loading campaigns...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className={styles.empty}>
            <span className={styles.emptyIcon}>🔍</span>
            <p>No campaigns found in this category.</p>
          </div>
        ) : (
          <div className={styles.grid}>
            {filtered.map((item, index) => (
              <div
                key={index}
                className={styles.card}
                onClick={() =>
                  router.push({
                    pathname: "/campaigns/[campaign]",
                    query: { campaign: item.args.deployedTender },
                  })
                }
              >
                {/* Image */}
                <div className={styles.cardImg}>
                  <img
                    src={item.args.image}
                    alt="campaign"
                    onError={(e) => { e.target.src = "/placeholder.png"; }}
                  />
                  <div className={styles.categoryBadge}>
                    {item.args.category}
                  </div>
                </div>

                {/* Body */}
                <div className={styles.cardBody}>
                  <div className={styles.cardMeta}>
                    <span className={styles.verifiedBadge}>✓ Verified</span>
                    <span className={styles.cardDate}>
                      {formatDate(item.args.createTime)}
                    </span>
                  </div>
                  <div className={styles.cardAddress}>
                    {item.args.deployedTender.slice(0, 10)}...
                    {item.args.deployedTender.slice(-6)}
                  </div>
                  <div className={styles.cardFooter}>
                    <span className={styles.viewBtn}>View Campaign →</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default index;