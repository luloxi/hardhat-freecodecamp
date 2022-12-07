// Imports
// import ethers directly from hardhat
// run allows us to run any hardhat task
// network imports network configuration information
const { ethers, run, network } = require("hardhat")

// Async main function
async function main() {
  // With hardhat ethers, we can specify directly the name and it'll know it has to look for it in the contracts folder
  const SimpleStorageFactory = await ethers.getContractFactory("SimpleStorage")
  // Deploy the contract
  console.log("Deploying the contract...")
  const simpleStorage = await SimpleStorageFactory.deploy()
  // Wait to make sure it gets deployed
  await simpleStorage.deployed()
  console.log(`Deployed contract to ${simpleStorage.address}`)

  // What happens when we deploy to our hardhat network?
  // console.log(network.config)

  // If we're on Goerli Network and we have an ETHERSCAN_API_KEY
  if (network.config.chainId === 5 && process.env.ETHERSCAN_API_KEY) {
    // Wait for 6 block confirmations
    console.log("Waiting for 6 block txes...")
    await simpleStorage.deployTransaction.wait(6)
    // Run the verify function with no constructor arguments
    await verify(simpleStorage.address, [])
  }

  // Call function retrieve() of the simpleStorage deployed contract
  const currentValue = await simpleStorage.retrieve()
  console.log(`Current value: ${currentValue}`)
  // Update the current value
  const transactionResponse = await simpleStorage.store(7)
  // Wait for a block confirmation
  await transactionResponse.wait(1)
  // Get the value again
  const updatedValue = await simpleStorage.retrieve()
  console.log(`Updated value: ${updatedValue}`)
}

// Pass the constructor arguments into the second parameter (if any)
async function verify(contractAddress, args) {
  console.log("Verifying contract...")
  // Sometimes Etherscan verifies a contract with another similar and verify will throw an error, that's why we use try/catch
  try {
    // Run yarn hardhat verify --help to see more things to do with verify
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: args,
    })
  } catch (e) {
    if (e.message.toLowerCase().includes("already verified")) {
      console.log("Already verified!")
    } else {
      console.log(e)
    }
  }
}

// Main
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
