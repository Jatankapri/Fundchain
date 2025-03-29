// SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;

import "@openzeppelin/contracts/access/AccessControl.sol";

/// @title Factory for Tender
/// @author Rekha Aryal
/// @notice You can use this contract to generate multiple tenders and act upon them based on the roles provided.
contract TenderFactory is AccessControl {
    bytes32 public constant AUTHORIZER_ROLE = keccak256("AUTHORIZER_ROLE");

    address public admin;
    uint public index;

    // Only contains registered tender addresses after deployment.
    address[] deployedAuthorizedTenders;
    address[] private authorizers; 

    event CreatedTender(
        address indexed owner,
        address deployedTender,
        string category,
        string image,
        uint createTime
    );
    event RegisteredProtocol(
        uint regNumber,
        address indexed client,
        string pdf,
        uint registeredTime
    );

    constructor() {
         admin=msg.sender;
       
                _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);

    }

    struct Protocol {
        string url;
        string image;
        string category;
        bool validated;
        address beneficiary;
        uint deadline;
        uint minimumContribution;
        uint target;
        uint number;
    }

    mapping(address => Protocol[]) public protocols;
    mapping(uint => Protocol) public protocolTrack;
    mapping(address => string) public authoirzerRoles;


    modifier onlyAdmin() {
        require(admin == msg.sender, "caller is not an admin");
        _;
    }

    /// @dev Registers the protocol for validation of a specific beneficiary.
    function registerProtocol(
        uint _min,
        uint _deadline,
        uint _target,
        string memory _url,
        string memory _image,
        string memory _category
    ) public {
        require(!hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "caller is an Admin");
        require(!hasRole(AUTHORIZER_ROLE, msg.sender), "caller is an Authorizer");

        Protocol memory item = Protocol({
            url: _url,
            beneficiary: msg.sender,
            category: _category,
            validated: false,
            minimumContribution: _min,
            target: _target,
            deadline: _deadline,
            image: _image,
            number: index
        });

        protocols[msg.sender].push(item);
        protocolTrack[index] = item;

        emit RegisteredProtocol(index, msg.sender, _url, block.timestamp);
        index++;
    }

    /// @dev Internal function to create tender after the validation of protocol by authorizer.
    function createTender(
        address creator,
        uint _deadline1,
        uint _target,
        uint _minimum,
        string memory _PdfUrl,
        uint num
    ) internal {
        Tender tenderPointer = new Tender();
        tenderPointer.registerTender(
            _target,
            _minimum,
            _PdfUrl,
            _deadline1,
            msg.sender,
            creator
        );
        deployedAuthorizedTenders.push(address(tenderPointer));

        emit CreatedTender(creator, address(tenderPointer), protocolTrack[num].category, protocolTrack[num].image, block.timestamp);
    }

    /// @dev Authorizer uses this function to validate the protocols.
    function validateProtocol(address _client, uint protocolNum) public {
        require(hasRole(AUTHORIZER_ROLE, msg.sender), "caller must be an Authorizer");

        Protocol[] storage list = protocols[_client];
        Protocol memory ProtocolItem;
        bool protocolFound = false;

        for (uint i = 0; i < list.length; i++) {
            if (list[i].number == protocolNum) {
                require(!list[i].validated, "already validated");
                ProtocolItem = list[i];
                ProtocolItem.validated = true;
                protocolTrack[protocolNum] = ProtocolItem;
                protocols[_client][i] = ProtocolItem;
                protocolFound = true;
            }
        }

        require(protocolFound, "Protocol not associated with this address");

        createTender(_client, ProtocolItem.deadline, ProtocolItem.target, ProtocolItem.minimumContribution, ProtocolItem.url, protocolNum);
    }

    function getProtocol() public view returns (Protocol[] memory) {
        return protocols[msg.sender];
    }

      /// @dev Admin can grant role to other accounts for the role of authorizer.
    function grantAuthorityRole(address _account) public onlyAdmin {
        require(!hasRole(AUTHORIZER_ROLE, _account), "This address is already an authorizer");
        grantRole(AUTHORIZER_ROLE, _account);
        authoirzerRoles[_account] = "granted";

        // Check if the account is already in the list
        bool exists = false;
        for (uint256 i = 0; i < authorizers.length; i++) {
            if (authorizers[i] == _account) {
                exists = true;
                break;
            }
        }

        // If the account is not in the list, add it
        if (!exists) {
            authorizers.push(_account);
        }
    }

    function revokeAuthorityRole(address _account) public onlyAdmin {
        require(hasRole(AUTHORIZER_ROLE, _account), "this address wasn't an authorizer");
        revokeRole(AUTHORIZER_ROLE, _account);
        authoirzerRoles[_account] = "revoked";

      
    }
     
      function getAuthorizerCurrentRoles() public view returns (address[] memory, string[] memory) {
        uint256 length = authorizers.length;
        address[] memory addresses = new address[](length);
        string[] memory statuses = new string[](length);

        for (uint256 i = 0; i < length; i++) {
            addresses[i] = authorizers[i];
            statuses[i] = authoirzerRoles[authorizers[i]];
        }

        return (addresses, statuses);
    }




    function getYourRole() public view returns (string memory) {
        return authoirzerRoles[msg.sender];
    }

    function getDeployedTenders() public view returns (address[] memory) {
        return deployedAuthorizedTenders;
    }

    function getUnauthorizedProtocols() public view returns (Protocol[] memory) {
        require(hasRole(AUTHORIZER_ROLE, msg.sender), "only authorizers can call this");

        Protocol[] memory lists = new Protocol[](index);
        uint counter = 0;
        for (uint i = 0; i < index; i++) {
            if (!protocolTrack[i].validated) {
                lists[counter] = protocolTrack[i];
                counter++;
            }
        }
        return lists;
    }
}

