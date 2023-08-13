const SimpleToken = artifacts.require("GJT");
const MyContract = artifacts.require("Goojob");

module.exports = async function(deployer, network, accounts) {
    // Deploy SimpleToken with an initialSupply of 1000 tokens for this example
    await deployer.deploy(SimpleToken, 1000000);
    const tokenInstance = await SimpleToken.deployed();

    // Deploy MyContract and pass the address of the just-deployed SimpleToken to its constructor
    await deployer.deploy(MyContract, tokenInstance.address);

    // Distribute the tokens to different addresses:
    await tokenInstance.transfer(accounts[0], 100000 );
    await tokenInstance.transfer(accounts[1], 50000 );
};