// // Function to be exported to be read by hardhat-deploy dependency
// async function deployFunc() {
//   console.log("Hi")
// }
// module.exports.default = deployFunc

// --------------------------------

// // We're making the function above asyncronously
// module.exports = async hre => {
//   // Pull functions from hre (hardhat runtime environment)
//   const { getNamedAccounts, deployments } = hre
//   // Same as doing
//   // hre.getNamedAccounts
//   // hre.deployments
// }

// --------------------------------

// Network config is the module we import from the file that exports it
const { networkConfig, developmentChains } = require("../helper-hardhat-config")
const { network } = require("hardhat")
const { verify } = require("../utils/verify")

// We're using syntactic sugar on the previous way of writing the function
module.exports = async ({ getNamedAccounts, deployments }) => {
  // Pull these functions out of deployments
  const { deploy, log } = deployments
  // Get the account listed in hardhat.config.js on namedAccounts
  const { deployer } = await getNamedAccounts()
  // Get chainId for current network config
  const chainId = network.config.chainId

  // If chainId is X use address Y for priceFeed
  // If chainId is Z use address A for priceFeed

  let ethUsdPriceFeedAddress
  // If we're on a local network deploy a Mock
  if (developmentChains.includes(network.name)) {
    // Get the most recent deployment with .get
    const ethUsdAggregator = await deployments.get("MockV3Aggregator")
    // Set address of the deployment to ethUsdPriceFeedAddress variable
    ethUsdPriceFeedAddress = ethUsdAggregator.address
  } else {
    // From network config object, select by chainId and get priceFeed
    ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
  }

  const args = [ethUsdPriceFeedAddress]
  // When going for localhost or hardhat network we want to use a mock
  // We call the imported deploy function and specify overrides
  const fundMe = await deploy("FundMe", {
    from: deployer,
    args: args, // Put priceFeed address
    log: true,
    // how many confirmations to wait, specified in hardhat.config.js
    waitConfirmations: network.config.blockConfirmations || 1
  })

  // If NOT on a local network and ETHERSCAN API KEY is configured
  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    // Verify with the contract address and the constructor args
    await verify(fundMe.address, args)
  }
  log("-------------------------------------")
}

module.exports.tags = ["all", "fundme"]
