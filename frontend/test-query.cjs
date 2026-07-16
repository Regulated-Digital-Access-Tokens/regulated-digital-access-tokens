const { ethers } = require("ethers");
const RegulatedTokenArtifact = require("./frontend/src/blockchain/RegulatedToken.json");

const CONTRACT_ADDRESS = "0x6B37969185920d59234b5Dcf5Bf7Fa25fdA794d3";
const DEPLOYMENT_BLOCK = 10782136;
const CONTRACT_ABI = RegulatedTokenArtifact.abi;

async function test() {
  const provider = new ethers.JsonRpcProvider("https://ethereum-sepolia-rpc.publicnode.com"); // Free public RPC for Sepolia
  const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

  try {
    const filter = contract.filters.TokenListed();
    console.log("Querying events...");
    const events = await contract.queryFilter(filter, DEPLOYMENT_BLOCK);
    console.log("Found events:", events.length);
  } catch (err) {
    console.error("Error:", err);
  }
}

test();
