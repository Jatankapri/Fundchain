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
    signerContract.grantAuthorityRole(account).then(async (tx) => {
      tx.wait(1).then(() => {
        Swal.fire({
          position: "top-end",
          icon: "success",
          title: "Successfully granted the role !",
          showConfirmButton: false,
          timer: 2500,
        });
      });
    });
  };

  const revokeRole = (account) => {
    signerContract.revokeAuthorityRole(account).then(async (tx) => {
      tx.wait(1).then(() => {
        Swal.fire({
          position: "top-end",
          icon: "success",
          title: "Successfully revoked the role !",
          showConfirmButton: false,
          timer: 2500,
        });
      });
    });
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
      console.log("address", addresses);
      return addresses;
    } catch (e) {
      alert("unable to get the authorizer data");
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
