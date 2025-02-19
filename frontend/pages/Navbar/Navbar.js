import styles from "./Navbar.module.css";
import { Web3Button } from "@web3modal/react";
import Image from "next/image";
import Link from "next/link";
import { Dropdown } from "@nextui-org/react";

const Navbar = () => {
  return (
    <div className={styles.main}>
      <Image
        src={"/navbarLogo.png"}
        height={130}
        width={320}
        quality={100}
        alt={"logo"}
        priority
      ></Image>

      <div className={styles.option}>
        <Link href={"/User"} style={{ textDecoration: "none", color: "white" }}>
          User Guidelines
        </Link>
      </div>

      <div className={styles.trigger}>
        <Dropdown>
          <Dropdown.Button flat>Portal</Dropdown.Button>
          <Dropdown.Menu aria-label="Static Actions">
            <Dropdown.Item key="new">
              <Link href="/Navbar/Create/Create">Registration Form</Link>
            </Dropdown.Item>
            <Dropdown.Item key="copy">
              <Link href="/Navbar/History">Application Status</Link>
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>

      <div className={styles.option}>
        <Link
          href={"/campaigns"}
          style={{ textDecoration: "none", color: "white" }}
        >
          Campaigns
        </Link>
      </div>

      <div className={styles.button}>
        <Web3Button />
      </div>
    </div>
  );
};

export default Navbar;
