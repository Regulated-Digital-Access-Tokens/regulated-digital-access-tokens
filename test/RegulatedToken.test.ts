import { expect } from "chai";
import { network } from "hardhat";

const { ethers, networkHelpers } = await network.create();

async function deployFixture() {
  const [owner, creator, buyer1, buyer2] = await ethers.getSigners();
  const contract = await ethers.deployContract("RegulatedToken");
  await contract.waitForDeployment();

  return { contract, owner, creator, buyer1, buyer2 };
}

describe("RegulatedToken", function () {
  describe("Deployment & Setup", function () {
    it("deploys successfully and assigns ownership to the deployer", async function () {
      const { contract, owner } = await networkHelpers.loadFixture(deployFixture);

      expect(await contract.owner()).to.equal(owner.address);
    });
  });

  describe("Minting", function () {
    it("records the creator and mint price when minting", async function () {
      const { contract, creator } = await networkHelpers.loadFixture(deployFixture);
      const mintPrice = ethers.parseEther("1");
      const tokenUri = "ipfs://regulated-token-1";

      await expect(
        contract.connect(creator).mintToken(tokenUri, mintPrice, { value: mintPrice }),
      )
        .to.emit(contract, "TokenMinted")
        .withArgs(1n, creator.address, mintPrice, tokenUri);

      expect(await contract.creators(1n)).to.equal(creator.address);
      expect(await contract.mintPrices(1n)).to.equal(mintPrice);
      expect(await contract.ownerOf(1n)).to.equal(creator.address);
      expect(await contract.tokenURI(1n)).to.equal(tokenUri);
    });

    it("transfers the minting fee to the contract owner", async function () {
      const { contract, creator, owner } = await networkHelpers.loadFixture(deployFixture);
      const mintPrice = ethers.parseEther("1");
      const tokenUri = "ipfs://regulated-token-2";
      const ownerBalanceBefore = await ethers.provider.getBalance(owner.address);

      await contract.connect(creator).mintToken(tokenUri, mintPrice, { value: mintPrice });

      const ownerBalanceAfter = await ethers.provider.getBalance(owner.address);
      expect(ownerBalanceAfter - ownerBalanceBefore).to.equal(mintPrice);
    });
  });

  describe("The 110% Price Ceiling", function () {
    it("allows listing at exactly 110% of the mint price", async function () {
      const { contract, creator } = await networkHelpers.loadFixture(deployFixture);
      const mintPrice = ethers.parseEther("1");
      const ceilingPrice = (mintPrice * 110n) / 100n;

      await contract.connect(creator).mintToken("ipfs://ceiling-pass", mintPrice, { value: mintPrice });

      await expect(contract.connect(creator).listToken(1n, ceilingPrice))
        .to.emit(contract, "TokenListed")
        .withArgs(1n, creator.address, ceilingPrice);

      const listing = await contract.listings(1n);
      expect(listing.price).to.equal(ceilingPrice);
      expect(listing.seller).to.equal(creator.address);
      expect(listing.isListed).to.equal(true);
    });

    it("reverts when a listing exceeds 110% of the mint price", async function () {
      const { contract, creator } = await networkHelpers.loadFixture(deployFixture);
      const mintPrice = ethers.parseEther("1");
      const invalidPrice = (mintPrice * 111n) / 100n;

      await contract.connect(creator).mintToken("ipfs://ceiling-fail", mintPrice, { value: mintPrice });

      await expect(contract.connect(creator).listToken(1n, invalidPrice)).to.be.revertedWith(
        "Exceeds max resale markup",
      );
    });
  });

  describe("Buying & Royalties", function () {
    it("moves the token to buyer1 and clears the listing after purchase", async function () {
      const { contract, creator, buyer1 } = await networkHelpers.loadFixture(deployFixture);
      const mintPrice = ethers.parseEther("1");
      const listingPrice = (mintPrice * 110n) / 100n;

      await contract.connect(creator).mintToken("ipfs://buy-flow", mintPrice, { value: mintPrice });
      await contract.connect(creator).listToken(1n, listingPrice);

      await expect(contract.connect(buyer1).buyToken(1n, { value: listingPrice }))
        .to.emit(contract, "TokenSale")
        .withArgs(1n, buyer1.address, creator.address, listingPrice, listingPrice / 10n);

      expect(await contract.ownerOf(1n)).to.equal(buyer1.address);

      const listing = await contract.listings(1n);
      expect(listing.isListed).to.equal(false);
      expect(listing.price).to.equal(0n);
      expect(listing.seller).to.equal(ethers.ZeroAddress);
    });

    it("pays exactly 10% royalty to the creator and 90% to the seller on resale", async function () {
      const { contract, creator, buyer1, buyer2 } = await networkHelpers.loadFixture(deployFixture);
      const mintPrice = ethers.parseEther("1");
      const resalePrice = (mintPrice * 110n) / 100n;
      const royaltyAmount = (resalePrice * 10n) / 100n;
      const sellerAmount = resalePrice - royaltyAmount;

      await contract.connect(creator).mintToken("ipfs://royalty-flow", mintPrice, { value: mintPrice });
      await contract.connect(creator).listToken(1n, resalePrice);
      await contract.connect(buyer1).buyToken(1n, { value: resalePrice });

      await contract.connect(buyer1).listToken(1n, resalePrice);

      const creatorBalanceBefore = await ethers.provider.getBalance(creator.address);
      const buyer1BalanceBefore = await ethers.provider.getBalance(buyer1.address);

      await expect(contract.connect(buyer2).buyToken(1n, { value: resalePrice }))
        .to.emit(contract, "TokenSale")
        .withArgs(1n, buyer2.address, buyer1.address, resalePrice, royaltyAmount);

      const creatorBalanceAfter = await ethers.provider.getBalance(creator.address);
      const buyer1BalanceAfter = await ethers.provider.getBalance(buyer1.address);

      expect(creatorBalanceAfter - creatorBalanceBefore).to.equal(royaltyAmount);
      expect(buyer1BalanceAfter - buyer1BalanceBefore).to.equal(sellerAmount);
      expect(await contract.ownerOf(1n)).to.equal(buyer2.address);
    });
  });

  describe("Security & Transfer Locks", function () {
    it("reverts direct transferFrom calls", async function () {
      const { contract, creator, buyer1, buyer2 } = await networkHelpers.loadFixture(deployFixture);
      const mintPrice = ethers.parseEther("1");
      const listingPrice = (mintPrice * 110n) / 100n;

      await contract.connect(creator).mintToken("ipfs://locked-transfer", mintPrice, { value: mintPrice });
      await contract.connect(creator).listToken(1n, listingPrice);
      await contract.connect(buyer1).buyToken(1n, { value: listingPrice });

      await expect(
        contract.connect(buyer1).transferFrom(buyer1.address, buyer2.address, 1n),
      ).to.be.revertedWith("Direct transfer disabled; use buyToken");
    });

    it("reverts direct safeTransferFrom calls", async function () {
      const { contract, creator, buyer1, buyer2 } = await networkHelpers.loadFixture(deployFixture);
      const mintPrice = ethers.parseEther("1");
      const listingPrice = (mintPrice * 110n) / 100n;

      await contract.connect(creator).mintToken("ipfs://locked-safe-transfer", mintPrice, { value: mintPrice });
      await contract.connect(creator).listToken(1n, listingPrice);
      await contract.connect(buyer1).buyToken(1n, { value: listingPrice });

      await expect(
        contract.connect(buyer1)["safeTransferFrom(address,address,uint256)"](
          buyer1.address,
          buyer2.address,
          1n,
        ),
      ).to.be.revertedWith("Direct transfer disabled; use buyToken");
    });
  });
});
