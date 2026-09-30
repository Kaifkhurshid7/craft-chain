import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

/**
 * Ignition deployment module for CraftBatch721 contract
 * 
 * This module defines the deployment configuration for the CraftBatch721
 * smart contract using Hardhat Ignition for reproducible deployments.
 * 
 * Usage:
 *   npx hardhat ignition deploy ./ignition/modules/CraftBatch721.ts --network sepolia
 */

const CraftBatch721Module = buildModule("CraftBatch721Module", (m) => {
  // Deploy the CraftBatch721 contract
  const craftBatch721 = m.contract("CraftBatch721", []);

  return { craftBatch721 };
});

export default CraftBatch721Module;
