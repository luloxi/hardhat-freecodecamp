Just run `yarn` to install, then `yarn hardhat run scripts/aaveBorrow.js` to run the script.

_Everything is configured to run on a forked mainnet_

# What does the script do?

1. Convert ETH to WETH
2. Deposit WETH as collateral to AAVE
3. Borrow another asset: DAI
4. Repay the DAI
 
After running you keep a tiny debt that could get solved by adding some interaction with Uniswap

## _Tradeoffs of forking mainnet_

-   Pros: Quick, easy, resemble what's on mainnet
-   Cons: We need an API, some contracts are complex to work with and mocks might be better
