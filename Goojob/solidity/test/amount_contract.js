const AmountContract = artifacts.require("AmountContract.sol");

contract("AmountContract", accounts => {
    let instance;
    const owner = accounts[0];
    const newAmount = 100;

    // before(async () => {
    //     instance = await AmountContract.deployed({owner});
    // });
    //
    // it("should set the amount by the owner", async () => {
    //     await instance.setAmount(newAmount, { from: owner });
    //     const amount = await instance.getAmount();
    //     assert.equal(amount, newAmount, "Amount was not set correctly");
    // });

    it("should allow anyone to get the amount", async () => {
        const storage = await AmountContract.new();
        await storage.setAmount(25);
        const result =  await storage.getAmount();
        assert(result.toString() ===  '25');
    });
    //
    // it("should not allow non-owner to set the amount", async () => {
    //     const nonOwner = accounts[1];
    //     try {
    //         await instance.setAmount(newAmount, { from: nonOwner });
    //     } catch (error) {
    //         assert(error.message.includes("Only the owner can call this function"), "Unexpected error message");
    //     }
    // });
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
