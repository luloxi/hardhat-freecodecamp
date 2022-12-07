# Smart Contract Lottery

Using Chainlink Keepers for **automated execution** and Chainlink VRF for **randomness**

Raffle consists in these phases:

1. Enter the lottery (paying some amount)
2. Pick a random winner (verifiably random)
3. Winner to be selected every X minutes -> completely automated

## Setup

Run `yarn` to get the repo set up, then:

-   `yarn hardhat deploy` to deploy
-   `yarn hardhat test` to run tests

## .env file

To deploy on Goerli, complete the **.env** file with data from

-   https://pro.coinmarketcap.com/account
-   https://etherscan.io/login?cmd=last
-   https://auth.alchemy.com/?redirectUrl=https%3A%2F%2Fdashboard.alchemy.com%2F
-   Private Key from your wallet (don't use one with real funds!)
-   Get Goerli ETH and LINK here: https://faucets.chain.link/

# Usage

Get a **subscription ID** and **vrfCoordinatorV2 address** for your deployed contract on helper-hardhat-config

1. Get our SubId for Chainlink VRF
2. Deploy our contract using the SubId
3. Register the contract with Chainlink VRF & it's subId
4. Register the contract with Chainlink Keepers
5. Run staging tests

## Registration process

**Chainlink VRF**

1. Go to https://vrf.chain.link/
2. **Connect wallet** and click on **Create Subscription**, then **Create Subscription** again
3. Copy the **Subscription ID** to helper-hardhat-config on network **goerli**
4. Click on **Add funds** and add 2 LINK
5. Deploy `yarn hardhat deploy --network goerli`
6. Add the contract address as a consumer on Chainlink VRF

Now go to **Chainlink Keepers**

1. Go to https://keepers.chain.link/
2. Connect wallet and then **Register new upkeep**
3. Select **"custom logic"** for a trigger
4. Enter the contract address
5. As parameters, put whatever at **Upkeep name**, 500000 at **Gas limit**, 9 at **Starting balance (LINK)**, and leave everything else blank.

Great! Now you can run `yarn hardhat test --network goerli`

And also `yarn hardhat run scripts/enter.js`

# Chainlink VRF

Returns a random word (number).

-   Has to be funded with LINK to work.

-   **keyHash**: The **gas lane** key hash value, which is the maximum gas price you're willing to pay for a request in wei. It functions as an ID of the off-chain VRF job that runs in reponse to requests.

To see different addresses for VRF contracts:
https://docs.chain.link/docs/vrf/v2/subscription/supported-networks/

-   **Subscription ID** is the subscription that we need for funding our requests

# Chainlink Keepers

To trigger smart contracts based on some parameter (price of an asset, time based, amount of an asset in a liquidity pool, etc).

Requisites:

1. Run (deploy) a smart contract that is compatible with Chainlink Keepers
2. Register that smart contract for upkeep with the Chainlink Keeper network
3. Keepers has to be funded with LINK to work.

## Keepers use two important methods: checkUpkeep and performUpkeep

**checkUpkeep** uses off-chain computation by a node of the Chainlink Keeper network. If it returns that an upkeep is needed, then the Chainlink Keeper will call **performUpkeep**.

These methods can generate data off-chain called checkData and performData, but this variables are not used in this repo.

## On Etherscan

Calls to performUpkeep and fulfillRandomWords show up in Internal Txs of the contract. That's because they are external and internal transactions.

## Install dependencies manually

`yarn add --dev @chainlink/contracts`

`npm install --global hardhat-shorthand` to use commands like `hh compile` instead of `yarn hardhat compile`

`yarn add --dev @nomiclabs/hardhat-ethers@npm:hardhat-deploy-ethers ethers @nomiclabs/hardhat-etherscan @nomiclabs/hardhat-waffle chai ethereum-waffle hardhat hardhat-contract-sizer hardhat-deploy hardhat-gas-reporter prettier prettier-plugin-solidity solhint solidity-coverage dotenv`
