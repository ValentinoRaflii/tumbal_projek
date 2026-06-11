const hre = require("hardhat");

async function main() {
  console.log("Deploying DisasterDonation contract...");
  
  const DisasterDonation = await hre.ethers.getContractFactory("DisasterDonation");
  const contract = await DisasterDonation.deploy();
  
  await contract.waitForDeployment();
  
  const contractAddress = await contract.getAddress();
  console.log("DisasterDonation deployed to:", contractAddress);
  
  // Wait for verification
  console.log("Waiting for block confirmations...");
  await contract.deploymentTransaction().wait(5);
  
  // Verify contract on Etherscan
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("Verifying contract on Etherscan...");
    try {
      await hre.run("verify:verify", {
        address: contractAddress,
        constructorArguments: [],
      });
      console.log("Contract verified!");
    } catch (error) {
      console.log("Verification error:", error);
    }
  }
  
  // Add additional admins
  console.log("Adding additional admins...");
  const adminAddresses = [
    "0xSecondAdminAddressHere",
    "0xThirdAdminAddressHere"
  ];
  
  for (const admin of adminAddresses) {
    try {
      const tx = await contract.addAdmin(admin);
      await tx.wait();
      console.log(`Added admin: ${admin}`);
    } catch (error) {
      console.log(`Failed to add admin ${admin}:`, error.message);
    }
  }
  
  console.log("\n✅ Deployment completed!");
  console.log("Contract Address:", contractAddress);
  console.log("Network:", hre.network.name);
  console.log("\n📝 Save these values in your .env file:");
  console.log(`CONTRACT_ADDRESS=${contractAddress}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});