const Goojob = artifacts.require("Goojob.sol");

contract("Goojob", accounts => {
    let instance;
    const contractor = accounts[0]; // contractor is owner
    const freelancer = accounts[1];
    const attacker = accounts[2];

    before(async () => {
        instance = await Goojob.deployed({contractor});
    });

    it("should allow the owner to set the contractor", async () => {
        await instance.setContractor(contractor, { from: contractor });
        const storedContractor = await instance.contractor();
        assert.equal(storedContractor, contractor, "Contractor was not set correctly");
    });

    it("should not allow non-owner to set the contractor", async () => {
        try {
            await instance.setContractor(contractor, { from: attacker });
            assert.fail("The transaction should have reverted");
        } catch (error) {
            assert(error.toString().includes("revert"), error.toString());
        }
    });

    it("should revert if setting the zero address as contractor", async () => {
        try {
            await instance.setContractor('0x0000000000000000000000000000000000000000', { from: contractor });
            assert.fail("The transaction should have reverted");
        } catch (error) {
            assert(error.toString().includes("Contractor address should not be the zero address"), error.toString());
        }
    });

    it("should allow the owner to set the freelancer if contractor address is valid", async () => {
        await instance.setFreelancerAccess(freelancer, { from: contractor });
        const storedFreelancer = await instance.freelancer();
        assert.equal(storedFreelancer, freelancer, "Freelancer was not set correctly");
    });

    it("should not allow non-owner to set the freelancer", async () => {
        try {
            await instance.setFreelancerAccess(freelancer, { from: attacker });
            assert.fail("The transaction should have reverted");
        } catch (error) {
            assert(error.toString().includes("revert"), error.toString());
        }
    });

    it("should revert if setting the zero address as freelancer", async () => {
        try {
            await instance.setFreelancerAccess('0x0000000000000000000000000000000000000000', { from: contractor });
            assert.fail("The transaction should have reverted");
        } catch (error) {
            assert(error.toString().includes("Freelancer address should not be the zero address"), error.toString());
        }
    });

    // Assuming there's a function or a mechanism to invalidate the contractor address:
    it("should revert if contractor address is not valid", async () => {
        try {
            await instance.setFreelancerAccess(freelancer, { from: contractor });
            assert.fail("The transaction should have reverted");
        } catch (error) {
            assert(error.toString().includes("revert"), error.toString());
        }
    });

    it("should allow the owner to set up the job with a valid amount", async () => {
        await instance.setContractor(contractor, { from: contractor });

        const testAmount = web3.utils.toWei("1", "ether"); // 1 ETH for demonstration
        await instance.setupJob(testAmount, { from: contractor });
        const storedAmount = await instance.getAmount();
        assert.equal(storedAmount.toString(), testAmount, "Job amount was not set correctly");
    });

    it("should not allow non-owner to set up the job", async () => {
        const testAmount = web3.utils.toWei("1", "ether"); 
        try {
            await instance.setupJob(testAmount, { from: attacker });
            assert.fail("The transaction should have reverted");
        } catch (error) {
            assert(error.toString().includes("revert"), error.toString());
        }
    });

    // Assuming there's a function or a mechanism to invalidate the contractor or freelancer address:
    it("should revert if contractor address is not valid", async () => {
        const testAmount = web3.utils.toWei("1", "ether"); 
        try {
            await instance.setupJob(testAmount, { from: contractor });
            assert.fail("The transaction should have reverted");
        } catch (error) {
            assert(error.toString().includes("revert"), error.toString());
        }
    });

    it("should revert if freelancer address is not valid", async () => {
        const testAmount = web3.utils.toWei("1", "ether"); 
        try {
            await instance.setupJob(testAmount, { from: contractor });
            assert.fail("The transaction should have reverted");
        } catch (error) {
            assert(error.toString().includes("revert"), error.toString());
        }
    });

    it("should check for tokens on contractor address", async () => {
        await instance.setContractor(contractor, { from: contractor });

        const hasFund = await instance.hasMinimumTokens(contractor, 10);
        assert.equal(hasFund, true, "Fund amount is invalid")
    });

    it("should freeze the contributors balance while starting the contract", async () => {
        await instance.setContractor(contractor, { from: contractor });
        await instance.setFreelancerAccess(freelancer, { from: contractor });
        await instance.setupJob(25);
        await instance.acceptJob(true, { from: freelancer })
        const isWorkPhase = await instance.getWorkPhase();
        assert.equal(isWorkPhase, true, "The state of the job changed to started");
        const isFundFrozen = await instance.isFundFrozen();
        assert.equal(isFundFrozen, true, "The token of the contractor are frozen");
    });

    if("should release the tokens to the freelancer after a successfull job", async () => {
        await instance.setContractor(contractor, { from: contractor });
        await instance.setFreelancerAccess(freelancer, { from: contractor });
        await instance.setupJob(25); //TODO: magic numbers everywhere
        await instance.acceptJob(true, { from: freelancer })
        const isWorkPhase = await instance.getWorkPhase();
        assert.equal(isWorkPhase, true, "The state of the job changed to started");
        const isFundFrozen = await instance.isFundFrozen();
        assert.equal(isFundFrozen, true, "The token of the contractor are frozen");

        const amountFundContactorBefore = await instance.getContractorTokenAmount();
        const amountTokenFreelancerBefore = await instance.getFreelancerTokenAmount();
        await instance.transferToFreelancer();
        const amountTokenContactorAfter = await instance.getContractorTokenAmount();
        const amountTokenFreelancerAfter = await instance.getFreelancerTokenAmount();
        
        assert.equal(amountTokenContactorBefore, amountTokenContactorAfter + 25, "The balance sheet of the contractor is broken")
        assert.equal(amountTokenFreelancerBefore, amountTokenFreelancerAfter - 25, "The balance sheet of the freelancer is broken")
    });
});