import React, { useState } from "react";
import Log from "./Log";
import styles from "./index.module.css";
import { useCampaign } from "../../../context/CampaignContext";
import { Button } from "@nextui-org/react";
import axios from "axios";

const Request = ({ campaignAddress, owner }) => {
  const { createRequestToCampaign } = useCampaign();

  const [form, setForm]         = useState({ description: "", recipient: "", amount: "" });
  const [proofUrl, setProofUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded]   = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const uploadProof = async () => {
    const file = document.getElementById("proof").files[0];
    if (!file) { alert("Please select a file first."); return; }
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
      const url = `https://gateway.pinata.cloud/ipfs/${res.data.IpfsHash}`;
      setProofUrl(url);
      setUploaded(true);
    } catch (e) {
      console.error(e);
      alert("Error uploading proof to IPFS.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.description.trim()) { alert("Description is required."); return; }
    if (!form.recipient.trim())   { alert("Recipient address is required."); return; }
    if (!form.amount || parseFloat(form.amount) <= 0) { alert("Amount must be greater than 0."); return; }
    if (!uploaded || !proofUrl)   { alert("Please upload a proof document before submitting."); return; }

    // Append proof URL to description so it's stored on-chain
    const descriptionWithProof = `${form.description} | Proof: ${proofUrl}`;

    setSubmitting(true);
    try {
      await createRequestToCampaign(
        campaignAddress,
        descriptionWithProof,
        form.recipient,
        form.amount
      );
      // Reset form
      setForm({ description: "", recipient: "", amount: "" });
      setProofUrl(null);
      setUploaded(false);
      document.getElementById("proof").value = "";
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setForm({ description: "", recipient: "", amount: "" });
    setProofUrl(null);
    setUploaded(false);
    if (document.getElementById("proof")) document.getElementById("proof").value = "";
  };

  return (
    <div className={styles.page}>

      {/* ── Form ── */}
      <div className={styles.formWrap}>
        <div className={styles.formHeader}>
          <h2 className={styles.formTitle}>Create Withdrawal Request</h2>
          <p className={styles.formSub}>
            Submit a request to withdraw funds from this campaign. Donors must vote to approve.
          </p>
        </div>

        <div className={styles.fields}>

          {/* Description */}
          <div className={styles.field}>
            <label className={styles.label}>Description</label>
            <textarea
              className={styles.textarea}
              name="description"
              placeholder="Explain how these funds will be used..."
              value={form.description}
              onChange={handleChange}
              rows={3}
            />
          </div>

          {/* Amount + Recipient side by side */}
          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>Amount (ETH)</label>
              <input
                className={styles.input}
                type="number"
                name="amount"
                placeholder="0.00"
                value={form.amount}
                onChange={handleChange}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Recipient Address</label>
              <input
                className={styles.input}
                type="text"
                name="recipient"
                placeholder="0x..."
                value={form.recipient}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Proof upload */}
          <div className={styles.field}>
            <label className={styles.label}>
              Proof Document <span className={styles.required}>*required</span>
            </label>
            <p className={styles.fieldHint}>
              Upload an invoice, receipt or any document proving the need for this withdrawal.
            </p>
            <div className={styles.uploadRow}>
              <input
                type="file"
                id="proof"
                accept=".pdf,.jpg,.jpeg,.png"
                className={styles.fileInput}
              />
              <button
                className={`${styles.uploadBtn} ${uploaded ? styles.uploadedBtn : ""}`}
                onClick={uploadProof}
                disabled={uploading || uploaded}
                type="button"
              >
                {uploading ? "Uploading..." : uploaded ? "✓ Uploaded" : "Upload to IPFS"}
              </button>
            </div>
            {uploaded && proofUrl && (
              <a
                href={proofUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.proofLink}
              >
                Preview uploaded document →
              </a>
            )}
          </div>

          {/* Actions */}
          <div className={styles.actions}>
            <button
              className={styles.submitBtn}
              onClick={handleSubmit}
              disabled={submitting}
              type="button"
            >
              {submitting ? "Submitting..." : "Create Request"}
            </button>
            <button
              className={styles.resetBtn}
              onClick={handleReset}
              type="button"
            >
              Reset
            </button>
          </div>

        </div>
      </div>

      {/* ── Log ── */}
      <Log campaignAddress={campaignAddress} owner={owner} />

    </div>
  );
};

export default Request;