const { network } = require("hardhat")
const {
  developmentChains,
  DECIMALS,
  INITIAL_ANSWER
} = require("../helper-hardhat-config")

// If the contract doesn't exist, we deploy a minimal version of it for our local testing
module.exports = async ({ getNamedAccounts, deployments }) => {
  // Pull these two functions out of deployments
  const { deploy, log } = deployments
  // Get the account listed in hardhat.config.js on namedAccounts
  const { deployer } = await getNamedAccounts()
  // Get chainId for current network config
  const chainId = network.config.chainId

  // If deploy is on a local chain, deploy mocks.
  // network.name gets the name of the current network
  if (developmentChains.includes(network.name)) {
    log("Local network detected! Deploying mocks...")
    // Deploy the mock with some overrides
    await deploy("MockV3Aggregator", {
      contract: "MockV3Aggregator",
      from: deployer,
      log: true,
      // Get arguments from helper-hardhat-config
      args: [DECIMALS, INITIAL_ANSWER]
    })
    log("Mocks deployed!")
    log("-------------------------------------")
  }
}

// This tags allow to specify which scripts to run
module.exports.tags = ["all", "mocks"]
