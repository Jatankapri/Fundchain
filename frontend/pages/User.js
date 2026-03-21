import Navbar from "./Navbar/Navbar";
import styles from "../styles/User.module.css";

const roles = [
  {
    icon: "🔑",
    title: "Admin",
    bg: "#0f172a",
    desc: "Deploys the system and manages authorizers by assigning or revoking their access. Cannot modify or delete donation details. Identity remains anonymous.",
  },
  {
    icon: "✅",
    title: "Authorizer",
    bg: "#1e3a5f",
    desc: "Designated by the Admin to verify donation requests. Only verified applications are shown to donors for contributions. Identity remains anonymous.",
  },
  {
    icon: "👤",
    title: "User",
    bg: "#1a1a2e",
    desc: "Individuals who request donations or contribute to verified campaigns. Can track all transactions transparently on-chain.",
  },
];

const steps = [
  {
    number: "01",
    accent: "#2563eb",
    bg: "#eff6ff",
    title: "Creating a Donation Request",
    points: [
      "Go to Portal → Registration Form in the Navbar",
      "Fill in target amount, minimum contribution, deadline and upload your PDF",
      "After submission, track your application under Portal → Application Status",
    ],
  },
  {
    number: "02",
    accent: "#16a34a",
    bg: "#f0fdf4",
    title: "Checking Application Status",
    points: [
      "Application History — lists all submitted applications awaiting authorizer approval",
      "Deployed Campaign — shows verified campaigns ready for public donations",
    ],
  },
  {
    number: "03",
    accent: "#ca8a04",
    bg: "#fefce8",
    title: "Exploring Campaigns",
    points: [
      "Click Campaigns in the Navbar to browse all verified campaigns",
      "Use the search bar to filter campaigns by category",
    ],
  },
  {
    number: "04",
    accent: "#9333ea",
    bg: "#fdf4ff",
    title: "Donating to a Campaign",
    points: [
      "Click any campaign to view its details — authorizer, owner, target, deadline",
      "Click View Protocol to access the supporting documents",
      "Enter your donation amount (must meet minimum contribution) and confirm in your wallet",
      "View all donation records in Campaign Donation Log — searchable by donor address",
    ],
  },
  {
    number: "05",
    accent: "#e11d48",
    bg: "#fff1f2",
    title: "Requesting Withdrawals",
    points: [
      "Campaign owner goes to Campaign RequestLog and fills in description, recipient and amount",
      "Click CREATE REQUEST to submit the withdrawal request on-chain",
      "Donors vote on the request — majority approval required",
      "Once approved, the owner settles the request and funds transfer to the recipient",
    ],
  },
];

const User = () => {
  return (
    <>
      <Navbar />
      <div className={styles.page}>

        {/* Hero */}
        <div className={styles.hero}>
          <span className={styles.heroTag}>User Guidelines</span>
          <h1 className={styles.heroTitle}>
            How Fundchain <span className={styles.heroAccent}>Works</span>
          </h1>
          <p className={styles.heroSub}>
            A transparent, blockchain-powered fundraising platform —
            connecting donors and beneficiaries without any middlemen.
          </p>
        </div>

        {/* Roles */}
        <section className={styles.section}>
          <p className={styles.sectionLabel}>Platform Participants</p>
          <div className={styles.rolesGrid}>
            {roles.map((r) => (
              <div key={r.title} className={styles.roleCard} style={{ background: r.bg }}>
                <span className={styles.roleIcon}>{r.icon}</span>
                <h3 className={styles.roleTitle}>{r.title}</h3>
                <p className={styles.roleDesc}>{r.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Steps */}
        <section className={styles.section}>
          <p className={styles.sectionLabel}>Step by Step Guide</p>
          <div className={styles.steps}>
            {steps.map((s) => (
              <div
                key={s.number}
                className={styles.stepCard}
                style={{ "--accent": s.accent, "--bg": s.bg }}
              >
                <div className={styles.stepNum} style={{ color: s.accent }}>
                  {s.number}
                </div>
                <div className={styles.stepBody}>
                  <h3 className={styles.stepTitle} style={{ color: s.accent }}>
                    {s.title}
                  </h3>
                  <ul className={styles.stepList}>
                    {s.points.map((p, i) => (
                      <li key={i}>{p}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <div className={styles.footerNote}>
          All transactions are permanently recorded on the blockchain — transparent, immutable and verifiable by anyone.
        </div>

      </div>
    </>
  );
};

export default User;