contract Tender {
    address public owner;
    address public authorizer;
    string public pdfUrl;
    uint256 public minimumContribution;
    uint public deadline;
    uint256 public target;
    uint256 public raisedTarget;
    uint256 public noOfDonors;
    uint256 public numRequests;
    uint256 public numOfRegisteredTender;
    bool public destroyed;

    event DonorEvent(address indexed donor, uint amount, uint time);

    constructor() {
        destroyed = false;
    }

    struct Request {
        string description;
        uint256 value;
        bool completed;
        uint256 noOfVoters;
        address payable recipient;
        mapping(address => bool) voters;
    }

    mapping(uint256 => Request) public requests;
    mapping(address => uint256) public donors;

    modifier onlyOwner() {
        require(!destroyed, "contract is not available");
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    modifier onlyDonor() {
        require(!destroyed, "contract is not available");
        require(donors[msg.sender] > 0, "Only donors can call this function");
        _;
    }

    modifier shouldNotDestroy() {
        require(!destroyed, "contract is destroyed");
        _;
    }

    /// @dev Register tender with details.
    function registerTender(
        uint256 _target,
        uint256 _minimum,
        string memory _url,
        uint _deadline,
        address _authorizer,
        address _beneficiary
    ) external {
        require(numOfRegisteredTender == 0, "only one tender can be registered");
        owner = _beneficiary;
        target = _target;
        minimumContribution = _minimum;
        pdfUrl = _url;
        deadline = block.timestamp + _deadline * 60;
        authorizer = _authorizer;
        numOfRegisteredTender++;
    }

    /// @dev Donate to the tender.
    function donate() public payable {
        require(block.timestamp < deadline, "Donation period is over");
        require(owner != msg.sender, "Owner can't donate to self");
        require(msg.value <= target, "Donation exceeds target");
        require(numRequests == 0, "Raised target has already met");

        require(msg.value >= minimumContribution, "Minimum donation not met");

        if (donors[msg.sender] == 0) {
            noOfDonors++;
        }
        donors[msg.sender] += msg.value;
        raisedTarget += msg.value;
        emit DonorEvent(msg.sender, msg.value, block.timestamp);
    }

    /// @dev Refund for donors if criteria are met.
    function refund() public onlyDonor shouldNotDestroy {
        require(block.timestamp < deadline && raisedTarget < target, "You are not eligible for refund");
        payable(msg.sender).transfer(donors[msg.sender]);
        donors[msg.sender] = 0;
        if (address(this).balance == 0) {
            destroyed = true;
        }
    }

    /// @dev Returns the current state of the tender.
    function readTenderStatus()
        public
        view
        returns (
            address,
            string memory,
            uint,
            uint,
            uint,
            uint,
            uint,
            uint,
            address,
            bool
        )
    {
        return (
            authorizer,
            pdfUrl,
            target,
            deadline,
            minimumContribution,
            raisedTarget,
            noOfDonors,
            numRequests,
            owner,
            destroyed
        );
    }

    /// @dev Create a request for fund usage.
    function createRequest(
        string memory _description,
        address payable _recipient,
        uint256 _value
    ) public payable onlyOwner shouldNotDestroy {
        // @todo
        require(block.timestamp >= deadline && raisedTarget <= target, "Doesn't meet request criteria");
        Request storage newRequest = requests[numRequests];
        newRequest.description = _description;
        newRequest.recipient = _recipient;
        newRequest.value = _value;
        newRequest.completed = false;
        newRequest.noOfVoters = 0;
        numRequests++;
    }

    /// @dev Donors vote for a request.
    function voteRequest(uint256 _requestNo) public onlyDonor shouldNotDestroy {
        require(donors[msg.sender] > 0, "You must be a contributor");
        Request storage thisRequest = requests[_requestNo];
        require(!thisRequest.voters[msg.sender], "You have already voted");

        thisRequest.voters[msg.sender] = true;
        thisRequest.noOfVoters++;
    }

    /// @dev Settle a request after sufficient votes.
    function settleRequest(uint256 _requestNo) public onlyOwner shouldNotDestroy {
        require(raisedTarget <= target, "Target not met");
        Request storage thisRequest = requests[_requestNo];
        require(!thisRequest.completed, "The request has already been completed");
        require(thisRequest.noOfVoters > noOfDonors / 2, "Majority does not support");

        thisRequest.recipient.transfer(thisRequest.value);
        thisRequest.completed = true;
    }
    function getRequeststatus(uint256 _i)
        public
        view
        returns (
            uint256,
            bool,
            uint256,
            address,
            uint256,
            string memory,
            address,
            uint256
        )
    {
        return (
            numOfRegisteredTender,
            requests[_i].completed,
            requests[_i].value,
            requests[_i].recipient,
            requests[_i].noOfVoters,
            requests[_i].description,
            owner,
            noOfDonors
        );
    }

    function getContractBalance() public view returns (uint) {
        return address(this).balance;
    }
}