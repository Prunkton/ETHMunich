// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

contract AmountContract {
    uint amount;



    function setAmount(uint _newAmount) external {
        amount = _newAmount;
    }

    function getAmount() external view returns (uint) {
        return amount;
    }
}
