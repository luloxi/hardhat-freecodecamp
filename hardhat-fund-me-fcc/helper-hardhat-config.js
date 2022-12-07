// Useful to store information of different blockchains
const networkConfig = {
  // Specify networks by chainId
  5: {
    name: "goerli",
    ethUsdPriceFeed: "0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e"
  },
  137: {
    name: "polygon",
    ethUsdPriceFeed: "0xF9680D99D6C9589e2a93a78A04A279e509205945"
  }
  // 31337??
}

// Useful to specify which chains are local
const developmentChains = ["hardhat", "localhost"]

// Specify decimals and initial answer (eth price in usd) for the Mock constructor argument
const DECIMALS = 8
// It's 2000 with 8 decimal places
const INITIAL_ANSWER = 200000000000

// Export to use from other files
module.exports = { networkConfig, developmentChains, DECIMALS, INITIAL_ANSWER }
