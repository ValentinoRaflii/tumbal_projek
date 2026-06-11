// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract DisasterDonation {
    struct Campaign {
        uint256 id;
        string name;
        string location;
        string description;
        uint256 target;
        uint256 raised;
        uint256 startDate;
        uint256 endDate;
        bool active;
        address admin;
    }
    
    struct Donation {
        address donor;
        uint256 amount;
        uint256 timestamp;
        uint256 campaignId;
        string notes;
    }
    
    struct Disbursement {
        uint256 id;
        uint256 campaignId;
        address receiver;
        uint256 amount;
        string purpose;
        uint256 timestamp;
        bool approved;
        uint256 approveCount;
        mapping(address => bool) approvals;
    }
    
    mapping(uint256 => Campaign) public campaigns;
    mapping(uint256 => Donation[]) public campaignDonations;
    mapping(uint256 => Disbursement) public disbursements;
    mapping(address => bool) public admins;
    
    uint256 public campaignCount;
    uint256 public disbursementCount;
    address[] public adminList;
    uint256 public requiredApprovals = 2;
    
    event CampaignCreated(uint256 indexed id, string name, uint256 target);
    event DonationReceived(uint256 indexed campaignId, address donor, uint256 amount);
    event DisbursementRequested(uint256 indexed id, uint256 campaignId, uint256 amount);
    event FundsReleased(uint256 indexed disbursementId, address receiver, uint256 amount);
    event AdminAdded(address indexed admin);
    event AdminRemoved(address indexed admin);
    
    modifier onlyAdmin() {
        require(admins[msg.sender], "Not an admin");
        _;
    }
    
    modifier campaignExists(uint256 _campaignId) {
        require(_campaignId > 0 && _campaignId <= campaignCount, "Campaign does not exist");
        _;
    }
    
    modifier campaignActive(uint256 _campaignId) {
        require(campaigns[_campaignId].active, "Campaign not active");
        require(block.timestamp <= campaigns[_campaignId].endDate, "Campaign ended");
        _;
    }
    
    constructor() {
        admins[msg.sender] = true;
        adminList.push(msg.sender);
        emit AdminAdded(msg.sender);
    }
    
    function addAdmin(address _admin) external onlyAdmin {
        require(!admins[_admin], "Already an admin");
        admins[_admin] = true;
        adminList.push(_admin);
        emit AdminAdded(_admin);
    }
    
    function removeAdmin(address _admin) external onlyAdmin {
        require(admins[_admin], "Not an admin");
        require(adminList.length > requiredApprovals, "Cannot remove, need minimum admins");
        admins[_admin] = false;
        
        for(uint i = 0; i < adminList.length; i++) {
            if(adminList[i] == _admin) {
                adminList[i] = adminList[adminList.length - 1];
                adminList.pop();
                break;
            }
        }
        emit AdminRemoved(_admin);
    }
    
    function createCampaign(
        string memory _name,
        string memory _location,
        string memory _description,
        uint256 _target,
        uint256 _durationDays
    ) external onlyAdmin {
        require(_target > 0, "Target must be > 0");
        require(_durationDays > 0, "Duration must be > 0");
        
        campaignCount++;
        
        campaigns[campaignCount] = Campaign({
            id: campaignCount,
            name: _name,
            location: _location,
            description: _description,
            target: _target,
            raised: 0,
            startDate: block.timestamp,
            endDate: block.timestamp + (_durationDays * 1 days),
            active: true,
            admin: msg.sender
        });
        
        emit CampaignCreated(campaignCount, _name, _target);
    }
    
    function donate(uint256 _campaignId) external payable campaignExists(_campaignId) campaignActive(_campaignId) {
        require(msg.value > 0, "Donation amount must be > 0");
        
        campaigns[_campaignId].raised += msg.value;
        
        campaignDonations[_campaignId].push(Donation({
            donor: msg.sender,
            amount: msg.value,
            timestamp: block.timestamp,
            campaignId: _campaignId,
            notes: ""
        }));
        
        emit DonationReceived(_campaignId, msg.sender, msg.value);
    }
    
    function donateWithNote(uint256 _campaignId, string memory _notes) external payable campaignExists(_campaignId) campaignActive(_campaignId) {
        require(msg.value > 0, "Donation amount must be > 0");
        
        campaigns[_campaignId].raised += msg.value;
        
        campaignDonations[_campaignId].push(Donation({
            donor: msg.sender,
            amount: msg.value,
            timestamp: block.timestamp,
            campaignId: _campaignId,
            notes: _notes
        }));
        
        emit DonationReceived(_campaignId, msg.sender, msg.value);
    }
    
    function requestDisbursement(
        uint256 _campaignId,
        address _receiver,
        uint256 _amount,
        string memory _purpose
    ) external onlyAdmin campaignExists(_campaignId) {
        require(_amount <= campaigns[_campaignId].raised, "Insufficient funds");
        require(_receiver != address(0), "Invalid receiver address");
        
        disbursementCount++;
        
        Disbursement storage newDisbursement = disbursements[disbursementCount];
        newDisbursement.id = disbursementCount;
        newDisbursement.campaignId = _campaignId;
        newDisbursement.receiver = _receiver;
        newDisbursement.amount = _amount;
        newDisbursement.purpose = _purpose;
        newDisbursement.timestamp = block.timestamp;
        newDisbursement.approved = false;
        newDisbursement.approveCount = 0;
        
        emit DisbursementRequested(disbursementCount, _campaignId, _amount);
    }
    
    function approveDisbursement(uint256 _disbursementId) external onlyAdmin {
        Disbursement storage disbursement = disbursements[_disbursementId];
        require(!disbursement.approved, "Already approved");
        require(!disbursement.approvals[msg.sender], "Already approved by this admin");
        
        disbursement.approvals[msg.sender] = true;
        disbursement.approveCount++;
        
        if(disbursement.approveCount >= requiredApprovals) {
            disbursement.approved = true;
            
            Campaign storage campaign = campaigns[disbursement.campaignId];
            campaign.raised -= disbursement.amount;
            
            (bool success, ) = payable(disbursement.receiver).call{value: disbursement.amount}("");
            require(success, "Transfer failed");
            
            emit FundsReleased(_disbursementId, disbursement.receiver, disbursement.amount);
        }
    }
    
    function getCampaign(uint256 _campaignId) external view returns (
        uint256 id,
        string memory name,
        string memory location,
        string memory description,
        uint256 target,
        uint256 raised,
        uint256 startDate,
        uint256 endDate,
        bool active
    ) {
        Campaign storage c = campaigns[_campaignId];
        return (
            c.id,
            c.name,
            c.location,
            c.description,
            c.target,
            c.raised,
            c.startDate,
            c.endDate,
            c.active
        );
    }
    
    function getDonations(uint256 _campaignId) external view returns (Donation[] memory) {
        return campaignDonations[_campaignId];
    }
    
    function getDonationsCount(uint256 _campaignId) external view returns (uint256) {
        return campaignDonations[_campaignId].length;
    }
    
    function getTotalRaised(uint256 _campaignId) external view returns (uint256) {
        return campaigns[_campaignId].raised;
    }
    
    function getAdminCount() external view returns (uint256) {
        return adminList.length;
    }
    
    function getAdmins() external view returns (address[] memory) {
        return adminList;
    }
    
    function getDisbursement(uint256 _disbursementId) external view returns (
        uint256 id,
        uint256 campaignId,
        address receiver,
        uint256 amount,
        string memory purpose,
        uint256 timestamp,
        bool approved,
        uint256 approveCount
    ) {
        Disbursement storage d = disbursements[_disbursementId];
        return (
            d.id,
            d.campaignId,
            d.receiver,
            d.amount,
            d.purpose,
            d.timestamp,
            d.approved,
            d.approveCount
        );
    }
    
    function updateRequiredApprovals(uint256 _required) external onlyAdmin {
        require(_required > 0 && _required <= adminList.length, "Invalid number");
        requiredApprovals = _required;
    }
    
    receive() external payable {
        revert("Use donate() function");
    }
}