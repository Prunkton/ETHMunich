// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";


/// @title GooJob, an EVM based freelancer<->contractor platform
/// @author prunkton.eth
/// @notice This is a ETHMunich 2023 hackathon project
/// @dev this contract is perfectly fine ;)
/// @custom:experimental My very first smart contract project
contract Goojob is Ownable {
    address payable public contractor;
    address payable public freelancer;

    uint256 amount; // the allowance the SC will freeze up from the contractor until the working contract is resolved
    bool state_started;  // if true, all parties agree on conditions
    address delegate; // person delegated to


    //constructor() {
    //    contractor = msg.sender;
    //}

    // Set contractor
    // is this redundant with constructor?
    function setContractor(address payable _contractor) public onlyOwner {
        require(_contractor != address(0), "Contractor address should not be the zero address");
        contractor = _contractor;
    }

    // The Contractor has to accept the freelancer
    function giveFreelancerAccess(address payable _freelancer) public isContractorAddressValid onlyOwner {
        require(_freelancer != address(0), "Freelancer address should not be the zero address");
        freelancer = _freelancer;
    }

    // the contractor is setting up the job
    // the contractor has to define the amount that should get locked up
    function setupJob(uint256 _amount) public isContractorAddressValid isFreelancerAddressValid onlyOwner{
        amount = _amount; //we don't check if the amount is available since we will lock it up at a later point
    }


    // Restricted function
    // only accessable by the freelancer
    function acceptJob(bool accept) public onlyFreelancerAllowed {
        state_started = accept;
        if(accept) {
            startJob();
        }
    }

    // Modifier to restrict function access
    modifier onlyFreelancerAllowed() {
        require(msg.sender == freelancer, "Not authorized");
        _;
    }

    modifier isContractorAddressValid() {
        require(contractor != address(0), "Contractor address should not be the zero address");
        _;
    }

    modifier isFreelancerAddressValid() {
        require(freelancer != address(0), "Freelancer address should not be the zero address");
        _;
    }

    function startJob() private {
        // lockup the amount on the contractors address
        lockFunds();
    }

    struct LockedBalance {
        uint256 amount; // potential code smell since already have a global amount?
        bool locked;
    }
    
    mapping(address => LockedBalance) public lockedBalances;

    // Lock funds for an address
    function lockFunds() public payable {
        require(lockedBalances[msg.sender].locked == false, "Funds already locked for this user");
        require(msg.value > amount, "Sent value must be greater than 0");

        lockedBalances[msg.sender] = LockedBalance(msg.value, true);
    }

    // Unlock and withdraw funds for the msg.sender's address
    function unlockAndWithdraw() public {
        LockedBalance storage userBalance = lockedBalances[msg.sender];
        
        require(userBalance.locked == true, "No funds locked for user");
        require(userBalance.amount > 0, "Insufficient locked funds");
        
        userBalance.amount = 0;
        userBalance.locked = false;
        
        payable(freelancer).transfer(amount);
    }

    // Fallback function to allow the contract to receive funds
    // Like unlockAndWithdraw() without the checks and the contractor as the recepient
    receive() external payable {
        LockedBalance storage userBalance = lockedBalances[msg.sender];
        
        require(userBalance.locked == true, "No funds locked for user");
        require(userBalance.amount > 0, "Insufficient locked funds");
        
        userBalance.amount = 0;
        userBalance.locked = false;
        
        payable(freelancer).transfer(amount);
        //emit Received(freelancer, amount); //make event first
    }

    function closeJob(bool conditionsMet) public payable onlyOwner {
        if(conditionsMet){
            unlockAndWithdraw();
        }else{
            // dublicate of 'received()' from above
            LockedBalance storage userBalance = lockedBalances[msg.sender];
            
            require(userBalance.locked == true, "No funds locked for user");
            require(userBalance.amount > 0, "Insufficient locked funds");
            
            userBalance.amount = 0;
            userBalance.locked = false;
            
            payable(freelancer).transfer(amount);
        }
    }
}
