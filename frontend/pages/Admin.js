import Image from "next/image";
import { Web3Button } from "@web3modal/react";
import { useRef, useState, useEffect } from "react";
import styles from "../styles/Admin.module.css";
import { useFactory } from "../context/CampaignFactory";
import {
  Button,
  Input,
  Spacer,
  Text,
  Table,
  Grid,
  Loading,
} from "@nextui-org/react";

const Admin = () => {
  const { grantRole, revokeRole, getAuthorizersCurrentRoles } = useFactory();
  const inputRef = useRef();
  const [authorizers, setAuthorizers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [render , setRender] = useState(false);

  // Fetch authorizers
  async function fetchAuthorizers() {
    try {
      const roles = await getAuthorizersCurrentRoles();
      setAuthorizers(roles);
    } catch (error) {
      console.error("Error fetching authorizers:", error);
    }
  }

  useEffect(() => {
    fetchAuthorizers();
  }, [render]);

  async function grantRoleFor() {
    const address = inputRef.current.value.trim();
    if (!address) return alert("Please enter an account address");

    try {
      await grantRole(address);
      

      setAuthorizers((prev) => [...prev, address]);
      setRender(true);
    } catch (error) {
      console.error("Grant role error:", error);
      alert("Unable to grant the role. Check console for details.");
    } 
  }

  async function revokeRoleFor() {
    const address = inputRef.current.value.trim();
    if (!address) return alert("Please enter an account address");

    
    try {
      await revokeRole(address);
      setAuthorizers((prev) => prev.filter((acc) => acc !== address));
      setRender(false); 
    } catch (error) {
      console.error("Revoke role error:", error);
      alert("Unable to revoke the role. Check console for details.");
    } 
  }

  return (
    <>
      <div className={styles.navbar}>
        <div style={{ marginLeft: "-12%" }}>
          <Image src={"/navBarLogo.png"} height={150} width={400} quality={100} alt="logo" priority />
        </div>
        <font className={styles.heading}>ADMIN PAGE</font>
        <div className={styles.option}>
          <Web3Button />
        </div>
        &nbsp;
      </div>

      <div style={{ padding: "30px", fontSize: "24px" }}>
        <Grid.Container gap={2} css={{ padding: "$20" }} justify="space-around">
          <Grid>
            <Text b>ROLE ACCESS CONTROL</Text>
            <Spacer y="0.5" />
            <Input rounded bordered label="Account Address" placeholder="0x00...." color="secondary" ref={inputRef} />

            <br />
            <br />

            <Button.Group color="gradient" ghost size="xl" css={{ marginLeft: "-6px" }}>
              <Button onPress={grantRoleFor} disabled={loading}>
                {loading ? "Processing..." : "Grant"}
              </Button>
              <Button onPress={revokeRoleFor} disabled={loading}>
                {loading ? "Processing..." : "Revoke"}
              </Button>
            </Button.Group>
          </Grid>

          <Grid sm={6}>
            <Table
              title="Current Authorizers In The System"
              bordered
              shadow
              color="secondary"
              aria-label="Authorizers table"
              css={{ height: "auto", width: "stretch" }}
            >
              <Table.Header>
                <Table.Column>
                  <b>Current Authorizer's Addresses</b>
                </Table.Column>
              </Table.Header>

              <Table.Body>
                {authorizers.length > 0 ? (
                  authorizers.map((acc, index) => (
                    <Table.Row key={index}>
                      <Table.Cell
                        css={{
                          userSelect: "text", // Allows text selection
                          cursor: "text",
                        }}
                      >
                        {acc}
                      </Table.Cell>
                    </Table.Row>
                  ))
                ) : (
                  <Table.Row>
                    <Table.Cell>
                      <Loading type="points" />
                    </Table.Cell>
                  </Table.Row>
                )}
              </Table.Body>

              <Table.Pagination shadow align="center" rowsPerPage={3} onPageChange={(page) => console.log({ page })} />
            </Table>
          </Grid>
        </Grid.Container>
      </div>
    </>
  );
};

export default Admin;
