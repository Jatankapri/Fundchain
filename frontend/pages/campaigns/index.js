import Navbar from "../Navbar/Navbar";
import { Card, Grid, Row, Text, Loading, Spacer } from "@nextui-org/react";
import { factoryAddress, factoryAbi } from "../../constants";
import { useState, useEffect } from "react";
import { ethers, Contract } from "ethers";
import { useRouter } from "next/router";

const index = () => {
  const provider =
    typeof window == "undefined"
      ? ethers.getDefaultProvider()
      : new ethers.providers.Web3Provider(window.ethereum);
  const contract = new Contract(factoryAddress, factoryAbi, provider);

  const router = useRouter();
  const [campaigns, setCampaigns] = useState([]);
  const [isSearch, setSearch] = useState(false);

  useEffect(() => {
    async function call() {
      const latestBlock = await provider.getBlockNumber();
      const logs = await contract.queryFilter(
        "CreatedTender",
        
      );
      setCampaigns(logs);
      console.log("logs", logs);
    }
    call();
  }, []);

  return (
    <div>
      <Navbar />
      <h1
        style={{
          marginLeft: "45%",
        }}
      >
        Campaign page
      </h1>

      <br />
      <br />
      <div>
        <form
          style={{
            margin: "1%",
            fontWeight: "bold",
          }}
        >
          <h2>SEARCH BY CATEGORY</h2>
          <br />

          <select
            id="category"
            defaultValue="all"
            onChange={(e) => {
              const selectedValue = e.target.value;
              if (selectedValue === "all") {
                setSearch(false);
              } else {
                setSearch(selectedValue);
              }
            }}
          >
            <option value="miscellaneous">Miscellaneous</option>
            <option value="Education">Education</option>
            <option value="Health">Health</option>
            <option value="Sports">Sports</option>
            <option value="Community support">Community support</option>
            <option value="Woman">Woman</option>
            <option value="all">Show All</option>
          </select>

          <br />

          <br />
        </form>
      </div>

      <Grid.Container gap={4} justify="flex-start">
        {campaigns
          .filter((campaign) =>
            isSearch ? campaign.args.category === isSearch : true
          )
          .map((item, index) => (
            <Grid
              xs={10}
              sm={3}
              key={index}
              css={{
                marginBottom: "5%",
              }}
            >
              <Card
                isPressable
                isHoverable
                key={index}
                onPress={() => {
                  router.push({
                    pathname: "/campaigns/[campaign]",
                    query: { campaign: item.args.deployedTender },
                  });
                }}
              >
                <Card.Body css={{ p: 0 }}>
                  <Card.Image
                    src={item.args.image}
                    objectFit="cover"
                    width="100%"
                    height={300}
                    alt="campaign"
                  />
                </Card.Body>

                <Card.Footer css={{ justifyContent: "flex-start" }}>
                  <div>
                    <Row wrap="wrap" justify="space-between" align="center">
                      <Text b>CATEGORY</Text>
                      <Text
                        css={{
                          color: "$accents7",
                          fontWeight: "$semibold",
                          fontSize: "$sm",
                        }}
                      >
                        {item.args.category}
                        &nbsp;
                      </Text>
                    </Row>
                  </div>
                  <Spacer x={6} />
                  <div>
                    <Row wrap="wrap" justify="space-between" align="center">
                      <Text b>Created Time:</Text>
                      <Text
                        css={{
                          color: "$accents7",
                          fontWeight: "$semibold",
                          fontSize: "$sm",
                        }}
                      >
                        &nbsp;
                        {new Date(
                          parseInt(item.args.createTime * 1000)
                        ).toString()}
                      </Text>
                    </Row>
                  </div>
                </Card.Footer>
              </Card>
            </Grid>
          ))}
      </Grid.Container>
    </div>
  );
};
export default index;
