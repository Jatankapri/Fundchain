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
      //create an object that can be used to construct a multipart/form-data request body that includes the PDF file data and any other parameters required by the Pinata API.
      const formData = new FormData();
      formData.append("file", document.getElementById("pdf").files[0]);

      //pinata API endpoint for uploading File
      const url = "https://api.pinata.cloud/pinning/pinFileToIPFS";

      const resFile = await axios.post(url, formData, {
        headers: {
          pinata_api_key: "b00b0ec02667a0be57bb",
          pinata_secret_api_key: "bfdfe24ebecc0ecc19474556d98c602aa6bd2fc8030cf744452f700583259a2d",
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
      <a target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    </Link>
  );

  const validation = async () => {
    var title = document.reg_form.title;
    var category = document.getElementById("category");
    var target = document.reg_form.target;
    var image = document.reg_form.image;

    var contribution = document.reg_form.mcontribution;

    const form = document.getElementById("form");
    const timeValue = form.elements["time-value"].value;
    const timeUnit = form.elements["time-unit"].value;

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
    console.log(minutes);

    var file = document.reg_form.file;
    var image = document.reg_form.image;

    if (title.value.length <= 0) {
      alert("title is required");
      title.focus();
      return false;
    }

    if (target.value.length <= 0) {
      alert("Target is required");
      target.focus();
      return false;
    }

    if (image.value.length <= 0) {
      alert("image is required");
      image.focus();
      return false;
    }

    if (contribution.value.length <= 0) {
      alert("Minimum Contribution is required");
      contribution.focus();
      return false;
    }

    if (file.value.length <= 0) {
      alert("PDF is required");
      file.focus();
      return false;
    }

    const formatedTarget = utils.parseEther(`${target.value}`);
    const formatedMC = utils.parseEther(`${contribution.value}`);

    const data = {
      deadline: minutes,
      target: formatedTarget,
      contribution: formatedMC,
      pdf: pdf,
      category: category.value,
      image: image.value,
    };

    await registerYourProtocol(data);
  };

  return (
    <div>
      <Navbar />
      <br />
      <br />
      {/* <div className={styles.main}> */}
      <Card
        css={{
          width: "500px",
          padding: "40px",
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
          <br />
          <br />
          <label>TITLE*</label>
          <br />
          <input
            type="text"
            placeholder="ABOUT DONATION"
            className={styles.box}
            name="title"
          ></input>
          <br />
          <br />
          <label>Target(MATIC)*</label>
          <br />
          <input
            type="number"
            placeholder="AMOUNT(MATIC)"
            className={styles.box}
            name="target"
          ></input>
          <br />
          <br />
          <label>External Image Link*</label>
          <br />
          <input
            type="text"
            accept="image/*,.jpg,.jpeg,.png,"
            className={styles.box}
            name="image"
            id="image"
            placeholder="IMAGE LINK"
          ></input>
          <br />
          <br />
          <label>Minimum Contribution(MATIC)*</label>
          <br />
          <input
            type="number"
            placeholder="(MATIC)"
            className={styles.box}
            name="mcontribution"
          ></input>
          <br />
          <br />
          <label>Deadline*</label>
          <label>
            <input
              type="radio"
              name="time-unit"
              id="time-unit-month"
              value="month"
            />
            Months
          </label>
          <label>
            <input
              type="radio"
              name="time-unit"
              id="time-unit-week"
              value="week"
            />
            Weeks
          </label>
          <label>
            <input
              type="radio"
              name="time-unit"
              id="time-unit-day"
              value="day"
            />
            Days
          </label>
          <label>
            <input
              type="radio"
              name="time-unit"
              id="time-unit-hour"
              value="hour"
            />
            Hours
          </label>
          <label>
            <input
              type="radio"
              name="time-unit"
              id="time-unit-minute"
              value="minute"
            />
            Minutes
          </label>
          <br />
          <label>
            Time value:
            <input type="number" name="time-value" required />
          </label>
          <br />
          <br />
          PDF UPLOAD*
          <br />
          <input type="file" accept=".pdf" name="file" id="pdf"></input>
          <br />
          <br />
          {uploaded ? (
            <ExternalLink href={pdf}>
              <p b>Preview</p>
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
          <br />
        </form>
      </Card>
      <br />
      <br />
    </div>
  );
};

export default Create;
