const { network } = require("hardhat")
const { developmentChains } = require("../helper-hardhat-config")

// For each request, there's a BASE FEE for every request.
// 0.25 is the premium. It costs 0.25 LINK per request
const BASE_FEE = ethers.utils.parseEther("0.25")
// Calculated value based on the gas price of the chain
// Chainlink nodes pay the gas fees to give us randomness & do external execution
// so, the price of requests fluctuate based on the price of gas in the blockchain
const GAS_PRICE_LINK = 1e9 // 1000000000 LINK per gas.

module.exports = async function ({ getNamedAccounts, deployments }) {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    // We can use the chainId because we only want to deploy on a development chain
    const chainId = network.config.chainId /* This doesnt get used */

    if (developmentChains.includes(network.name)) {
        log("Local network detected! Deploying mocks...")
        // deploy a mock vrfCoordinator
        await deploy("VRFCoordinatorV2Mock", {
            from: deployer,
            log: true,
            args: [BASE_FEE, GAS_PRICE_LINK],
        })
        log("Mocks deployed!")
        log("----------------------------------------------")
    }
}

module.exports.tags = ["all", "mocks"]
