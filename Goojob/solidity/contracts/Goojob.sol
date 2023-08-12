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

    uint256 public amount; // the allowance the SC will freeze up from the contractor until the working contract is resolved
    bool public state_started;  // if true, all parties agree on conditions



    //constructor() {
    //    contractor = msg.sender;
    //}

    // Set contractor
    // is this redundant with constructor?
    function setContractor(address payable _contractor) public onlyOwner {
        require(_contractor != address(0), "Contractor address should not be the zero address");
        contractor = _contractor;
    }

    function getState_started() public view returns(bool) {
        return state_started;
    }

    // The Contractor has to accept the freelancer
    function setFreelancerAccess(address payable _freelancer) public isContractorAddressValid onlyOwner {
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
        }else{
            // do anything?
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

    mapping(address => LockedBalance) public lockedBalances;

    function getLockedAmount() public returns(uint256) {
        return lockedBalances[contractor].amount;
    }

    function startJob() private {
        // lockup the amount on the contractors address
        require(lockedBalances[contractor].locked == false, "Funds already locked for this user");
        require(contractor.balance > amount, "Sent value must be greater than 0");

        lockedBalances[contractor] = LockedBalance(amount, true);
    }

    struct LockedBalance {
        uint256 amount; // potential code smell since already have a global amount?
        bool locked;
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
