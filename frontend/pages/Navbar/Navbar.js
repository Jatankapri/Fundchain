import styles from "./Navbar.module.css";
import { Web3Button } from "@web3modal/react";
import Image from "next/image";
import Link from "next/link";
import { Dropdown } from "@nextui-org/react";
import { useState } from "react";

const Navbar = () => {
  const [portalOpen, setPortalOpen] = useState(false);

  return (
    <nav className={styles.main}>
      {/* Logo */}
      <div className={styles.logo}>
        <Image
          src={"/navbarLogo.png"}
          height={110}
          width={280}
          quality={100}
          alt={"logo"}
          priority
        />
      </div>

      {/* Nav links */}
      <div className={styles.links}>
        <Link href={"/User"} className={styles.link}>
          User Guidelines
        </Link>

        {/* Portal dropdown */}
        <div className={styles.dropdownWrap}>
          <Dropdown>
            <Dropdown.Button
              flat
              css={{
                background: "rgba(255,255,255,0.08)",
                color: "#e2e8f0",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: "8px",
                fontWeight: 400,
                fontSize: "15px",
                height: "36px",
                padding: "0 16px",
                "&:hover": {
                  background: "rgba(255,255,255,0.14)",
                },
              }}
            >
              Portal
            </Dropdown.Button>
            <Dropdown.Menu
              aria-label="Portal menu"
              css={{
                background: "#1e293b",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "10px",
                padding: "6px",
              }}
            >
              <Dropdown.Item
                key="new"
                css={{ borderRadius: "7px", color: "#e2e8f0" }}
              >
                <Link href="/Navbar/Create/Create" className={styles.dropLink}>
                  📝 Registration Form
                </Link>
              </Dropdown.Item>
              <Dropdown.Item
                key="copy"
                css={{ borderRadius: "7px", color: "#e2e8f0" }}
              >
                <Link href="/Navbar/History" className={styles.dropLink}>
                  📋 Application Status
                </Link>
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>

        <Link href={"/campaigns"} className={styles.link}>
          Campaigns
        </Link>
      </div>

      {/* Wallet button */}
      <div className={styles.wallet}>
        <Web3Button />
      </div>
    </nav>
  );
};

export default Navbar;