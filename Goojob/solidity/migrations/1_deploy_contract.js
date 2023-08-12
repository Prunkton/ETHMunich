const Goojob= artifacts.require ("Goojob.sol");
module.exports = function(deployer) {
    deployer.deploy(Goojob);
}