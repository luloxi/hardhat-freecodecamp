const { getNamedAccounts, ethers, network } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")
const { assert } = require("chai")

// Are we on a local developmentChain  ???
developmentChains.includes(network.name)
  ? describe.skip // If condition above is true, skip tests, if false, continue
  : describe("FundMe", async function() {
      let fundMe
      let deployer
      const sendValue = ethers.utils.parseEther("0.1")
      beforeEach(async function() {
        deployer = (await getNamedAccounts()).deployer
        fundMe = await ethers.getContract("FundMe", deployer)
      })

      it("allows people to fund and withdraw", async function() {
        await fundMe.fund({ value: sendValue })
        const withdrawTxResponse = await fundMe.withdraw()
        const transactionReceipt = await withdrawTxResponse.wait(1)
        // When we use provider option, we get data from the blockchain
        const endingBalance = await fundMe.provider.getBalance(fundMe.address)
        assert.equal(endingBalance.toString(), "0")
      })
    })
