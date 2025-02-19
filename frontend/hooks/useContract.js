import { useContract, useProvider, useSigner } from "wagmi";
import { campaignAbi, factoryAbi, factoryAddress } from "../constants";
import { ethers, Contract } from "ethers";

/**
 * @description applied for both custom hook
 * @param {*} isSigner by default false
 * @argument{*} obj--> signer or provider
 * @returns contract instance with type of obj: signer or provider
 */

export const getFactoryContract = (obj) => {
  try {
    const contract = new Contract(factoryAddress, factoryAbi, obj);
    return contract;
  } catch (e) {
    console.log("unable to create contract instance", e);
  }
};

export const getCampaignContract = (deployedAddress, obj) => {
  try {
    const contract = new Contract(deployedAddress, campaignAbi, obj);

    return contract;
  } catch (e) {
    console.log("unable to create campaign contract instance", e);
  }
};
