const { ethers } = require("hardhat");

async function main() {
  const factory = await ethers.getContractFactory("tenderFactory");
  const factoryContract = await factory.deploy();
  await factoryContract.deployed();

  console.log(`campaign factory deployed to ${factoryContract.address}`);
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});

//deployed address: 0x7df67F587621eeAA1a5Ac96bb4Ad7B18aD3a10Ec
