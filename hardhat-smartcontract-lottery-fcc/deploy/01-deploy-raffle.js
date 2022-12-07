const { network, ethers } = require("hardhat")
const { developmentChains, networkConfig } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")

const VRF_SUB_FUND_AMOUNT = ethers.utils.parseEther("2")

// getNamedAccounts and deployments are input parameters (filled by hardhat?)
module.exports = async function ({ getNamedAccounts, deployments }) {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId
    let vrfCoordinatorV2Address, subscriptionId

    // If deployed on a local network, deploy a mock, else get address from
    // helper-hardhat-config
    if (developmentChains.includes(network.name)) {
        // Get the contract deployment on this internal variable
        const vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock")
        // Set the external variable to be used as a function argument for deploying
        vrfCoordinatorV2Address = vrfCoordinatorV2Mock.address
        // Creating a subscription on the Mock
        const transactionResponse = await vrfCoordinatorV2Mock.createSubscription()
        // Waiting for a block confirmation
        const transactionReceipt = await transactionResponse.wait()
        // Getting the subscriptionId from the transactionReceipt
        // From the receipt, we get the first event, which is the one generated
        // after calling createSubscription
        subscriptionId = transactionReceipt.events[0].args.subId
        // Fund the subscription of subscriptionId
        // Usually, you'd need the LINK token on a real network
        await vrfCoordinatorV2Mock.fundSubscription(subscriptionId, VRF_SUB_FUND_AMOUNT)
    } else {
        // From networkConfig of helper-hardhat-config, get this info
        vrfCoordinatorV2Address = networkConfig[chainId]["vrfCoordinatorV2"]
        subscriptionId = networkConfig[chainId]["subscriptionId"]
    }
    log("----------------------------------------------------")
    // Getting function arguments from networkConfig in helper-hardhat-config
    // Deploy function arguments
    const args = [
        vrfCoordinatorV2Address,
        networkConfig[chainId]["entranceFee"],
        networkConfig[chainId]["gasLane"],
        subscriptionId,
        networkConfig[chainId]["callbackGasLimit"],
        networkConfig[chainId]["interval"],
    ]

    // Deploy function
    const raffle = await deploy("Raffle", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })

    // Verify deployed contract
    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        log("Verifying...")
        await verify(raffle.address, args)
    }

    log("Enter lottery with command:")
    const networkName = network.name == "hardhat" ? "localhost" : network.name
    log(`yarn hardhat run scripts/enterRaffle.js --network ${networkName}`)
    log("----------------------------------------")
}

module.exports.tags = ["all", "raffle"]
