const { getNamedAccounts, deployments, ethers, network } = require("hardhat")
const { developmentChains, networkConfig } = require("../../helper-hardhat-config")
const { assert, expect } = require("chai")

// If not on a development chain
!developmentChains.includes(network.name)
    ? describe.skip // skip this test, otherwise...
    : describe("Raffle Unit Tests", async function () {
          // Global scope variables to take out of the beforeEach
          let raffle, vrfCoordinatorV2Mock, raffleEntranceFee, deployer, interval
          // Get chainId from hardhat-config.js
          const chainId = network.config.chainId

          // beforeEach test, do this
          beforeEach(async function () {
              deployer = (await getNamedAccounts()).deployer
              // run all deploy scripts with tag "all" on module.exports.tags
              await deployments.fixture("all")
              // Get Raffle contract connected to deployer
              raffle = await ethers.getContract("Raffle", deployer)
              // Get VRF Coordinator V2 Mock connected to deployer
              vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock", deployer)
              // Set raffleEntranceFee to the response of getEntranceFee() function
              raffleEntranceFee = await raffle.getEntranceFee()
              // Set interval to the respone of getInterval() function
              interval = await raffle.getInterval()
          })
          describe("constructor", function () {
              it("initializes the raffle correctly", async function () {
                  const raffleState = await raffle.getRaffleState()
                  // Ideally we make our tests have just 1 assert per "it"
                  assert.equal(raffleState.toString(), "0")
                  assert.equal(interval.toString(), networkConfig[chainId]["interval"])
              })
          })
          describe("enterRaffle", function () {
              it("reverts when you don't pay enough", async function () {
                  // Expect to be reverted if we don't pay the entranceFee
                  await expect(raffle.enterRaffle()).to.be.revertedWith(
                      "Raffle__NotEnoughETHEntered"
                  )
              })
              it("records players when they enter", async function () {
                  await raffle.enterRaffle({ value: raffleEntranceFee })
                  const playerFromContract = await raffle.getPlayer(0)
                  assert.equal(playerFromContract, deployer)
              })
              it("emits event on enter", async function () {
                  // Testing when an event gets fired
                  await expect(raffle.enterRaffle({ value: raffleEntranceFee })).to.emit(
                      raffle, // Raffle contract to emit
                      "RaffleEnter" // RafleEnter event
                  )
              })
              it("doesn't allow entrance when raffle is calculating", async function () {
                  // Enter raffle
                  await raffle.enterRaffle({ value: raffleEntranceFee })
                  // Tell the blockchain to increase time in "interval + 1" amount
                  await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
                  // Then, tell the blockchain to mine another block
                  await network.provider.send("evm_mine", [])
                  // we pretend to be a Chainlink Keeper
                  await raffle.performUpkeep([])
                  // Now, raffleState should be calculating and entering should fail
                  await expect(raffle.enterRaffle({ value: raffleEntranceFee })).to.be.revertedWith(
                      "Raffle__NotOpen"
                  )
              })
          })
          describe("checkUpkeep", function () {
              it("returns false if people haven't sent any ETH", async function () {
                  await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
                  await network.provider.send("evm_mine", [])
                  // callStatic simulates calling a transaction and seeing what
                  // it would respons. Then, we can get out what we want of that answer
                  const { upkeepNeeded } = await raffle.callStatic.checkUpkeep([])
                  // If upkeepNeeded returns false, pass this test
                  assert(!upkeepNeeded)
              })
              it("returns false if the raffle isn't open", async function () {
                  await raffle.enterRaffle({ value: raffleEntranceFee })
                  await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
                  await network.provider.send("evm_mine", [])
                  await raffle.performUpkeep([])
                  const raffleState = await raffle.getRaffleState()
                  const { upkeepNeeded } = await raffle.callStatic.checkUpkeep([]) // ([]) is the same as ("0x")
                  assert.equal(raffleState.toString(), "1")
                  assert.equal(upkeepNeeded, false)
              })
              it("returns false if enough time hasn't passed", async () => {
                  await raffle.enterRaffle({ value: raffleEntranceFee })
                  await network.provider.send("evm_increaseTime", [interval.toNumber() - 8])
                  await network.provider.send("evm_mine", [])
                  const { upkeepNeeded } = await raffle.callStatic.checkUpkeep("0x")
                  assert(!upkeepNeeded)
              })
              it("returns true if enough time has passed, has players, eth, and is open", async () => {
                  await raffle.enterRaffle({ value: raffleEntranceFee })
                  await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
                  await network.provider.send("evm_mine", [])
                  const { upkeepNeeded } = await raffle.callStatic.checkUpkeep("0x")
                  assert(upkeepNeeded)
              })
          })
          describe("performUpkeep", function () {
              it("can only run if checkUpkeep is true", async () => {
                  await raffle.enterRaffle({ value: raffleEntranceFee })
                  await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
                  await network.provider.send("evm_mine", [])
                  const tx = await raffle.performUpkeep("0x")
                  assert(tx)
              })
              it("reverts when checkUpkeep is false", async function () {
                  await expect(raffle.performUpkeep([])).to.be.revertedWith(
                      "Raffle__UpkeepNotNeeded"
                  )
              })
              it("updates the raffle state, emits an event and calls the vrf coordinator", async function () {
                  await raffle.enterRaffle({ value: raffleEntranceFee })
                  await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
                  await network.provider.send("evm_mine", [])
                  const txResponse = await raffle.performUpkeep([])
                  const txReceipt = await txResponse.wait(1)
                  const requestId = txReceipt.events[1].args.requestId
                  const raffleState = await raffle.getRaffleState()
                  assert(requestId.toNumber() > 0)
                  assert(raffleState.toString() == "1")
              })
          })
          describe("fulfullRandomWords", function () {
              beforeEach(async function () {
                  // We want someone to have entered the raffle before this tests
                  await raffle.enterRaffle({ value: raffleEntranceFee })
                  // And enough time has passed
                  await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
                  await network.provider.send("evm_mine", [])
              })
              it("can only be called after performUpkeep", async function () {
                  // No request should  be able to call this function directly
                  await expect(
                      vrfCoordinatorV2Mock.fulfillRandomWords(0, raffle.address)
                  ).to.be.revertedWith("nonexistent request")
                  await expect(
                      vrfCoordinatorV2Mock.fulfillRandomWords(1, raffle.address)
                  ).to.be.revertedWith("nonexistent request")
              })
              // Wayy to big test
              it("picks a winner, resets the lottery, and sends money", async function () {
                  const additionalEntrants = 3
                  const startingAccountIndex = 1 // deployer = 0
                  // Get accounts (all the available ones, not just named)
                  const accounts = await ethers.getSigners()
                  // Verbose but overcomplicated For Loop :)
                  for (
                      let i = startingAccountIndex;
                      i < startingAccountIndex + additionalEntrants;
                      i++
                  ) {
                      const accountConnectedRaffle = raffle.connect(accounts[i])
                      await accountConnectedRaffle.enterRaffle({ value: raffleEntranceFee })
                  }
                  // Keep note of our starting timestamp
                  const startingTimeStamp = await raffle.getLatestTimeStamp()

                  // performUpkeep (mock being chainlink keepers),
                  // which will kick off
                  // fulfillRandomWords (mock being the chainlink VRF)
                  // and then we simulate we have to wait for
                  // fulfillRandomWords to be called

                  // To simulate waiting, we need to set up a listener
                  // We don't want this test to finish before
                  // the listener has finished listening

                  // 2. When the WinnerPicked event is fired, this listener was
                  // already activated and waiting for it
                  await new Promise(async (resolve, reject) => {
                      // listen for the event WinnerPicked, then do some stuff
                      raffle.once("WinnerPicked", async () => {
                          // 3. It logs to console "Found the event!" and proceeds
                          //   console.log("Found the event 'WinnerPicked'!")
                          try {
                              // 4. getRecentWinner gives the latest winner now
                              const recentWinner = await raffle.getRecentWinner()
                              // 5. Log everything to get correct test info
                              //   console.log(`Winner: ${recentWinner}`)
                              //   console.log(`Account 0: ${accounts[0].address}`)
                              //   console.log(`Account 1: ${accounts[1].address}`)
                              //   console.log(`Account 2: ${accounts[2].address}`)
                              //   console.log(`Account 3: ${accounts[3].address}`)
                              // raffleState should be OPEN now (0)
                              const raffleState = await raffle.getRaffleState()
                              // endingTimeStamp should be greater than starting one
                              const endingTimeStamp = await raffle.getLatestTimeStamp()
                              // numPlayers should have been reset
                              const numPlayers = await raffle.getNumberOfPlayers()
                              // WinnerEndingBalance should be bigger now!
                              const winnerEndingBalance = await accounts[1].getBalance()
                              assert.equal(numPlayers.toString(), "0")
                              assert.equal(raffleState.toString(), "0")
                              assert(endingTimeStamp > startingTimeStamp)
                              assert.equal(
                                  winnerEndingBalance.toString(),
                                  winnerStartingBalance.add(
                                      raffleEntranceFee
                                          .mul(additionalEntrants)
                                          .add(raffleEntranceFee)
                                          .toString()
                                  )
                              )
                          } catch (error) {
                              reject(error)
                          }
                          resolve() // resolve to exit the try/catch
                      })
                      // Setting up the listener
                      // below, we will fire the event, and the listener will pick it up, and resolve

                      // Mocking Chainlink Keepers
                      const tx = await raffle.performUpkeep([])
                      const txReceipt = await tx.wait(1)
                      // Logging this now everyone has entered the raffle but
                      // before a winner is picked (it will always be account 1
                      // in the first round of local development)
                      const winnerStartingBalance = await accounts[1].getBalance()
                      // Mocking Chainlink VRF
                      // 1. Once this function is called, it should emit a winnerPicked event
                      await vrfCoordinatorV2Mock.fulfillRandomWords(
                          txReceipt.events[1].args.requestId,
                          raffle.address
                      )
                  })
              })
          })
      })
