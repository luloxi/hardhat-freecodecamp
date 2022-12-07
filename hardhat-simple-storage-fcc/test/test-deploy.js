const { ethers } = require("hardhat")
const { expect, assert } = require("chai")

// "describe" takes a name and a function
describe("SimpleStorage", function () {
  // Initialize variables here to give them the same scope as "it"
  let simpleStorageFactory, simpleStorage
  // Code to run before each "it" test
  // In this case, deploy the contract
  beforeEach(async function () {
    simpleStorageFactory = await ethers.getContractFactory("SimpleStorage")
    simpleStorage = await simpleStorageFactory.deploy()
  })
  // "it" takes a name and a function like "desribe"
  it("Should start with a favorite number of 0", async function () {
    // Call the retrieve function and store it on a variable
    const currentValue = await simpleStorage.retrieve()
    // Reference value to compare
    const expectedValue = "0"
    // Assert has a lot of functions, equal compares values
    // Convert currentValue toString because it's a bigNumber
    assert.equal(currentValue.toString(), expectedValue)
  })
  it("Should update when we call store", async function () {
    // Value expected to get stored in the contract
    const expectedValue = "7"
    // Call store function and store the response
    const transactionResponse = await simpleStorage.store(expectedValue)
    // Wait for a block confirmation after calling store()
    await transactionResponse.wait(1)
    // Store the response of calling retrieve() after storing a number
    const currentValue = await simpleStorage.retrieve()
    assert.equal(currentValue.toString(), expectedValue)
    // The assert above is the same as this expect:
    expect(currentValue.toString()).to.equal(expectedValue)
  })
  it("Should store a Person on the people variable", async function () {
    const personName = "Luciano"
    const favoriteNumber = "13"
    // Store a Person in the people array
    const transactionResponse = await simpleStorage.addPerson(
      personName,
      favoriteNumber
    )
    // Wait for a block confirmation
    await transactionResponse.wait(1)

    // Get the first stored Person in the people array (starts at 0)
    const storedPerson = await simpleStorage.people(0)
    // Check if the string of both elements equals the storedPerson struct way of storing data
    assert.equal(
      [favoriteNumber, personName].toString(),
      storedPerson.toString()
    )
  })
  it("Should retrieve favoriteNumber from a person", async function () {
    const personName = "Luciano"
    const favoriteNumber = "13"
    // Store a Person in the people array
    const transactionResponse = await simpleStorage.addPerson(
      personName,
      favoriteNumber
    )
    // Wait for a block confirmation
    await transactionResponse.wait(1)
    // Retrieve favoriteNumber from the nameToFavoriteNumber mapping
    const storedFavoriteNumber = await simpleStorage.nameToFavoriteNumber(
      personName
    )

    expect(favoriteNumber).to.equal(storedFavoriteNumber)
  })
})
