const { deployments, ethers, getNamedAccounts, network } = require("hardhat")
const { assert, expect } = require("chai")
const { developmentChains } = require("../../helper-hardhat-config")

// Are we NOT on a local developmentChain  ???
!developmentChains.includes(network.name)
  ? describe.skip // If condition above is true, skip tests, if false, continue
  : describe("FundMe", function() {
      // This converts the number to wei value
      // "1000000000000000000" // 1 eth
      const sendValue = ethers.utils.parseEther("1")

      // declare here to get it on the right scope
      let fundMe
      let mockV3Aggregator
      let deployer
      beforeEach(async function() {
        // deploy fundMe contract  using hardhat deploy

        // // Get accounts from hardhat config on "accounts" variable
        // const accounts = await ethers.getSigners()
        // const accountZero = accounts[0]

        // Get deployer from hardhat.config.js namedAccounts
        deployer = (await getNamedAccounts()).deployer
        // fixture runs the entire deploy folder with as many tags as we want
        await deployments.fixture(["all"])
        // getContract gets the most recent reployment of the specified contract and connects it to the specified account
        fundMe = await ethers.getContract("FundMe", deployer)
        mockV3Aggregator = await ethers.getContract(
          "MockV3Aggregator",
          deployer
        )
      })
      describe("constructor", function() {
        it("Sets the aggregator address correctly", async function() {
          // priceFeed should be the Mock address on local network
          const response = await fundMe.getPriceFeed()
          assert.equal(response, mockV3Aggregator.address)
        })
      })
      describe("fund", function() {
        it("Fails if you don't send enough ETH", async function() {
          // expect can be used to listen for errors
          await expect(fundMe.fund()).to.be.revertedWith(
            "You need to spend more ETH!"
          )
        })
        it("Updates the amount funded data structure", async function() {
          // Adding {} after arguments allows to pay payable functions
          await fundMe.fund({ value: sendValue })
          // Amount of eth stored in the contract by deployer
          const response = await fundMe.getAddressToAmountFunded(deployer)
          // Convert to String because they are a bignumber
          assert.equal(response.toString(), sendValue.toString())
        })
        it("Adds funder to array of funders", async function() {
          // Send 1 eth after specifying arguments (none) for the fund function
          await fundMe.fund({ value: sendValue })
          // CHeck to see if sender has been added to funders array
          const funder = await fundMe.getFunder(0)
          assert.equal(funder, deployer)
        })
      })
      describe("withdraw", function() {
        // Fund the contract before each test of this section
        beforeEach(async function() {
          await fundMe.fund({ value: sendValue })
        })
        it("Withdraw ETH from a single founder", async function() {
          // Arrange

          // Get the starting balance of the contract
          const startingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          )
          // and the starting balance of the calling account
          const startingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          )

          // Act

          // Call the withdraw function
          const transactionResponse = await fundMe.withdraw()
          // Wait for 1 block confirmation
          const transactionReceipt = await transactionResponse.wait(1)
          // Found these variables looking at Javascript Debug Console
          const { gasUsed, effectiveGasPrice } = transactionReceipt
          // Multiply these bigNumbers to get the gasCost
          const gasCost = gasUsed.mul(effectiveGasPrice)
          // Get the contract balance after the withdraw
          const endingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          )
          // Get deployer balance after the withdraw
          const endingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          )
          // get gasCost

          // Assert
          // Contract should be empty as deployer was the only funder
          assert.equal(endingFundMeBalance, 0)
          // Ending deployer balance should include the balance of both starting conditions
          // .add() to add because we're treating with bigNumbers
          // gasCost because calling withdraw function costs gas
          // toString() because identity is a bit weird here
          assert.equal(
            startingFundMeBalance.add(startingDeployerBalance).toString(),
            endingDeployerBalance.add(gasCost).toString()
          )
        })
        it("allows to withdraw with multiple funders", async function() {
          // Arrange

          // Get accounts with ethers
          const accounts = await ethers.getSigners()
          // Start at 1 because 0 is the deployer
          for (let i = 1; i < 6; i++) {
            // Connect the contract to the current account
            const fundMeConnectedContract = await fundMe.connect(accounts[i])
            // Fund the contract
            await fundMeConnectedContract.fund({ value: sendValue })
          }
          const startingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          )
          const startingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          )

          // Act
          const transactionResponse = await fundMe.withdraw()
          const transactionReceipt = await transactionResponse.wait(1)
          const { gasUsed, effectiveGasPrice } = transactionReceipt
          const withdrawGasCost = gasUsed.mul(effectiveGasPrice)
          const endingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          )
          const endingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          )

          // Assert
          assert.equal(endingFundMeBalance, 0)
          assert.equal(
            startingFundMeBalance.add(startingDeployerBalance).toString(),
            endingDeployerBalance.add(withdrawGasCost).toString()
          )
          // Make sure the funders are reset properly
          await expect(fundMe.getFunder(0)).to.be.reverted
          // Make sure all funders registry in the contract return 0 balance
          for (i = 1; i < 6; i++) {
            assert.equal(
              await fundMe.getAddressToAmountFunded(accounts[i].address),
              0
            )
          }
        })
        it("Only allows the owner to withdraw", async function() {
          const accounts = await ethers.getSigners()
          // Address 0 is the deployer of the contract (owner), 1 is attacker
          const attacker = accounts[1]
          // Get an instance of the contract with attacker connected to it
          // We don't specify .address on attacker because its an account object, not just it's address
          const attackerConnectedContract = await fundMe.connect(attacker)
          await expect(attackerConnectedContract.withdraw()).to.be
            .reverted /* With("FundMe__NotOwner") */
        })
      })
      describe("cheaperWithdraw", function() {
        it("cheaperWithdraw ETH from a single founder", async function() {
          const startingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          )
          const startingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          )
          // The only difference with the withdraw test above
          const transactionResponse = await fundMe.cheaperWithdraw()
          const transactionReceipt = await transactionResponse.wait(1)
          const { gasUsed, effectiveGasPrice } = transactionReceipt
          const gasCost = gasUsed.mul(effectiveGasPrice)
          const endingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          )
          const endingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          )
          assert.equal(endingFundMeBalance, 0)
          assert.equal(
            startingFundMeBalance.add(startingDeployerBalance).toString(),
            endingDeployerBalance.add(gasCost).toString()
          )
        })
        it("cheaperWithdraw testing with multiple funders", async function() {
          const accounts = await ethers.getSigners()
          for (let i = 1; i < 6; i++) {
            const fundMeConnectedContract = await fundMe.connect(accounts[i])
            await fundMeConnectedContract.fund({ value: sendValue })
          }
          const startingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          )
          const startingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          )
          const transactionResponse = await fundMe.cheaperWithdraw()
          const transactionReceipt = await transactionResponse.wait(1)
          const { gasUsed, effectiveGasPrice } = transactionReceipt
          const withdrawGasCost = gasUsed.mul(effectiveGasPrice)
          const endingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          )
          const endingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          )
          assert.equal(endingFundMeBalance, 0)
          assert.equal(
            startingFundMeBalance.add(startingDeployerBalance).toString(),
            endingDeployerBalance.add(withdrawGasCost).toString()
          )
          await expect(fundMe.getFunder(0)).to.be.reverted
          for (i = 1; i < 6; i++) {
            assert.equal(
              await fundMe.getAddressToAmountFunded(accounts[i].address),
              0
            )
          }
        })
      })
    })
