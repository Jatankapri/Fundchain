import React from "react";
import Log from "./Log";
import { Card, Button } from "@nextui-org/react";
import styles from "./index.module.css";
import { useCampaign } from "../../../context/CampaignContext";

const Request = ({ campaignAddress, owner }) => {
  const { createRequestToCampaign } = useCampaign();
  async function handleClick() {
    var description = document.create_form.dsc.value;
    var recipient = document.create_form.recp.value;
    var amount = document.create_form.amount.value;
    console.log("data", {
      description: description,
      amount: amount,
      recipient: recipient,
    });

    await createRequestToCampaign(
      campaignAddress,
      description,
      recipient,
      amount
    );
  }

  return (
    <div>
      <h1 className={styles.heading}>Campaign RequestLog</h1>
      <br />

      <Card
        css={{
          mw: "400px",
          marginLeft: "0%",
          padding: "2%",
          fontWeight: "bold",
        }}
      >
        <form name="create_form">
          <label>DESCRIPTION:</label>
          <br />
          <input type="text" placeholder="DESCRIPTION" name="dsc"></input>
          <br />
          <br />
          <label> AMOUNT: </label>
          <br />
          <input type="number" placeholder="MATIC" name="amount"></input>
          <br />
          <br />
          <label>RECEPIENT:</label>
          <br />
          <input type="text" placeholder="payable address" name="recp"></input>
          <br />
          <br />
          <input type="reset" class="reset"></input>
          <br />
          <br />
          <Button onClick={handleClick}>CREATE REQUEST</Button>
        </form>
      </Card>
      <br />

      <Log campaignAddress={campaignAddress} owner={owner} />
    </div>
  );
};

export default Request;
