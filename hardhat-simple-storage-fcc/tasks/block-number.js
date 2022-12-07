// Manually added Hardhat task

const { task } = require("hardhat/config")

task("block-number", "Prints the current block number").setAction(
  // taskArgs are arguments to get passed to the task
  // hre is hardhat runtime environment
  async (taskArgs, hre) => {
    // Use function from the ethers package
    const blockNumber = await hre.ethers.provider.getBlockNumber()
    console.log(`Current block number: ${blockNumber}`)
  }
)
