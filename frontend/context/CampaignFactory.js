import { createContext, useContext } from "react";

import { getFactoryContract } from "../hooks/useContract";

//external imports
import { useProvider, useSigner } from "wagmi";
import Swal from "sweetalert2";

const factoryContext = createContext();

export const useWindow = () => {
  return window.ethereum;
};
export const useFactory = () => {
  return useContext(factoryContext);
};

export const FactoryProvider = ({ children }) => {
  const provider = useProvider();
  const { data: signer } = useSigner();
  const signerContract = getFactoryContract(signer);
  const providerContract = getFactoryContract(provider);

  const grantRole = async(account) => {
    try {
      const tx = await signerContract.grantAuthorityRole(account);
      await tx.wait(1);
      Swal.fire({
        position: "top-end",
        icon: "success",
        title: "Successfully granted the role!",
        showConfirmButton: false,
        timer: 2500,
      });
    } catch (err) {
      // Check if error has message property and contains the specific revert reason
      if (err?.data?.message?.includes("This address is already an authorizer")) {
        Swal.fire({
          position: "top-end",
          icon: "error",
          title: "This address is already an authorizer",
          showConfirmButton: false,
          timer: 2500,
        });
      } else {
        Swal.fire({
          position: "top-end",
          icon: "error",
          title: "An error occurred while granting the role",
          showConfirmButton: false,
          timer: 2500,
        });
      }
      console.error("Error:", err);
    }
  };
  
  

  const revokeRole = async (account) => {
    try {
      const tx = await signerContract.revokeAuthorityRole(account);
      await tx.wait(1); // Wait for the transaction to be mined
      Swal.fire({
        position: "top-end",
        icon: "success",
        title: "Successfully revoked the role!",
        showConfirmButton: false,
        timer: 2500,
      });
    } catch (err) {
      // Check if the error message contains specific known messages
      let errorMessage = "An error occurred while revoking the role";
  
      // Customize message based on error details
      if (err?.data?.message?.includes("this address wasn't an authorizer")) {
        errorMessage = "This address isn't an authorizer";
      } 
  
      // Show the custom error message using Swal
      Swal.fire({
        position: "top-end",
        icon: "error",
        title: errorMessage,
        showConfirmButton: false,
        timer: 2500,
      });
  
      console.error("Error:", err);
    }
  };
  
  

  const registerYourProtocol = async ({
    deadline,
    image,
    target,
    category,
    pdf,
    contribution,
  }) => {
    //check the input format
    try {
      signerContract
        .registerProtocol(contribution, deadline, target, pdf, image, category)
        .then(async (tx) => {
          tx.wait().then(() => {
            Swal.fire({
              position: "top-end",
              icon: "success",
              title: "Registered Your Application !",
              showConfirmButton: false,
              timer: 4000,
            });
          });
        });
    } catch (e) {
      console.error(e);
    }
  };

  const getDeployedCampaignsAddress = async () => {
    try {
      const addresses = await providerContract.getDeployedTenders();
      console.log("address", addresses);
      return addresses;
    } catch (e) {
      alert("unable to get deployed campaigns");
    }
  };

  /**
   *
   * @param {@} client  address of the campaign verification request applicants
   */
  const validateProtocolOf = (client, protocolNum) => {
    console.log("inside validate", {
      client: client,
      protocolNum: protocolNum,
    });
    try {
      signerContract.validateProtocol(client, protocolNum).then(async (tx) => {
        tx.wait(1).then(() => {
          Swal.fire({
            position: "top-end",
            icon: "success",
            title: "Authorized!",
            showConfirmButton: false,
            timer: 2500,
          });
        });
      });
    } catch (e) {
      console.error(e);
      alert("Unable to validate!");
    }
  };

  const getAuthorizersCurrentRoles = async () => {
    try {
      const addresses = await providerContract.getAuthorizerCurrentRoles();
      const formattedData = addresses[0].map((address, index) => ({
        address,
        role: addresses[1][index] || "Unknown",
      }));
  
      console.log("Formatted Data:", formattedData);
      return formattedData;
    } catch (e) {
      alert("unable to get the authorizer data");
      return [];
    }

  }
  const getProtocols = async () => {
    const datas = await signerContract.getUnauthorizedProtocols();
    console.log("datas", datas);
    return datas;
  };

  const protocolsOf = async (address) => {
    const data = await providerContract.protocols(address);
    return data;
  };

  return (
    <factoryContext.Provider
      value={{
        grantRole,
        revokeRole,
        getAuthorizersCurrentRoles,
        validateProtocolOf,
        getDeployedCampaignsAddress,
        registerYourProtocol,
        getProtocols,
        protocolsOf,
      }}
    >
      {children}
    </factoryContext.Provider>
  );
};