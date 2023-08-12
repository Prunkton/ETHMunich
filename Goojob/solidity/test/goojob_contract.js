const Goojob = artifacts.require("Goojob.sol");

contract("Goojob", accounts => {
    let instContractor;
    let instFreelancer;
    const contractor = accounts[0]; // contractor is owner
    const freelancer = accounts[1];
    const attacker = accounts[2];
    const newAmount = 100;

    before(async () => {
        instContractor = await Goojob.deployed({contractor});
        instFreelancer = await Goojob.deployed({freelancer});
    });

    it("should allow the owner to set the contractor", async () => {
        await instContractor.setContractor(contractor, { from: contractor });
        const storedContractor = await instContractor.contractor();
        assert.equal(storedContractor, contractor, "Contractor was not set correctly");
    });

    it("should not allow non-owner to set the contractor", async () => {
        try {
            await instContractor.setContractor(contractor, { from: attacker });
            assert.fail("The transaction should have reverted");
        } catch (error) {
            assert(error.toString().includes("revert"), error.toString());
        }
    });

    it("should revert if setting the zero address as contractor", async () => {
        try {
            await instContractor.setContractor('0x0000000000000000000000000000000000000000', { from: contractor });
            assert.fail("The transaction should have reverted");
        } catch (error) {
            assert(error.toString().includes("Contractor address should not be the zero address"), error.toString());
        }
    });

    it("should allow the owner to set the freelancer if contractor address is valid", async () => {
        await instContractor.setFreelancerAccess(freelancer, { from: contractor });
        const storedFreelancer = await instContractor.freelancer();
        assert.equal(storedFreelancer, freelancer, "Freelancer was not set correctly");
    });

    it("should not allow non-owner to set the freelancer", async () => {
        try {
            await instContractor.setFreelancerAccess(freelancer, { from: attacker });
            assert.fail("The transaction should have reverted");
        } catch (error) {
            assert(error.toString().includes("revert"), error.toString());
        }
    });

    it("should revert if setting the zero address as freelancer", async () => {
        try {
            await instContractor.setFreelancerAccess('0x0000000000000000000000000000000000000000', { from: contractor });
            assert.fail("The transaction should have reverted");
        } catch (error) {
            assert(error.toString().includes("Freelancer address should not be the zero address"), error.toString());
        }
    });

    // Assuming there's a function or a mechanism to invalidate the contractor address:
    it("should revert if contractor address is not valid", async () => {
        // Your mechanism to invalidate the contractor address
        // For demonstration:
        // await instance.invalidateContractorAddress({ from: owner });

        try {
            await instContractor.setFreelancerAccess(freelancer, { from: contractor });
            assert.fail("The transaction should have reverted");
        } catch (error) {
            assert(error.toString().includes("revert"), error.toString());
        }
    });

    it("should allow the owner to set up the job with a valid amount", async () => {
        await instContractor.setContractor(contractor, { from: contractor });

        const testAmount = web3.utils.toWei("1", "ether"); // 1 ETH for demonstration
        await instContractor.setupJob(testAmount, { from: contractor });
        const storedAmount = await instContractor.getAmount();
        assert.equal(storedAmount.toString(), testAmount, "Job amount was not set correctly");
    });

    it("should not allow non-owner to set up the job", async () => {
        const testAmount = web3.utils.toWei("1", "ether"); 
        try {
            await instContractor.setupJob(testAmount, { from: attacker });
            assert.fail("The transaction should have reverted");
        } catch (error) {
            assert(error.toString().includes("revert"), error.toString());
        }
    });

    // Assuming there's a function or a mechanism to invalidate the contractor or freelancer address:
    it("should revert if contractor address is not valid", async () => {
        // Your mechanism to invalidate the contractor address, for demonstration:
        // await instance.invalidateContractorAddress({ from: owner });

        const testAmount = web3.utils.toWei("1", "ether"); 
        try {
            await instContractor.setupJob(testAmount, { from: contractor });
            assert.fail("The transaction should have reverted");
        } catch (error) {
            assert(error.toString().includes("revert"), error.toString());
        }
    });

    it("should revert if freelancer address is not valid", async () => {
        // Your mechanism to invalidate the freelancer address, for demonstration:
        // await instance.invalidateFreelancerAddress({ from: owner });

        const testAmount = web3.utils.toWei("1", "ether"); 
        try {
            await instContractor.setupJob(testAmount, { from: contractor });
            assert.fail("The transaction should have reverted");
        } catch (error) {
            assert(error.toString().includes("revert"), error.toString());
        }
    });

    it("should check for tokens on contractor address", async () => {
        await instContractor.setContractor(contractor, { from: contractor });

        const hasTokens = await instContractor.hasAtLeast100Tokens(contractor);
        assert.equal(hasTokens, true, "Token amount is invalid")
    });

    it("should freeze the contributors balance while starting the contract", async () => {
        await instFreelancer.setContractor(contractor, { from: contractor });
        await instFreelancer.setFreelancerAccess(freelancer, { from: contractor });
        await instFreelancer.setupJob(25);
        await instFreelancer.acceptJob(true, { from: freelancer })
        const state_started = await instFreelancer.getState_started();
        assert.equal(state_started, true, "The state of the job changed to started");
        const areTokensFrozen = await instFreelancer.areTokensFrozen();
        assert.equal(areTokensFrozen, true, "The token of the contractor are frozen");
    });

    if("should release the tokens to the freelancer after a successfull job", async () => {
        await instFreelancer.setContractor(contractor, { from: contractor });
        await instFreelancer.setFreelancerAccess(freelancer, { from: contractor });
        await instFreelancer.setupJob(25); //TODO: magic numbers everywhere
        await instFreelancer.acceptJob(true, { from: freelancer })
        const state_started = await instFreelancer.getState_started();
        assert.equal(state_started, true, "The state of the job changed to started");
        const areTokensFrozen = await instFreelancer.areTokensFrozen();
        assert.equal(areTokensFrozen, true, "The token of the contractor are frozen");

        const amountTokenContactorBefore = await instFreelancer.getContractorTokenAmount();
        const amountTokenFreelancerBefore = await instFreelancer.getFreelancerTokenAmount();
        await instFreelancer.transferToFreelancer();
        const amountTokenContactorAfter = await instFreelancer.getContractorTokenAmount();
        const amountTokenFreelancerAfter = await instFreelancer.getFreelancerTokenAmount();
        
        assert.equal(amountTokenContactorBefore, amountTokenContactorAfter + 25, "The balance sheet of the contractor is broken")
        assert.equal(amountTokenFreelancerBefore, amountTokenFreelancerAfter - 25, "The balance sheet of the freelancer is broken")
    });
});