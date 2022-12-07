require("@nomicfoundation/hardhat-toolbox")
// Import to verify contracts
require("@nomiclabs/hardhat-etherscan")
// Import dotenv and enable the config
require("dotenv").config()
// Import to report gas usage
require("hardhat-gas-reporter")
// Import to check coverage of tests
require("solidity-coverage")
// Import to use the "deploy" task
require("hardhat-deploy")

// Import .env variables
const GOERLI_RPC_URL = process.env.GOERLI_RPC_URL
const PRIVATE_KEY = process.env.PRIVATE_KEY
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  defaultNetwork: "hardhat",
  // Network data to deploy
  networks: {
    goerli: {
      url: GOERLI_RPC_URL,
      accounts: [PRIVATE_KEY],
      chainId: 5,
      // How many blocks we wanna wait
      blockConfirmations: 6
    },
    // Hardhat node network
    localhost: {
      url: "http://127.0.0.1:8545/",
      // accounts: Hardhat takes care of it
      chainId: 31337
    }
  },
  // Solidity version to compile contracts
  solidity: {
    compilers: [{ version: "0.8.8" }, { version: "0.6.6" }]
  },
  // Info to verify on Etherscan
  etherscan: {
    apiKey: ETHERSCAN_API_KEY
  },
  // Gas reporter configuration
  gasReporter: {
    enabled: true,
    // If not set, it will dislpay in console
    outputFile: "gas-report.txt",
    // When we output to a file, colors get messy
    noColors: true,
    coinmarketcap: COINMARKETCAP_API_KEY,
    // Token used for gas to reference price
    token: "MATIC",
    // Currency to display gas value (if none, default ETH)
    currency: "USD"
  },
  // Referenced with GetNamedAccounts of hre
  namedAccounts: {
    deployer: {
      // By default, the account number is 0
      default: 0
    }
  }
}
