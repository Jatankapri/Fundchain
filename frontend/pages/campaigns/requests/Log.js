import React, { useState, useEffect } from "react";
import { Table, Collapse, Button, Loading } from "@nextui-org/react";
import { useCampaign } from "../../../context/CampaignContext";
import { useAccount } from "wagmi";
import { utils } from "ethers";

const Log = ({ campaignAddress, owner }) => {
  const { address } = useAccount();

  const { getRequestStatus, voteRequestToCampaign, settleRequestOf } =
    useCampaign();

  const [log, setLog] = useState([]);
  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    async function call() {
      console.log(
        "campaign data",
        await getRequestStatus(`${campaignAddress}`)
      );

      setLog(await getRequestStatus(`${campaignAddress}`));
    }
    call();
  }, [refresh]);

  return (
    <>
      <div>
        <Collapse
          title="Payment Request State Log"
          css={{
            marginTop: "3%",
            marginRight: "2%",
            background: "$blue100",
          }}
          bordered
          expanded
        >
          <Table
            aria-label="Example table with dynamic content"
            css={{
              height: "auto",
              width: "100%",
              margin: "4%",
              background: "$white100",
            }}
            shadow={true}
            selectionMode="single"
          >
            <Table.Header>
              <Table.Column>Request NO.</Table.Column>
              <Table.Column>Description</Table.Column>
              <Table.Column>Recipient</Table.Column>
              <Table.Column>Amount</Table.Column>
              <Table.Column>Donors/Voters</Table.Column>
              <Table.Column>Complete Status</Table.Column>
              <Table.Column> Action</Table.Column>
              <Table.Column></Table.Column>
            </Table.Header>
            <Table.Body>
              {log != undefined ? (
                log.map((e, index) => (
                  <Table.Row key={index}>
                    <Table.Cell>{index}</Table.Cell>
                    <Table.Cell>{e[5]}</Table.Cell>
                    <Table.Cell>{e[3]}</Table.Cell>
                    <Table.Cell>{utils.formatEther(e[2])}</Table.Cell>
                    <Table.Cell>
                      {e[7].toString()}/{e[4].toString()}
                    </Table.Cell>
                    <Table.Cell>
                      {e[1] == false ? "Inprogress" : "Succeed"}
                    </Table.Cell>
                    <Table.Cell>
                      <Button
                        auto
                        color="primary"
                        onPress={async () => {
                          await voteRequestToCampaign(campaignAddress, index);
                          setTimeout(() => {
                            setRefresh(true);
                          }, 8000);
                        }}
                        rounded
                      >
                        Vote
                      </Button>
                    </Table.Cell>
                    <Table.Cell>
                      {address === owner && (
                        <Button
                          auto
                          color="success"
                          onPress={async () => {
                            await settleRequestOf(campaignAddress, index);
                            setTimeout(() => {
                              setRefresh(true);
                            }, 8000);
                          }}
                          rounded
                        >
                          Settle Request
                        </Button>
                      )}
                    </Table.Cell>
                  </Table.Row>
                ))
              ) : (
                <Loading />
              )}
            </Table.Body>
          </Table>
        </Collapse>
      </div>
    </>
  );
};

export default Log;
