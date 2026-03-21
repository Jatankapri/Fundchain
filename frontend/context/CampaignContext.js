import { createContext, useContext } from "react";
import { useProvider, useSigner, useAccount } from "wagmi";
import { campaignAbi } from "../constants";
import { Contract, utils } from "ethers";
import Swal from "sweetalert2";

const campaignContext = createContext();
export const useCampaign = () => {
  return useContext(campaignContext);
};

const generateContract = async (address, obj) => {
  const contract = new Contract(address, campaignAbi, obj);
  return contract;
};

export const CampaignProvider = ({ children }) => {
  const { address } = useAccount();
  const provider = useProvider();
  const { data: signer } = useSigner();

  const getTenderInfo = async (address) => {
    try {
      if (!address || address === "undefined") {
        console.warn("getTenderInfo called with invalid address:", address);
        return null;
      }
      // Validate address to prevent ENS lookup on localhost
      const validAddress = utils.getAddress(address);
      const contract = await generateContract(validAddress, provider);
      const obj = await contract.readTenderStatus();
      return obj;
    } catch (e) {
      console.error("getTenderInfo error:", e.message);
      return null;
    }
  };

  const getContractBalance = async (contract) => {
    try {
      const validAddress = utils.getAddress(contract);
      const contracts = await generateContract(validAddress, provider);
      const balance = await contracts.getContractBalance();
      return utils.formatEther(balance);
    } catch (e) {
      console.error("getContractBalance error:", e.message);
      return "0";
    }
  };

  const donateToCampaign = async (contract, amount) => {
    try {
      const contract1 = await generateContract(contract, signer);
      const fund = utils.parseEther(`${amount}`);
      contract1.donate({ value: fund }).then(async (tx) => {
        tx.wait(1).then(() => {
          Swal.fire({
            icon: "success",
            title: "Successful Donation!",
            showConfirmButton: false,
            timer: 2500,
          });
        });
      });
    } catch (e) {
      alert("Unable to donate");
      console.error(e);
    }
  };

  const getYourDonation = async (campaignAddress) => {
    try {
      const contracts = await generateContract(campaignAddress, provider);
      const amount = utils.formatEther(await contracts.donors(address));
      return amount;
    } catch (e) {
      alert("Unable to get your donation amount");
    }
  };

  const refund = async (contract) => {
    try {
      const contracts = await generateContract(contract, signer);
      await contracts.refund();
    } catch {
      window.alert("Refund criteria didn't meet");
    }
  };

  const createRequestToCampaign = async (
    contract,
    description,
    recipient,
    amount
  ) => {
    try {
      const contract1 = await generateContract(contract, signer);

      // ── Validate inputs ───────────────────────────────────────────────
      if (!description || description.trim() === "") {
        alert("Description is required");
        return;
      }
      if (!recipient || recipient.trim() === "") {
        alert("Recipient address is required");
        return;
      }
      if (!amount || parseFloat(amount) <= 0) {
        alert("Amount must be greater than 0");
        return;
      }

      // ── Check contract conditions before sending tx ───────────────────
      // Use Ganache block timestamp (NOT Date.now) — Ganache time can differ from real time
      const latestBlock  = await provider.getBlock("latest");
      const blockNow     = latestBlock.timestamp;  // Ganache's current time

      const deadline     = (await contract1.deadline()).toNumber();
      const raisedTarget = await contract1.raisedTarget();
      const target       = await contract1.target();
      const numRequests  = await contract1.numRequests();

      console.log("Ganache block time:", new Date(blockNow * 1000).toString());
      console.log("Contract deadline:", new Date(deadline * 1000).toString());
      console.log("Raised:", utils.formatEther(raisedTarget), "/ Target:", utils.formatEther(target));

      if (blockNow < deadline) {
        const hours   = Math.floor((deadline - blockNow) / 3600);
        const minutes = Math.floor(((deadline - blockNow) % 3600) / 60);
        alert(`Campaign deadline has not passed yet on-chain. Time remaining: ${hours}h ${minutes}m`);
        return;
      }

      if (raisedTarget.lt(target)) {
        const raised = utils.formatEther(raisedTarget);
        const needed = utils.formatEther(target);
        alert(`Target not met. Raised: ${raised} ETH / Target: ${needed} ETH. Donors can claim refunds.`);
        return;
      }

      if (numRequests.toNumber() > 0) {
        alert("A request already exists. Only one request can be active at a time.");
        return;
      }

      // ── Validate recipient is a proper address (not ENS — localhost doesn't support ENS) ──
      let resolvedRecipient;
      try {
        resolvedRecipient = utils.getAddress(recipient.trim()); // checksums and validates
      } catch (e) {
        alert("Invalid recipient address. Please enter a valid 0x... wallet address.");
        return;
      }

      // ── Parse amount ──────────────────────────────────────────────────
      // _value is how much to pay the recipient FROM contract balance
      // createRequest is payable but we send 0 ETH as msg.value
      const payment = utils.parseEther(`${amount}`);

      const tx = await contract1.createRequest(
        description,
        resolvedRecipient,
        payment,
        { value: 0 }  // createRequest is payable but doesn't need ETH sent
      );

      await tx.wait(1);

      Swal.fire({
        icon: "success",
        title: "Request Created!",
        showConfirmButton: false,
        timer: 2500,
      });

    } catch (e) {
      console.error("Create request error:", e);

      // Show specific error messages based on revert reason
      const msg = e?.data?.message || e?.message || "";
      if (msg.includes("Doesn't meet request criteria")) {
        alert("Cannot create request: deadline hasn't passed or target not met.");
      } else if (msg.includes("Only owner")) {
        alert("Only the campaign owner can create a request.");
      } else if (msg.includes("contract is not available")) {
        alert("This campaign contract is no longer available.");
      } else {
        alert("Unable to create request: " + (e?.reason || e?.message || "unknown error"));
      }
    }
  };

  const voteRequestToCampaign = async (contract, reqNum) => {
    try {
      const contracts = await generateContract(contract, signer);
      const tx = await contracts.voteRequest(reqNum);
      await tx.wait(1);
      Swal.fire({
        icon: "success",
        title: "Vote Submitted!",
        showConfirmButton: false,
        timer: 2500,
      });
    } catch (e) {
      console.error("Vote error:", e);
      const msg = e?.data?.message || e?.message || "";
      if (msg.includes("already voted")) {
        alert("You have already voted on this request.");
      } else if (msg.includes("Only donors")) {
        alert("Only donors can vote.");
      } else {
        alert("Unable to vote: " + (e?.reason || e?.message || "unknown error"));
      }
    }
  };

  const getRequestStatus = async (contract) => {
    try {
      const contracts = await generateContract(contract, provider);
      const numberReq  = await contracts.numRequests();
      console.log("no. of requests", parseInt(numberReq));
      let datas = [];
      for (let i = 0; i < numberReq; i++) {
        datas.push(await contracts.getRequeststatus(i));
      }
      console.log("data", datas);
      return datas;
    } catch (e) {
      console.log("error", e);
    }
  };

  const settleRequestOf = async (campaign, reqNumber) => {
    try {
      const contracts = await generateContract(campaign, signer);
      contracts.settleRequest(reqNumber).then(async (tx) => {
        await tx.wait();
        Swal.fire({
          icon: "success",
          title: "Settled Payment Request!",
          showConfirmButton: false,
          timer: 2500,
        });
      });
    } catch (e) {
      console.error("Settle error:", e);
      const msg = e?.data?.message || e?.message || "";
      if (msg.includes("Majority does not support")) {
        alert("Cannot settle: majority of donors have not voted yes.");
      } else if (msg.includes("Target not met")) {
        alert("Cannot settle: target amount not met.");
      } else {
        alert("Unable to settle this request: " + (e?.reason || e?.message || "unknown error"));
      }
    }
  };

  return (
    <campaignContext.Provider
      value={{
        getTenderInfo,
        donateToCampaign,
        createRequestToCampaign,
        getYourDonation,
        refund,
        getContractBalance,
        getRequestStatus,
        voteRequestToCampaign,
        settleRequestOf,
      }}
    >
      {children}
    </campaignContext.Provider>
  );
};