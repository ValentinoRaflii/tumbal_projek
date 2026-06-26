const hre = require("hardhat");

async function main() {
console.log("Deploying DisasterDonation contract...");

const DisasterDonation = await hre.ethers.getContractFactory("DisasterDonation");
const contract = await DisasterDonation.deploy();

await contract.waitForDeployment();

const contractAddress = await contract.getAddress();

console.log("DisasterDonation deployed to:", contractAddress);
console.log("Deployment confirmed.");

// Verifikasi hanya untuk network publik
if (
hre.network.name !== "hardhat" &&
hre.network.name !== "localhost"
) {
console.log("Verifying contract on Etherscan...");

```
try {
  await hre.run("verify:verify", {
    address: contractAddress,
    constructorArguments: [],
  });

  console.log("Contract verified!");
} catch (error) {
  console.log("Verification error:", error.message);
}
```

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