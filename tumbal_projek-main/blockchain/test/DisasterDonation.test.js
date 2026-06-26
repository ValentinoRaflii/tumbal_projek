const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DisasterDonation", function () {
  let DisasterDonation;
  let contract;
  let owner;
  let admin2;
  let admin3;
  let donor1;
  let donor2;
  let receiver;
  
  beforeEach(async function () {
    [owner, admin2, admin3, donor1, donor2, receiver] = await ethers.getSigners();
    
    DisasterDonation = await ethers.getContractFactory("DisasterDonation");
    contract = await DisasterDonation.deploy();
    await contract.waitForDeployment();
    
    // Add additional admins
    await contract.addAdmin(admin2.address);
    await contract.addAdmin(admin3.address);
  });
  
  describe("Deployment", function () {
    it("Should set the right owner as admin", async function () {
      expect(await contract.admins(owner.address)).to.equal(true);
    });
    
    it("Should have correct admin count", async function () {
      expect(await contract.getAdminCount()).to.equal(3);
    });
    
    it("Should have required approvals set to 2", async function () {
      expect(await contract.requiredApprovals()).to.equal(2);
    });
  });
  
  describe("Campaign Creation", function () {
    it("Should create a new campaign", async function () {
      const target = ethers.parseEther("100");
      const duration = 30;
      
      await contract.createCampaign(
        "Earthquake Relief",
        "Sulawesi",
        "Help earthquake victims",
        target,
        duration
      );
      
      const campaign = await contract.getCampaign(1);
      expect(campaign.name).to.equal("Earthquake Relief");
      expect(campaign.target).to.equal(target);
      expect(campaign.active).to.equal(true);
    });
    
    it("Should emit CampaignCreated event", async function () {
      await expect(contract.createCampaign(
        "Flood Relief",
        "Jakarta",
        "Help flood victims",
        ethers.parseEther("50"),
        30
      )).to.emit(contract, "CampaignCreated");
    });
    
    it("Should not allow non-admin to create campaign", async function () {
      await expect(
        contract.connect(donor1).createCampaign(
          "Test",
          "Test",
          "Test",
          ethers.parseEther("10"),
          30
        )
      ).to.be.revertedWith("Not an admin");
    });
  });
  
  describe("Donations", function () {
    beforeEach(async function () {
      await contract.createCampaign(
        "Test Campaign",
        "Test Location",
        "Test Description",
        ethers.parseEther("100"),
        30
      );
    });
    
    it("Should accept donation", async function () {
      const donationAmount = ethers.parseEther("1");
      
      await expect(
        contract.connect(donor1).donate(1, { value: donationAmount })
      ).to.emit(contract, "DonationReceived");
      
      const raised = await contract.getTotalRaised(1);
      expect(raised).to.equal(donationAmount);
    });
    
    it("Should record donation details", async function () {
      const donationAmount = ethers.parseEther("2");
      
      await contract.connect(donor1).donate(1, { value: donationAmount });
      
      const donations = await contract.getDonations(1);
      expect(donations.length).to.equal(1);
      expect(donations[0].donor).to.equal(donor1.address);
      expect(donations[0].amount).to.equal(donationAmount);
    });
    
    it("Should not accept zero donation", async function () {
      await expect(
        contract.connect(donor1).donate(1, { value: 0 })
      ).to.be.revertedWith("Donation amount must be > 0");
    });
    
    it("Should not accept donation after campaign ends", async function () {
      // Increase time by 31 days
      await ethers.provider.send("evm_increaseTime", [31 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine");
      
      await expect(
        contract.connect(donor1).donate(1, { value: ethers.parseEther("1") })
      ).to.be.revertedWith("Campaign ended");
    });
  });
  
  describe("Disbursement", function () {
    beforeEach(async function () {
      await contract.createCampaign(
        "Test Campaign",
        "Test Location",
        "Test Description",
        ethers.parseEther("100"),
        30
      );
      
      // Add some funds
      await contract.connect(donor1).donate(1, { value: ethers.parseEther("10") });
      await contract.connect(donor2).donate(1, { value: ethers.parseEther("5") });
    });
    
    it("Should request disbursement", async function () {
      await expect(
        contract.requestDisbursement(
          1,
          receiver.address,
          ethers.parseEther("5"),
          "Food supplies"
        )
      ).to.emit(contract, "DisbursementRequested");
    });
    
    it("Should require admin approval", async function () {
      await contract.requestDisbursement(
        1,
        receiver.address,
        ethers.parseEther("5"),
        "Food supplies"
      );
      
      // First approval
      await contract.connect(admin2).approveDisbursement(1);
      
      const disbursement = await contract.getDisbursement(1);
      expect(disbursement.approveCount).to.equal(1);
      expect(disbursement.approved).to.equal(false);
      
      // Second approval releases funds
      const balanceBefore = await ethers.provider.getBalance(receiver.address);
      await contract.connect(admin3).approveDisbursement(1);
      const balanceAfter = await ethers.provider.getBalance(receiver.address);
      
      expect(balanceAfter - balanceBefore).to.equal(ethers.parseEther("5"));
    });
    
    it("Should not allow disbursement without sufficient funds", async function () {
      await expect(
        contract.requestDisbursement(
          1,
          receiver.address,
          ethers.parseEther("20"),
          "Too much"
        )
      ).to.be.revertedWith("Insufficient funds");
    });
  });
  
  describe("Admin Management", function () {
    it("Should add new admin", async function () {
      const newAdmin = donor1;
      await contract.addAdmin(newAdmin.address);
      expect(await contract.admins(newAdmin.address)).to.equal(true);
    });
    
    it("Should remove admin", async function () {
      await contract.removeAdmin(admin2.address);
      expect(await contract.admins(admin2.address)).to.equal(false);
    });
    
    it("Should update required approvals", async function () {
      await contract.updateRequiredApprovals(3);
      expect(await contract.requiredApprovals()).to.equal(3);
    });
  });
});