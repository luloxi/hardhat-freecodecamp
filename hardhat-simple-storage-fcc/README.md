# Sample Hardhat Project

- To deploy, run `yarn`, then config the **.env** file

Get .env configuration data from:

- https://pro.coinmarketcap.com/account
- https://etherscan.io/login?cmd=last
- https://auth.alchemy.com/?redirectUrl=https%3A%2F%2Fdashboard.alchemy.com%2F

## Run a Hardhat node (it's not hardhat network)

1. Run `yarn hardhat node`
2. Console response includes a RPC address. It may be `http://127.0.0.1:0545/`
3. Response also shows a list of accounts with their respective private keys.
4. To interact with the node, open a new terminal.
5. Run `yarn hardhat run scripts/deploy.js --network localhost` to deploy the SimpleStorage contract.
6. Go back to the node console to see the transaction data.

## Console (this works with ANY network)

For this example, we need a hardhat node running on another terminal

1. Open a console to interact directly with the node `yarn hardhat console --network localhost`
2. Interact with the same Javascript commands, like the ones in the deploy script.
3. Run this commands to deploy and then interact with the contract

```shell
const simpleStorageFactory = await ethers.getContractFactory("SimpleStorage")
const simpleStorage = await simpleStorageFactory.deploy()
await simpleStorage.retrieve()
await simpleStorage.store(55)
await simpleStorage.retrieve()
```

## Hardhat commands

### Hardhat tests

- Run tests: `yarn hardhat test`
- Run only tests containing specific words: `yarn hardhat test --grep store`
  (test file can also be modified with **xif** for functions to not run, and **if.only** to only run specific functions)
- Tests can report gas ussage with `REPORT_GAS=true npx hardhat test`e

### Hardhat tasks

- View accounts: `yarn hardhat accounts`
- View current block number: `yarn hardhat block-number`
- Current block number of Goerli testnet: `yarn hardhat block-number --network goerli`
- Verify deployed contract `yarn hardhat verify`

### Other Hardhat commands

- Check coverage of tests: `yarn hardhat coverage`
- Compile contracts: `yarn hardhat compile`
- Run the deploy script: `yarn hardhat run scripts/deploy.js`
  Also, it can be run specifying another network with `yarn hardhat run scripts/deploy.js --network goerli`
- Clear artifacts and cache folder `yarn hardhat clean`

- To view available Hardhat commands, run `yarn hardhat help`

## Install dependencies manually

`yarn add --dev dotenv @nomiclabs/hardhat-etherscan hardhat-gas-reporter solidity-coverage`
