const hre = require("hardhat");
const { ethers } = require("ethers");

async function main() {
  const contractAddress = process.env.CONTRACT_ADDRESS;
  if (!contractAddress) {
    console.error("Please set CONTRACT_ADDRESS in .env");
    process.exit(1);
  }
  
  const DisasterDonation = await hre.ethers.getContractFactory("DisasterDonation");
  const contract = DisasterDonation.attach(contractAddress);
  
  console.log("Interacting with contract at:", contractAddress);
  
  // Get contract info
  const adminCount = await contract.getAdminCount();
  console.log("Number of admins:", adminCount.toString());
  
  const admins = await contract.getAdmins();
  console.log("Admins:", admins);
  
  const requiredApprovals = await contract.requiredApprovals();
  console.log("Required approvals:", requiredApprovals.toString());
  
  const campaignCount = await contract.campaignCount();
  console.log("Total campaigns:", campaignCount.toString());
  
  // Create a test campaign
  if (campaignCount == 0) {
    console.log("\nCreating test campaign...");
    const tx = await contract.createCampaign(
      "Earthquake Relief - Test",
      "Sulawesi, Indonesia",
      "Emergency relief for earthquake victims",
      ethers.parseEther("100"),
      30
    );
    await tx.wait();
    console.log("Test campaign created!");
  }
  
  // Get campaign details
  const campaign = await contract.getCampaign(1);
  console.log("\nCampaign 1 details:");
  console.log("Name:", campaign.name);
  console.log("Target:", ethers.formatEther(campaign.target), "ETH");
  console.log("Raised:", ethers.formatEther(campaign.raised), "ETH");
  console.log("Active:", campaign.active);
}

main().catch(console.error);