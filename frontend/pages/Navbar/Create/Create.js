import React, { useState } from "react";
import Navbar from "../Navbar";
import styles from "./Create.module.css";
import { useFactory } from "../../../context/CampaignFactory";
import Link from "next/link";
import axios from "axios";
import { utils } from "ethers";

const CATEGORIES = [
  "Miscellaneous",
  "Education",
  "Health",
  "Sports",
  "Community support",
  "Woman",
];

const TIME_UNITS = [
  { value: "month",  label: "Months" },
  { value: "week",   label: "Weeks"  },
  { value: "day",    label: "Days"   },
  { value: "hour",   label: "Hours"  },
  { value: "minute", label: "Minutes"},
];

const Create = () => {
  const { registerYourProtocol } = useFactory();

  const [form, setForm] = useState({
    title: "", category: "Miscellaneous", target: "",
    image: "", contribution: "", timeValue: "", timeUnit: "day",
  });
  const [pdf, setPdf]           = useState(null);
  const [uploaded, setUploaded] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const uploadToIpfs = async () => {
    const file = document.getElementById("pdf").files[0];
    if (!file) { alert("Please select a PDF first."); return; }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
        headers: {
          pinata_api_key: "ca5199974ef2c2592db0",
          pinata_secret_api_key: "0643702204c4256e18ecb913ecaa7d55e0487128f9a12c7725c0af93b22b8ad9",
          "Content-Type": "multipart/form-data",
        },
      });
      setPdf(`https://gateway.pinata.cloud/ipfs/${res.data.IpfsHash}`);
      setUploaded(true);
    } catch (e) {
      console.error(e);
      alert("Error uploading to IPFS.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const { title, category, target, image, contribution, timeValue, timeUnit } = form;

      if (!title.trim())                        throw new Error("Title is required");
      if (!target || parseFloat(target) <= 0)   throw new Error("Target amount must be greater than 0");
      if (!contribution || parseFloat(contribution) <= 0) throw new Error("Minimum contribution must be greater than 0");
      if (parseFloat(target) < parseFloat(contribution))  throw new Error("Target must be greater than minimum contribution");
      if (!image.trim())                        throw new Error("Image link is required");
      if (!uploaded || !pdf)                    throw new Error("Please upload a PDF document");
      if (!timeValue || parseFloat(timeValue) <= 0) throw new Error("Deadline must be greater than 0");

      const multipliers = { month: 30*24*60, week: 7*24*60, day: 24*60, hour: 60, minute: 1 };
      const minutes = parseFloat(timeValue) * multipliers[timeUnit];

      setSubmitting(true);
      await registerYourProtocol({
        deadline:     minutes,
        target:       utils.parseEther(`${target}`),
        contribution: utils.parseEther(`${contribution}`),
        pdf,
        category,
        image,
      });
    } catch (e) {
      alert(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setForm({ title: "", category: "Miscellaneous", target: "", image: "", contribution: "", timeValue: "", timeUnit: "day" });
    setPdf(null);
    setUploaded(false);
    if (document.getElementById("pdf")) document.getElementById("pdf").value = "";
  };

  return (
    <div className={styles.page}>
      <Navbar />

      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <span className={styles.headerTag}>New Application</span>
          <h1 className={styles.headerTitle}>Campaign Registration</h1>
          <p className={styles.headerSub}>
            Fill in the details below to register your fundraising campaign.
            It will be reviewed by an authorizer before going live.
          </p>
        </div>

        {/* Form */}
        <div className={styles.formCard}>
          <div className={styles.fields}>

            {/* Category */}
            <div className={styles.field}>
              <label className={styles.label}>Category <span className={styles.req}>*</span></label>
              <select name="category" className={styles.select} value={form.category} onChange={handleChange}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Title */}
            <div className={styles.field}>
              <label className={styles.label}>Campaign Title <span className={styles.req}>*</span></label>
              <input
                className={styles.input} type="text" name="title"
                placeholder="Brief description of your campaign"
                value={form.title} onChange={handleChange}
              />
            </div>

            {/* Target + Min Contribution */}
            <div className={styles.row}>
              <div className={styles.field}>
                <label className={styles.label}>Target Amount (ETH) <span className={styles.req}>*</span></label>
                <input
                  className={styles.input} type="number" name="target"
                  placeholder="0.00" value={form.target} onChange={handleChange}
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Min. Contribution (ETH) <span className={styles.req}>*</span></label>
                <input
                  className={styles.input} type="number" name="contribution"
                  placeholder="0.00" value={form.contribution} onChange={handleChange}
                />
              </div>
            </div>

            {/* Image */}
            <div className={styles.field}>
              <label className={styles.label}>Campaign Image URL <span className={styles.req}>*</span></label>
              <input
                className={styles.input} type="text" name="image"
                placeholder="https://..." value={form.image} onChange={handleChange}
              />
              {form.image && (
                <img src={form.image} alt="preview" className={styles.imgPreview}
                  onError={(e) => { e.target.style.display = "none"; }} />
              )}
            </div>

            {/* Deadline */}
            <div className={styles.field}>
              <label className={styles.label}>Deadline <span className={styles.req}>*</span></label>
              <div className={styles.deadlineRow}>
                <input
                  className={`${styles.input} ${styles.deadlineInput}`}
                  type="number" name="timeValue"
                  placeholder="e.g. 7" value={form.timeValue} onChange={handleChange}
                />
                <div className={styles.radioGroup}>
                  {TIME_UNITS.map((u) => (
                    <label key={u.value} className={`${styles.radioLabel} ${form.timeUnit === u.value ? styles.radioActive : ""}`}>
                      <input
                        type="radio" name="timeUnit" value={u.value}
                        checked={form.timeUnit === u.value}
                        onChange={handleChange}
                        className={styles.radioInput}
                      />
                      {u.label}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* PDF Upload */}
            <div className={styles.field}>
              <label className={styles.label}>
                Supporting Document (PDF) <span className={styles.req}>*</span>
              </label>
              <p className={styles.hint}>Upload your proposal, project plan or supporting evidence.</p>
              <div className={styles.uploadRow}>
                <input type="file" accept=".pdf" id="pdf" name="file" className={styles.fileInput} />
                <button
                  type="button"
                  className={`${styles.uploadBtn} ${uploaded ? styles.uploadedBtn : ""}`}
                  onClick={uploadToIpfs}
                  disabled={uploading || uploaded}
                >
                  {uploading ? "Uploading..." : uploaded ? "✓ Uploaded" : "Upload to IPFS"}
                </button>
              </div>
              {uploaded && pdf && (
                <Link href={pdf} passHref legacyBehavior>
                  <a target="_blank" rel="noopener noreferrer" className={styles.previewLink}>
                    Preview uploaded document →
                  </a>
                </Link>
              )}
            </div>

            {/* Actions */}
            <div className={styles.actions}>
              <button
                type="button" className={styles.submitBtn}
                onClick={handleSubmit} disabled={submitting}
              >
                {submitting ? "Submitting..." : "Register Campaign"}
              </button>
              <button
                type="button" className={styles.resetBtn}
                onClick={handleReset}
              >
                Reset
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Create;