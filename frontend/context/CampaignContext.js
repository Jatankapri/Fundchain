import { createContext, useContext } from "react";
import { useProvider, useSigner, useContract, useAccount } from "wagmi";
import { campaignAbi } from "../constants";
import { Contract, Signer, utils } from "ethers";
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
      const contract = await generateContract(address, provider);
      console.log("contract", contract);
      const obj = await contract.readTenderStatus();
      return obj;
    } catch (e) {
      console.error(e);
    }
  };

  /**
   * @argument {*}contract --> instance of particular campaign contract
   * {@returns} balance of contract -> bignumber object
   */
  const getContractBalance = async (contract) => {
    const contracts = await generateContract(contract, provider);
    const balance = await contracts.getContractBalance();
    return utils.formatEther(balance);
  };

  //-----function to donate the campaign

  const donateToCampaign = async (contract, amount) => {
   // console.log("contract", contract, "amout", amount);
    try {
      const contract1 = await generateContract(contract, signer);
      const fund = utils.parseEther(`${amount}`);
      contract1.donate({ value: fund }).then(async (tx) => {
        tx.wait(1).then(() => {
          Swal.fire({
            icon: "success",
            title: "SuccssFul Donation!",
            showConfirmButton: false,
            timer: 2500,
          });
        });
      });
    } catch (e) {
      alert("unable to donate");
      console.error(e);
    }
  };


  
  const getYourDonation = async (campaignAddress) => {
    try {
      const contracts = await generateContract(campaignAddress, provider);
      const amount = utils.formatEther(await contracts.donors(address));
      return amount;
    } catch (e) {
      alert("unable to get your donation aount");
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
      const payment = utils.parseEther(`${amount}`);
      await contract1.createRequest(description, recipient, payment);
    } catch (e) {
      alert("unable to create you request");
      console.log("Create request",e)
    }
  };

  const voteRequestToCampaign = async (contract, reqNum) => {
    try {
      const contracts = await generateContract(contract, signer);
      await contracts.voteRequest(reqNum);
    } catch {
      alert("unable to vote");
    };
  };

  const getRequestStatus = async (contract) => {
   
    
      
    try {
      const contracts = await generateContract(contract, provider);
      const numberReq = await contracts.numRequests();
      console.log("no. of requests", parseInt(numberReq));
      let datas = [];
      for (let i = 0; i < numberReq; i++) {
        datas.push(await contracts.getRequeststatus(i));
      }
      console.log("data" , datas)
      return datas;
    } catch (e) {
      console.log("error",e);
      
    };
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
      alert("Unable to settle this request");
      console.error(e);
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