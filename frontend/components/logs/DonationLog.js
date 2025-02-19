import React, { useState, useEffect } from "react";

import { campaignAbi } from "../../constants";
import { Table, Button, Loading, Input } from "@nextui-org/react";
import { ethers, Contract, utils } from "ethers";

const DonationLog = ({ campaignAddress }) => {
  const provider =
    typeof window == "undefined"
      ? ethers.getDefaultProvider()
      : new ethers.providers.Web3Provider(window.ethereum);
  const contract = new Contract(campaignAddress, campaignAbi, provider);
  const [log, setLog] = useState([]);
  const [isSearch, setSearch] = useState(false);

  useEffect(() => {
    async function call() {
      const latestBlock = provider.getBlockNumber();
      const logs = await contract.queryFilter(
        "DonorEvent",
        
      );
      console.log("logs", logs);
      setLog(logs);
    }
    call();
  }, []);

  return (
    <div style={{ backgroundColor: "lightblue" }}>
      <Input
        clearable
        label="Search"
        type="search"
        placeholder="By Address"
        onChange={(e) => {
          setSearch(e.target.value);
        }}
      />
      <br />
      <br />
      <Table
        aria-label="Example static collection table"
        title="Donation Log Table"
        css={{
          height: "auto",
          minWidth: "100%",
          padding: "$11",
          // backgroundColor: "Lavender",
        }}
        selectionMode="single"
      >
        <Table.Header>
          <Table.Column>Donor Address</Table.Column>
          <Table.Column>Amount</Table.Column>
          <Table.Column>Time</Table.Column>
        </Table.Header>

        <Table.Body>
          {log == undefined ? (
            <Loading type="points" size="xl" color="black" />
          ) : (
            log
              .filter((individualLog) =>
                isSearch ? individualLog.args.donor === isSearch : true
              )
              .map((e, index) => (
                <Table.Row key={index}>
                  <Table.Cell>{e.args.donor}</Table.Cell>

                  <Table.Cell>
                    {utils.formatEther(e.args.amount)} MATIC
                  </Table.Cell>

                  <Table.Cell>
                    {new Date(parseInt(e.args.time * 1000)).toString()}
                  </Table.Cell>
                </Table.Row>
              ))
          )}
        </Table.Body>
      </Table>
    </div>
  );
};

export default DonationLog;
