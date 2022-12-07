const { getNamedAccounts, deployments, ethers, network } = require("hardhat")
const { developmentChains, networkConfig } = require("../../helper-hardhat-config")
const { assert, expect } = require("chai")

// If not on a development chain
!developmentChains.includes(network.name)
  ? describe.skip // skip this test, otherwise...
  : describe("basicNft Unit Tests", async function () {
      let deployer, BasicNft

      beforeEach(async function () {
        accounts = await ethers.getSigners()
        deployer = accounts[0]
        await deployments.fixture("basicnft")
        BasicNft = await ethers.getContract("BasicNft")
      })
      describe("Wake up sunshine", function () {
        it("initializes the contract correctly", async function () {
          const name = await BasicNft.name()
          const symbol = await BasicNft.symbol()
          const tokenCounter = await BasicNft.getTokenCounter()
          assert.equal(name, "Dogie")
          assert.equal(symbol, "DOG")
          assert.equal(tokenCounter.toString(), "0")
        })
      })
      describe("Mint NFT", () => {
        beforeEach(async () => {
          const transactionResponse = await BasicNft.mintNft()
          await transactionResponse.wait(1)
        })
        it("updates tokenCounter and tokenURI", async function () {
          const tokenCounter = await BasicNft.getTokenCounter()
          const tokenURI = await BasicNft.tokenURI(0)
          assert.equal(tokenCounter.toString(), "1")
          assert.equal(tokenURI.toString(), await BasicNft.TOKEN_URI())
        })
        it("Shows the correct balance and owner of an NFT", async function () {
          const deployerAddress = deployer.address
          const deployerBalance = await BasicNft.balanceOf(deployerAddress)
          // Maybe someday I'll figure out how to make this work
          //   const owner = await BasicNft.ownerOf("1")

          assert.equal(deployerBalance.toString(), "1")
          // assert.equal(owner, deployerAddress)
        })
      })
    })
