import React, { useState, useEffect } from "react";

import Link from "next/link";
import { Table, Button, Loading } from "@nextui-org/react";

import { useFactory } from "../../context/CampaignFactory";

const RegistrationLogs = ({ getDatas }) => {
  const { validateProtocolOf } = useFactory();

  const [loading, setLoading] = useState(false);
  const [datas, setDatas] = useState([]);
  const [reRender, setRender] = useState(false);

  const authorize = async (address, protocolNum) => {
    await validateProtocolOf(address, protocolNum);
    setTimeout(() => {
      setLoading(false);
      setRender(true);
    }, 2500);
  };

  useEffect(() => {
    async function call() {
      setDatas(await getDatas());
      setLoading(true);
    }
    call();
  }, [loading, reRender]);

  return (
    <div>
      <Table
        aria-label="Example static collection table"
        title="unverfied applications table"
        css={{
          height: "auto",
          minWidth: "100%",
          padding: "$11",
          backgroundColor: "Lavender",
        }}
        selectionMode="single"
      >
        <Table.Header>
          <Table.Column>Applicant's Address</Table.Column>
          <Table.Column>Application Number</Table.Column>
          <Table.Column>Application Link</Table.Column>
          <Table.Column>Status</Table.Column>
          <Table.Column>Actions</Table.Column>
        </Table.Header>
        <Table.Body>
          {loading == false && datas == undefined ? (
            <Loading type="points" size="xl" />
          ) : (
            datas.map((e, index) => {
              if (e[4] !== "0x0000000000000000000000000000000000000000") {
                return (
                  <Table.Row key={index}>
                    <Table.Cell>{e[4]}</Table.Cell>
                    <Table.Cell>{e[8].toString()}</Table.Cell>
                    <Table.Cell>
                      <Link href={e[0]} passHref legacyBehavior>
                        <a target="_blank" rel="noopener noreferrer">
                          Preview
                        </a>
                      </Link>
                    </Table.Cell>
                    <Table.Cell>
                      <Loading
                        type="spinner"
                        color="currentColor"
                        size="sm"
                        title="Pending"
                      />
                      Pending
                    </Table.Cell>
                    <Table.Cell>
                      <Button
                        onPress={() => {
                          authorize(e[4], e[8].toString());
                        }}
                        color="success"
                        rounded
                      >
                        Authorize
                      </Button>
                    </Table.Cell>
                  </Table.Row>
                );
              }
            })
          )}
        </Table.Body>
      </Table>
    </div>
  );
};

export default RegistrationLogs;
