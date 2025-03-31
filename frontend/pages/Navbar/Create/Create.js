import React, { useState } from "react";
import Navbar from "../Navbar";
import styles from "./Create.module.css";
import { useFactory } from "../../../context/CampaignFactory";
import { Button, Spacer, Loading, Card } from "@nextui-org/react";
import Link from "next/link";
import axios from "axios";
import { utils } from "ethers";

const Create = () => {
  const { registerYourProtocol } = useFactory();
  const [pdf, setPdf] = useState(null);
  const [uploaded, setUploaded] = useState(false);

  const uploadToIpfs = async () => {
    try {
      const formData = new FormData();
      formData.append("file", document.getElementById("pdf").files[0]);
      const url = "https://api.pinata.cloud/pinning/pinFileToIPFS";
      const resFile = await axios.post(url, formData, {
        headers: {
          pinata_api_key: "ca5199974ef2c2592db0",
          pinata_secret_api_key: "0643702204c4256e18ecb913ecaa7d55e0487128f9a12c7725c0af93b22b8ad9",
          "Content-Type": "multipart/form-data",
        },
      });
      const pdfUrl = `https://gateway.pinata.cloud/ipfs/${resFile.data.IpfsHash}`;
      setPdf(pdfUrl);
      setUploaded(true);
    } catch (e) {
      console.error(e);
      alert("Error! while uploading file to IPFS....");
    }
  };

  const ExternalLink = ({ href, children }) => (
    <Link href={href} passHref legacyBehavior>
      <a target="_blank" rel="noopener noreferrer">{children}</a>
    </Link>
  );

  const validation = async () => {
    try {
      const form = document.getElementById("form");
      const title = form.title.value.trim();
      const category = form.category.value;
      const target = parseFloat(form.target.value);
      const image = form.image.value.trim();
      const contribution = parseFloat(form.mcontribution.value);
      const file = form.file.files.length > 0;
      const timeValue = parseFloat(form["time-value"].value);
      const timeUnit = form["time-unit"].value;

      if (!title) throw new Error("Title is required");
      if (!target || target <= 0) throw new Error("Target amount must be greater than 0");
      if (!contribution || contribution <= 0) throw new Error("Minimum contribution must be greater than 0");
      if (target < contribution) throw new Error("Target amount must be greater than the minimum contribution");
      if (!image) throw new Error("Image link is required");
      if (!file) throw new Error("PDF must be uploaded");
      if (!timeValue || timeValue <= 0) throw new Error("Deadline must be greater than 0");

      let minutes = 0;
      switch (timeUnit) {
        case "month":
          minutes = timeValue * 30 * 24 * 60;
          break;
        case "week":
          minutes = timeValue * 7 * 24 * 60;
          break;
        case "day":
          minutes = timeValue * 24 * 60;
          break;
        case "hour":
          minutes = timeValue * 60;
          break;
        default:
          minutes = timeValue;
      }

      const formatedTarget = utils.parseEther(`${target}`);
      const formatedMC = utils.parseEther(`${contribution}`);

      const data = {
        deadline: minutes,
        target: formatedTarget,
        contribution: formatedMC,
        pdf: pdf,
        category: category,
        image: image,
      };

      await registerYourProtocol(data);
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div>
      <Navbar />
      <br />
      <Card
        css={{
          width: "500px",
          padding: "30px",
          height: "80%",
          fontWeight: "bold",
          marginLeft: "35%",
        }}
      >
        <h2>Campaign Registration</h2>
        <form name="reg_form" id="form" onSubmit={validation}>
          <label>CATEGORY*</label>
          <br />
          <select id="category" name="category" className={styles.box}>
            <option value="miscellaneous">Miscellaneous</option>
            <option value="Education">Education</option>
            <option value="Health">Health</option>
            <option value="Sports">Sports</option>
            <option value="Community support">Community support</option>
            <option value="Woman">Woman</option>
          </select>
          <br /><br />
          <label>TITLE*</label>
          <br/>
          <input type="text" placeholder="ABOUT DONATION" className={styles.box} name="title" />
          <br /><br />
          <label>Target(MATIC)*</label><br/>
          <input type="number" placeholder="AMOUNT(MATIC)" className={styles.box} name="target" />
          <br /><br />
          <label>External Image Link*</label><br/>
          <input type="text" className={styles.box} name="image" placeholder="IMAGE LINK" />
          <br /><br />
          <label>Minimum Contribution(MATIC)*</label><br/>
          <input type="number" placeholder="(MATIC)" className={styles.box} name="mcontribution" />
          <br /><br />
          <label>Deadline*</label><br/>
<div>
  <label>
    <input type="radio" name="time-unit" value="month" /> Months
  </label>
  <label>
    <input type="radio" name="time-unit" value="week" /> Weeks
  </label>
  <label>
    <input type="radio" name="time-unit" value="day" /> Days
  </label>
  <label>
    <input type="radio" name="time-unit" value="hour" /> Hours
  </label>
  <label>
    <input type="radio" name="time-unit" value="minute" /> Minutes
  </label>
</div>

<label>Time value*</label>
<input type="number" name="time-value" required />
<br /><br />

          PDF UPLOAD*
          <br/>
          <input type="file" accept=".pdf" name="file" id="pdf" />
          <br /><br/>
          {uploaded ? (
            <ExternalLink href={pdf}>
              <p>Preview</p> <br/>
            </ExternalLink>
          ) : (
            <Button auto onPress={uploadToIpfs} rounded>
              Upload PDF
            </Button>
          )}
          <br />
          <Button shadow auto color="success" onPress={validation}>
            Register
          </Button>
        </form>
      </Card>
      <br />
    </div>
  );
};

export default Create;
