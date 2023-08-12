// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface ERC20Interface {
    function transferFrom(address from, address to, uint256 value) external returns (bool);
    function transfer(address to, uint256 value) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

/// @title Goojob, an EVM based freelancer<->contractor platform
/// @author prunkton.eth
/// @notice This is a ETHMunich 2023 hackathon project
/// @dev the basic idea is to leverage ERC20 to freeze some balance of the contractor to distribute it to the freelancer after a successfull partnership
/// @custom:experimental My very first smart contract project
contract Goojob is Ownable {
    address payable public contractor;
    address payable public freelancer;

    uint256 private amount; // the allowance the SC will freeze up from the contractor until the working contract is resolved
    bool private state_started;  // if true, all parties agree on conditions

    ERC20Interface public token;
    mapping(address => uint256) public frozenBalances;
    bool private fundsAreFrozen = false; // default state

    constructor(address _tokenAddress) {
        token = ERC20Interface(_tokenAddress);
    }

    function freezeTokens() private {
        require(!fundsAreFrozen, "Funds are currently frozen");
        frozenBalances[contractor] += amount;
        fundsAreFrozen = true;
    }

    function unlockTokensForContractor() private {
        require(!fundsAreFrozen, "Funds are currently frozen");
        require(frozenBalances[contractor] >= amount, "Insufficient frozen balance");
        
        frozenBalances[contractor] -= amount;
        require(token.transfer(contractor, amount), "Transfer failed");
        fundsAreFrozen = false;
    }

    function areTokensFrozen() public view returns(bool) {
        return fundsAreFrozen; //TODO unify funds/token/balance/amount
    }

    // Function to check if an address has at least a certain amount of tokens
    function hasMinimumTokens(address addr, uint256 _amount) public view returns (bool) {
        return token.balanceOf(addr) >= _amount;
    }

    // Example usage: Check if an address has at least 100 tokens
    function hasAtLeast100Tokens(address addr) public view returns (bool) {
        return hasMinimumTokens(addr, 100);
    }

    function getContractorTokenAmount() public view returns (uint256) {
        return token.balanceOf(contractor);
    }

    function getFreelancerTokenAmount() public view returns (uint256) {
        return token.balanceOf(freelancer);
    }

    // Set contractor
    // is this redundant with constructor?
    function setContractor(address payable _contractor) public onlyOwner {
        require(_contractor != address(0), "Contractor address should not be the zero address");
        contractor = _contractor;
    }

    function getContractor() public view returns(address) {
        return contractor;
    }

    function getState_started() public view returns(bool) {
        return state_started;
    }

    // The Contractor has to accept the freelancer
    function setFreelancerAccess(address payable _freelancer) public isContractorAddressValid onlyOwner {
        require(_freelancer != address(0), "Freelancer address should not be the zero address");
        freelancer = _freelancer;
    }

    function transferToFreelancer() private {
        require(token.transferFrom(contractor,freelancer, amount), "Transfer failed");
    }

    // the contractor is setting up the job
    // the contractor has to define the amount that should get locked up
    function setupJob(uint256 _amount) public isContractorAddressValid isFreelancerAddressValid onlyOwner{
        amount = _amount; //we don't check if the amount is available since we will lock it up at a later point
    }

    function getAmount() public view returns(uint256) {
        return amount;
    }

    // Restricted function
    // only accessable by the freelancer
    // it is not possible to activeley freeze or deposit funds from someones addres
    // so we need to wait for the contractor to deposit the fund on the SC
    function acceptJob(bool accept) public onlyFreelancerAllowed {
        if(accept) {
            freezeTokens();
            state_started = true;
        } else{
            unlockTokensForContractor();
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

