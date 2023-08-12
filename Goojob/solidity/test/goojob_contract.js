const Goojob = artifacts.require("Goojob.sol");
//const accounts = require('./accounts.json');

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

    //it("should allow anyone to get the amount", async () => {
    //    const storage = await Goojob.new();
    //    await storage.setAmount(25);
    //    const result =  await storage.getAmount();
    //    assert(result.toString() ===  '25');
    //});


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
        const testAmount = web3.utils.toWei("1", "ether"); // 1 ETH for demonstration
        await instContractor.setupJob(testAmount, { from: contractor });
        const storedAmount = await instContractor.amount();
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


    it("should allow the freelancer to accept the contract", async () => {
        await instFreelancer.setupJob(25);
        await instFreelancer.acceptJob(true, { from: freelancer })
        const state_started = await instFreelancer.getState_started();
        console.log(state_started);
        assert.equal(state_started, true, "The state of the job changed to started");
    });

    it("should freeze the contributors balance while starting the contract", async () => {
        await instFreelancer.setContractor(contractor);
        console.log("contractor: " + contractor);
        const contractorFund = await instFreelancer.getLockedAmount({ from: contractor });
        console.log("contractorFund: " + contractorFund)
        await instFreelancer.setupJob(25);
        await instFreelancer.acceptJob(true, { from: freelancer })
        const contractorFundAfter = await instFreelancer.contractor().balance;
        console.log("contractorFundAfter: " + contractorFundAfter)
        const amount =  await instFreelancer.getAmount();
        assert.equal(contractorFund, contractorFundAfter + amount, "The state of the job changed to started");
    });

    

});

/*
contract Goojob_test {

    address contractorAddress = 0xdEF462DC6F8D7284269E08C2ec698a802f65554d;
    address payable payableContractorAddress = payable(contractorAddress);

    address freelancerAddress = 0xdEF462DC6F8D7284269E08C2ec698a802f65554d; // TODO: come up with another (valid) address
    address payable payableFreelancerAddress = payable(contractorAddress);

    address invalidAddress = address(0);
    address payable payableInvalidAddress = payable(invalidAddress);

    Goojob goojobTest;
    function beforeAll () public {
        goojobTest = new Goojob();
    }

    function ceckValidContractorAddress() public {
        console.log("Running ceckValidContractorAddress");
        goojobTest.setContractor(payableContractorAddress);
        Assert.equal(goojobTest.contractor(), payableContractorAddress, "contractor address appears to be correct");
    }

    function checkInvalidcontractorAddress() public {
        console.log("Running ceckInvalidcontractorAddress");
        goojobTest.setContractor(payableInvalidAddress);
        Assert.notEqual(goojobTest.contractor(), payableContractorAddress, "contractor address appears to be wrong - as expected");
    }

    function checkValidFreelancerAddress() public {
        console.log("Running checkValidFreelancerAddress");
        goojobTest.setFreelancerAccess(payableFreelancerAddress);
        Assert.equal(goojobTest.freelancer(), payableFreelancerAddress, "freelancer address appears to be correct");
    }

    function checkValidLockupAmount() public {
        console.log("Running checkValidLockupAmount");
        uint256 contractorBalanceBefore = goojobTest.contractor().balance;
        goojobTest.setupJob(100);
        Assert.equal(goojobTest.amount(), 100, "balance is locked up");
        uint256 adjustedBalanceBefore = contractorBalanceBefore - 100;
        Assert.notEqual(goojobTest.contractor().balance, adjustedBalanceBefore, "the balance value changed as expected");
    }

    function checkFreelancerAcceptedJob() public {
        console.log("Running checkFreelancerAcceptedJob");
        goojobTest.acceptJob(true);
        Assert.equal(goojobTest.state_started(), true, "The freelancer accepted the job offering");
    }

    function checkJobClosing() public {
        console.log("Running checkJobClosing");
        uint256 freelancerBalanceBefore = goojobTest.freelancer().balance;
        goojobTest.closeJob(true);
        Assert.notEqual(goojobTest.freelancer().balance, freelancerBalanceBefore + 100, "the balance value changed as expected");
    }

    function checkFullWalkthrough() public {
        console.log("1. Setup contractor address");
        ceckValidContractorAddress();
        console.log("2. Contractor setup freelancer address");
        checkValidFreelancerAddress();
        console.log("3. Contractor set balance amount to lockup");
        checkValidLockupAmount();
        console.log("4. Freelancer accepts job and trigger the lockup function");
        checkFreelancerAcceptedJob();
        console.log("5. Contractor sees the working contract as fullfilled and release the balance to the freelancers address");
        checkJobClosing();
        console.log("Test complete \\o/");
    }

    function checkEdgecases() public {
        checkInvalidcontractorAddress();
    }

    function ceckAll() public {
        checkEdgecases();
        checkFullWalkthrough();
    }
} 

*/
