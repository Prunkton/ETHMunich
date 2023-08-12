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
    // it is not possible to activeley freeze or deposit funds from someones addres
    // so we need to wait for the contractor to deposit the fund on the SC
    function acceptJob(bool accept) public onlyFreelancerAllowed {
        if(accept) {
            require(address(this).balance > amount, "Sent value must be greater than 0");
            state_started = true;
        }else{
            state_started = false; // we are not able to track this event? 
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

    function closeJob(bool conditionsMet) public payable onlyOwner {
        require(state_started == true, "No funds locked for user");
        require(address(this).balance > amount, "Insufficient locked funds");
        if(conditionsMet){
            payable(freelancer).transfer(amount);
        }else{
            payable(contractor).transfer(amount);
        }
        amount = 0;
        state_started = false;
    }
}

