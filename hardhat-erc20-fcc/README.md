# ERC20 Token example

Suite to test and deploy a basic ERC20 token.

Run `yarn` to get the repo set up, then:

- `yarn hardhat deploy` to test the deploy
- `yarn hardhat test` to run tests

To deploy on Goerli, complete the **.env** file

Get .env configuration data from:

- https://pro.coinmarketcap.com/account
- https://etherscan.io/login?cmd=last
- https://auth.alchemy.com/?redirectUrl=https%3A%2F%2Fdashboard.alchemy.com%2F

_Still lacks tests for testnet_

If there are dependencies missing, run `yarn add --dev @nomiclabs/hardhat-ethers@npm:hardhat-deploy-ethers ethers @nomiclabs/hardhat-etherscan @nomiclabs/hardhat-waffle chai ethereum-waffle hardhat hardhat-contract-sizer hardhat-deploy hardhat-gas-reporter prettier prettier-plugin-solidity solhint solidity-coverage dotenv`
