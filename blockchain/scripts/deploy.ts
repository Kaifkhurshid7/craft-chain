import { ethers } from "hardhat";

async function main() {
  console.log("Deploying CraftBatch721 contract...");

  const CraftBatchFactory = await ethers.getContractFactory("CraftBatch721");
  const craftBatch = await CraftBatchFactory.deploy();

  await craftBatch.waitForDeployment();

  const deployedAddress = await craftBatch.getAddress();
  console.log("CraftBatch721 deployed to:", deployedAddress);

  // Get deployer address
  const [deployer] = await ethers.getSigners();
  console.log("Deployed by:", deployer.address);

  // Get network information
  const network = await ethers.provider.getNetwork();
  console.log("Network:", network.name, "- Chain ID:", network.chainId);

  // Verify deployment
  const name = await craftBatch.name();
  const symbol = await craftBatch.symbol();
  console.log(`Contract verified: ${name} (${symbol})`);

  // Save deployment info
  const deploymentInfo = {
    contract: "CraftBatch721",
    address: deployedAddress,
    deployer: deployer.address,
    network: network.name,
    chainId: network.chainId,
    timestamp: new Date().toISOString(),
  };

  console.log("\nDeployment Info:");
  console.log(JSON.stringify(deploymentInfo, null, 2));

  return deploymentInfo;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
