# Upgradeable Contracts

Includes Sublesson explaining how a Proxy works and an example of using DelegateCall.

# About 

Upgrade Box -> BoxV2

1. Proxy contract pointing to Box
2. Proxy updated to point to BoxV2

## Options for Proxies

1. Deploy a Proxy manually
2. hardhat-deploy's built-in proxies <-
3. Openzeppelin upgrades plugin

# Install dependencies manually

`yarn add --dev @nomiclabs/hardhat-ethers@npm:hardhat-deploy-ethers ethers @nomiclabs/hardhat-etherscan @nomiclabs/hardhat-waffle chai ethereum-waffle hardhat hardhat-contract-sizer hardhat-deploy hardhat-gas-reporter prettier prettier-plugin-solidity solhint solidity-coverage dotenv`

`yarn add --dev @openzeppelin/hardhat-upgrades @openzeppelin/contracts`