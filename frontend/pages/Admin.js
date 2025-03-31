import Image from "next/image";
import { Web3Button } from "@web3modal/react";
import { useRef, useState, useEffect } from "react";
import styles from "../styles/Admin.module.css";
import { useFactory } from "../context/CampaignFactory";
import { Button, Input, Spacer, Text, Table, Grid } from "@nextui-org/react";

const Admin = () => {
  const { grantRole, revokeRole, getAuthorizersCurrentRoles } = useFactory();
  const inputRef = useRef();
  const [authorizers, setAuthorizers] = useState([]);
  const [reRender, setRender] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Track loading state

  // Fetch data from blockchain contract
  const fetchData = async () => {
    try {
      const authorizersData = await getAuthorizersCurrentRoles();
      setAuthorizers(authorizersData);
    } catch (error) {
      console.error("Error fetching authorizers:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [reRender]);

  // Separate granted and revoked roles
  const grantedList = authorizers.filter(auth => auth.role === "granted").map(auth => auth.address);
  const revokedList = authorizers.filter(auth => auth.role === "revoked").map(auth => auth.address);

  // Ensure both lists have the same number of rows
  const maxLength = Math.max(grantedList.length, revokedList.length);
  const paddedGranted = [...grantedList, ...Array(maxLength - grantedList.length).fill("")];
  const paddedRevoked = [...revokedList, ...Array(maxLength - revokedList.length).fill("")];

  const checkInput = () => {
    if (inputRef.current.value.length === 0) {
      alert('Please provide account!');
      return false;
    }
    return true;
  }

  // Grant role function
  async function grantRoleFor() {
    if (!checkInput()) {
      return;
    }

    setIsLoading(true); 
    try {
      await grantRole(inputRef.current.value);
      setTimeout(() => {
        setRender(prev => !prev); 
        setIsLoading(false); 
      }, 2000);
    } catch {
      console.log("adasdsa");
      alert("Unable to grant the role");
      setIsLoading(false); 
    }
  }

  // Revoke role function
  async function revokeRoleFor() {
    if (!checkInput()) {
      return;
    }

    setIsLoading(true); 
    try {
      await revokeRole(inputRef.current.value);
      setTimeout(() => {
        setRender(prev => !prev); 
        setIsLoading(false); 
      }, 2000);
    } catch {
      alert("Unable to revoke the role");
      setIsLoading(false); 
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
      </div>

      <div style={{ padding: "30px", fontSize: "24px" }}>
        <Grid.Container gap={3} justify="space-between">
          {/* Input Form Section */}
          <Grid xs={12} sm={5} css={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <Text b css={{ fontSize: "18px" }}>ROLE ACCESS CONTROL</Text>
            <Spacer y="0.5" />
            <form>
              <Input 
                rounded 
                bordered 
                label="Account Address" 
                placeholder="0x00...." 
                color="secondary" 
                ref={inputRef} 
                css={{ fontSize: "14px" }}
              />
              <Spacer y={1} />
              <Button.Group color="gradient" ghost size="xl" css={{ marginLeft: "-6px" }}>
                <Button onPress={grantRoleFor} css={{ fontSize: "14px" }} disabled={isLoading}>Grant</Button>
                <Button onPress={revokeRoleFor} css={{ fontSize: "14px" }} disabled={isLoading}>Revoke</Button>
              </Button.Group>
            </form>
          </Grid>

          {/* Table Section */}
          <Grid xs={12} sm={7}>
          
            <Table
              bordered
              shadow
              color="secondary"
              aria-label="Authorizers table"
              css={{
                
                borderCollapse: "separate",
                borderSpacing: "20px 15px", 
                minWidth: "100%", 
                fontSize: "14px",
                width: "100%", 
              }}
            >
              <Table.Header>
                <Table.Column><b>Granted</b></Table.Column>
                <Table.Column><b>Revoked</b></Table.Column>
              </Table.Header>
              <Table.Body>
                {paddedGranted.map((granted, index) => (
                  <Table.Row key={index}>
                    <Table.Cell css={{ padding: "15px 20px", wordWrap: "break-word", maxWidth: "600px" }}>
                      {granted || ""}
                    </Table.Cell>
                    <Table.Cell css={{ padding: "15px 20px", wordWrap: "break-word", maxWidth: "600px" }}>
                      {paddedRevoked[index] || ""}
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          </Grid>
        </Grid.Container>
      </div>
    </>
  );
};

export default Admin;