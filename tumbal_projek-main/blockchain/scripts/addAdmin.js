const hre = require("hardhat");

async function main() {
  const contractAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

  const [signer] = await hre.ethers.getSigners();

  console.log("Using signer:", signer.address);

  const contract = await hre.ethers.getContractAt(
    "DisasterDonation",
    contractAddress,
    signer
  );

  const newAdmin = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"; // ganti ini

  console.log("Adding admin...");

  const tx = await contract.addAdmin(newAdmin);
  await tx.wait();

  console.log("✅ Admin berhasil ditambahkan:", newAdmin);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});