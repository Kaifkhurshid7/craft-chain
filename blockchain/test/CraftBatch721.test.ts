import { expect } from "chai";
import { ethers } from "hardhat";
import { CraftBatch721 } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("CraftBatch721", () => {
  let craftBatch: CraftBatch721;
  let owner: SignerWithAddress;
  let minter: SignerWithAddress;
  let artisan: SignerWithAddress;
  let buyer: SignerWithAddress;
  let other: SignerWithAddress;

  const DEFAULT_ADMIN_ROLE = ethers.ZeroHash;
  const MINTER_ROLE = ethers.id("MINTER_ROLE");
  const METADATA_URI = "ipfs://QmTestMetadata123";
  const STEP_HASH = ethers.id("step_data_1");
  const EMPTY_BYTES32 = ethers.ZeroHash;

  beforeEach(async () => {
    const [ownerAddr, minterAddr, artisanAddr, buyerAddr, otherAddr] =
      await ethers.getSigners();

    owner = ownerAddr;
    minter = minterAddr;
    artisan = artisanAddr;
    buyer = buyerAddr;
    other = otherAddr;

    const CraftBatchFactory = await ethers.getContractFactory("CraftBatch721");
    craftBatch = await CraftBatchFactory.deploy();
    await craftBatch.waitForDeployment();

    // Grant MINTER_ROLE to minter account
    await craftBatch.grantRole(MINTER_ROLE, minter.address);
  });

  describe("Deployment", () => {
    it("Should deploy successfully with correct initial state", async () => {
      expect(await craftBatch.name()).to.equal("CraftBatch");
      expect(await craftBatch.symbol()).to.equal("CRAFT");
    });

    it("Should grant DEFAULT_ADMIN_ROLE to deployer", async () => {
      expect(await craftBatch.hasRole(DEFAULT_ADMIN_ROLE, owner.address)).to
        .be.true;
    });

    it("Should not grant MINTER_ROLE by default", async () => {
      expect(await craftBatch.hasRole(MINTER_ROLE, artisan.address)).to.be
        .false;
    });
  });

  describe("Role Management", () => {
    it("Should allow admin to grant MINTER_ROLE", async () => {
      await craftBatch.grantRole(MINTER_ROLE, artisan.address);
      expect(await craftBatch.hasRole(MINTER_ROLE, artisan.address)).to.be
        .true;
    });

    it("Should allow admin to revoke MINTER_ROLE", async () => {
      await craftBatch.grantRole(MINTER_ROLE, artisan.address);
      await craftBatch.revokeRole(MINTER_ROLE, artisan.address);
      expect(await craftBatch.hasRole(MINTER_ROLE, artisan.address)).to.be
        .false;
    });

    it("Should prevent non-admin from granting roles", async () => {
      await expect(
        craftBatch
          .connect(other)
          .grantRole(MINTER_ROLE, artisan.address)
      ).to.be.revertedWithCustomError(
        craftBatch,
        "AccessControlUnauthorizedAccount"
      );
    });
  });

  describe("Batch Minting", () => {
    it("Should mint a batch with correct owner and metadata", async () => {
      const tx = await craftBatch
        .connect(minter)
        .mintBatch(artisan.address, METADATA_URI);

      const receipt = await tx.wait();
      expect(receipt).to.not.be.null;

      expect(await craftBatch.ownerOf(1)).to.equal(artisan.address);
      expect(await craftBatch.tokenURI(1)).to.equal(METADATA_URI);
    });

    it("Should emit BatchMinted event with correct parameters", async () => {
      await expect(
        craftBatch.connect(minter).mintBatch(artisan.address, METADATA_URI)
      )
        .to.emit(craftBatch, "BatchMinted")
        .withArgs(1, artisan.address, METADATA_URI);
    });

    it("Should increment token IDs sequentially", async () => {
      await craftBatch.connect(minter).mintBatch(artisan.address, METADATA_URI);
      await craftBatch.connect(minter).mintBatch(buyer.address, METADATA_URI);
      await craftBatch.connect(minter).mintBatch(other.address, METADATA_URI);

      expect(await craftBatch.ownerOf(1)).to.equal(artisan.address);
      expect(await craftBatch.ownerOf(2)).to.equal(buyer.address);
      expect(await craftBatch.ownerOf(3)).to.equal(other.address);
    });

    it("Should prevent non-minter from minting", async () => {
      await expect(
        craftBatch
          .connect(artisan)
          .mintBatch(artisan.address, METADATA_URI)
      ).to.be.revertedWithCustomError(
        craftBatch,
        "AccessControlUnauthorizedAccount"
      );
    });

    it("Should prevent minting to zero address", async () => {
      await expect(
        craftBatch
          .connect(minter)
          .mintBatch(ethers.ZeroAddress, METADATA_URI)
      ).to.be.revertedWith("Cannot mint to zero address");
    });

    it("Should prevent minting with empty metadata URI", async () => {
      await expect(
        craftBatch.connect(minter).mintBatch(artisan.address, "")
      ).to.be.revertedWith("Metadata URI cannot be empty");
    });

    it("Should return the token ID on successful mint", async () => {
      const tx = await craftBatch
        .connect(minter)
        .mintBatch(artisan.address, METADATA_URI);

      const receipt = await tx.wait();
      expect(receipt).to.not.be.null;

      const events = receipt?.logs || [];
      expect(events.length).to.be.greaterThan(0);
    });
  });

  describe("ERC-721 Transfers", () => {
    beforeEach(async () => {
      await craftBatch
        .connect(minter)
        .mintBatch(artisan.address, METADATA_URI);
    });

    it("Should transfer token from owner to recipient", async () => {
      await craftBatch
        .connect(artisan)
        .transferFrom(artisan.address, buyer.address, 1);

      expect(await craftBatch.ownerOf(1)).to.equal(buyer.address);
    });

    it("Should emit Transfer event on transfer", async () => {
      await expect(
        craftBatch
          .connect(artisan)
          .transferFrom(artisan.address, buyer.address, 1)
      )
        .to.emit(craftBatch, "Transfer")
        .withArgs(artisan.address, buyer.address, 1);
    });

    it("Should allow safeTransferFrom", async () => {
      await craftBatch
        .connect(artisan)
        .safeTransferFrom(artisan.address, buyer.address, 1);

      expect(await craftBatch.ownerOf(1)).to.equal(buyer.address);
    });

    it("Should prevent transfer from non-owner", async () => {
      await expect(
        craftBatch
          .connect(buyer)
          .transferFrom(artisan.address, buyer.address, 1)
      ).to.be.revertedWithCustomError(
        craftBatch,
        "ERC721InsufficientApproval"
      );
    });

    it("Should allow approved address to transfer", async () => {
      await craftBatch.connect(artisan).approve(buyer.address, 1);
      await craftBatch
        .connect(buyer)
        .transferFrom(artisan.address, other.address, 1);

      expect(await craftBatch.ownerOf(1)).to.equal(other.address);
    });

    it("Should allow operator to transfer all tokens", async () => {
      await craftBatch.connect(artisan).setApprovalForAll(buyer.address, true);
      await craftBatch
        .connect(buyer)
        .transferFrom(artisan.address, other.address, 1);

      expect(await craftBatch.ownerOf(1)).to.equal(other.address);
    });
  });

  describe("Step Recording", () => {
    beforeEach(async () => {
      await craftBatch
        .connect(minter)
        .mintBatch(artisan.address, METADATA_URI);
    });

    it("Should record a step with correct data", async () => {
      const tx = await craftBatch
        .connect(artisan)
        .recordStep(1, STEP_HASH);

      const receipt = await tx.wait();
      const block = await ethers.provider.getBlock(receipt!.blockNumber);

      const step = await craftBatch.getStep(1, 0);
      expect(step.stepHash).to.equal(STEP_HASH);
      expect(step.actor).to.equal(artisan.address);
      expect(step.timestamp).to.equal(block!.timestamp);
    });

    it("Should emit StepRecorded event", async () => {
      const tx = await craftBatch.connect(artisan).recordStep(1, STEP_HASH);
      const receipt = await tx.wait();
      const block = await ethers.provider.getBlock(receipt!.blockNumber);
      await expect(tx)
        .to.emit(craftBatch, "StepRecorded")
        .withArgs(1, artisan.address, STEP_HASH, block!.timestamp);
    });

    it("Should allow multiple steps for same batch", async () => {
      const stepHash2 = ethers.id("step_data_2");
      const stepHash3 = ethers.id("step_data_3");

      await craftBatch.connect(artisan).recordStep(1, STEP_HASH);
      await craftBatch.connect(artisan).recordStep(1, stepHash2);
      await craftBatch.connect(artisan).recordStep(1, stepHash3);

      expect(await craftBatch.getStepCount(1)).to.equal(3);
    });

    it("Should prevent non-owner from recording steps", async () => {
      await expect(
        craftBatch.connect(buyer).recordStep(1, STEP_HASH)
      ).to.be.revertedWith("Only token owner can record steps");
    });

    it("Should prevent recording step for nonexistent token", async () => {
      await expect(
        craftBatch.connect(artisan).recordStep(999, STEP_HASH)
      ).to.be.revertedWith("Token does not exist");
    });

    it("Should prevent recording step with zero hash", async () => {
      await expect(
        craftBatch.connect(artisan).recordStep(1, EMPTY_BYTES32)
      ).to.be.revertedWith("Step hash cannot be zero");
    });

    it("Should allow owner to record steps after transfer", async () => {
      await craftBatch
        .connect(artisan)
        .transferFrom(artisan.address, buyer.address, 1);

      const stepHash = ethers.id("new_owner_step");
      await craftBatch.connect(buyer).recordStep(1, stepHash);

      const step = await craftBatch.getStep(1, 0);
      expect(step.actor).to.equal(buyer.address);
    });
  });

  describe("Step Retrieval", () => {
    beforeEach(async () => {
      await craftBatch
        .connect(minter)
        .mintBatch(artisan.address, METADATA_URI);

      const stepHash1 = ethers.id("step_1");
      const stepHash2 = ethers.id("step_2");

      await craftBatch.connect(artisan).recordStep(1, stepHash1);
      await craftBatch.connect(artisan).recordStep(1, stepHash2);
    });

    it("Should return all steps for a batch", async () => {
      const steps = await craftBatch.getBatchSteps(1);
      expect(steps.length).to.equal(2);
    });

    it("Should return correct step count", async () => {
      expect(await craftBatch.getStepCount(1)).to.equal(2);
    });

    it("Should retrieve specific step by index", async () => {
      const step = await craftBatch.getStep(1, 0);
      expect(step.stepHash).to.equal(ethers.id("step_1"));
    });

    it("Should prevent retrieving steps for nonexistent token", async () => {
      await expect(
        craftBatch.getBatchSteps(999)
      ).to.be.revertedWith("Token does not exist");
    });

    it("Should prevent retrieving step with invalid index", async () => {
      await expect(
        craftBatch.getStep(1, 5)
      ).to.be.revertedWith("Step index out of bounds");
    });

    it("Should return empty array for batch with no steps", async () => {
      await craftBatch.connect(minter).mintBatch(buyer.address, METADATA_URI);
      const steps = await craftBatch.getBatchSteps(2);
      expect(steps.length).to.equal(0);
    });
  });

  describe("Token URI Management", () => {
    it("Should set and retrieve correct token URI", async () => {
      const tx = await craftBatch
        .connect(minter)
        .mintBatch(artisan.address, METADATA_URI);

      expect(await craftBatch.tokenURI(1)).to.equal(METADATA_URI);
    });

    it("Should handle different URIs for different tokens", async () => {
      const uri1 = "ipfs://QmBatch1";
      const uri2 = "ipfs://QmBatch2";

      await craftBatch.connect(minter).mintBatch(artisan.address, uri1);
      await craftBatch.connect(minter).mintBatch(buyer.address, uri2);

      expect(await craftBatch.tokenURI(1)).to.equal(uri1);
      expect(await craftBatch.tokenURI(2)).to.equal(uri2);
    });

    it("Should revert on nonexistent token URI", async () => {
      await expect(
        craftBatch.tokenURI(999)
      ).to.be.revertedWithCustomError(
        craftBatch,
        "ERC721NonexistentToken"
      );
    });
  });

  describe("Burning", () => {
    beforeEach(async () => {
      await craftBatch
        .connect(minter)
        .mintBatch(artisan.address, METADATA_URI);
    });

    it("Should allow owner to burn token", async () => {
      await craftBatch.connect(artisan).burn(1);
      await expect(
        craftBatch.ownerOf(1)
      ).to.be.revertedWithCustomError(
        craftBatch,
        "ERC721NonexistentToken"
      );
    });

    it("Should prevent non-owner from burning", async () => {
      await expect(
        craftBatch.connect(buyer).burn(1)
      ).to.be.revertedWithCustomError(
        craftBatch,
        "ERC721InsufficientApproval"
      );
    });
  });

  describe("Interface Support", () => {
    it("Should support ERC721 interface", async () => {
      const erc721InterfaceId = "0x80ac58cd";
      expect(await craftBatch.supportsInterface(erc721InterfaceId)).to.be.true;
    });

    it("Should support AccessControl interface", async () => {
      const accessControlInterfaceId = "0x7965db0b";
      expect(await craftBatch.supportsInterface(accessControlInterfaceId)).to
        .be.true;
    });
  });

  describe("Edge Cases", () => {
    it("Should handle large number of steps", async () => {
      await craftBatch
        .connect(minter)
        .mintBatch(artisan.address, METADATA_URI);

      const stepCount = 50;
      for (let i = 0; i < stepCount; i++) {
        const stepHash = ethers.id(`step_${i}`);
        await craftBatch.connect(artisan).recordStep(1, stepHash);
      }

      expect(await craftBatch.getStepCount(1)).to.equal(stepCount);

      const lastStep = await craftBatch.getStep(1, stepCount - 1);
      expect(lastStep.stepHash).to.equal(ethers.id(`step_${stepCount - 1}`));
    });

    it("Should handle multiple batches and transfers", async () => {
      const batch1 = await craftBatch
        .connect(minter)
        .mintBatch(artisan.address, METADATA_URI);
      const batch2 = await craftBatch
        .connect(minter)
        .mintBatch(buyer.address, METADATA_URI);

      await craftBatch
        .connect(artisan)
        .recordStep(1, ethers.id("artisan_step"));
      await craftBatch
        .connect(buyer)
        .recordStep(2, ethers.id("buyer_step"));

      await craftBatch
        .connect(artisan)
        .transferFrom(artisan.address, buyer.address, 1);

      expect(await craftBatch.ownerOf(1)).to.equal(buyer.address);
      expect(await craftBatch.getStepCount(1)).to.equal(1);
      expect(await craftBatch.getStepCount(2)).to.equal(1);
    });
  });
});
