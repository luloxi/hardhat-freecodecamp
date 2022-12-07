// Required for yarn hardhat verify
const { run } = require("hardhat")

// Pass the constructor arguments into the second parameter (if any)
async function verify(contractAddress, args) {
  console.log("Verifying contract...")
  // Sometimes Etherscan verifies a contract with another similar and verify will throw an error, that's why we use try/catch
  try {
    // Run yarn hardhat verify --help to see more things to do with verify
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: args
    })
  } catch (e) {
    if (e.message.toLowerCase().includes("already verified")) {
      console.log("Already verified!")
    } else {
      console.log(e)
    }
  }
}

module.exports = { verify }
