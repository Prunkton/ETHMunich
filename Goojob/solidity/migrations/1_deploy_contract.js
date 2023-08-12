const AmountContract= artifacts.require ("AmountContract.sol");
module.exports = function(deployer) {
    deployer.deploy(AmountContract);
}