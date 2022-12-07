# Testing with FundMe contract

- To use, run `yarn`, then config the **.env** file to use it on testnet

Get .env configuration data from:

- https://pro.coinmarketcap.com/account
- https://etherscan.io/login?cmd=last
- https://auth.alchemy.com/?redirectUrl=https%3A%2F%2Fdashboard.alchemy.com%2F

## Easter Egg

This repository includes testing for FunWithStorage.sol, located in contracts/exampleContracts. It can be deployed with `yarn hardhat deploy --tags storage`

## Deploy

**hardhat-deploy** looks into the **deploy** folder to run deploy scripts with `yarn hardhat deploy` and also automatically deploys when running `yarn hardhat node`

- Deploy to Goerli testnet `yarn hardhat deploy --network goerli`

- Run with tags to just run specific deploy scripts with

```shell
yarn hardhat deploy --tags mocks
yarn hardhat deploy --tags fundme
```

## Tests

Unit tests are done locally

`yarn hardhat test`

- local hardhat
- forked hardhat <- Not covered here

To only perform tests containing specific words
`yarn hardhat test --grep "specific words"`

Tests can be disabled by changing **"it"** for **"xit"** in the test file.
They can also be marked to be the only ones to run by doing **"it.only"**

### Staging tests (testing on testnet)

They can be done on a testnet (slower, requires deploy). Reccomended to be done after local tests performed well.

```shell
yarn hardhat deploy --network goerli
yarn hardhat test --network goerli
```

## Scripts

To use them locally, run `yarn hardhat node` on one terminal, and then use `--network localhost` instead of **goerli**.

After deployed, contract can be funded manually with `yarn hardhat run scripts/fund.js --network goerli`

For withdraw, run `yarn hardhat run scripts/withdraw.js --network goerli`

## Breakpoints

Can be marked at the left side of each line of VS Code, for the code to stop there. Then, in the right tab **"Run and debug"**, open **JavaScript Debug Terminal** and you'll get a new console. Run `yarn hardhat test` to see what happened until the point you selected.

Then, we can go to the _debug console_ (at the left of the terminal tab) and type things like variable names to see what's inside them.

- To get **Gas Cost**, check out transactionReceipt on FundMe.test.js by putting a breakpoint right after it's declared, then on Javascript Debug Console look for gasUsed and effectiveGasPrice. Those are grabbed by the test to multiply and get the Gas cost.

## Gas report

Gas for **cheaperWithdraw** starts being more expensive than **withdraw** because it gets s_funders[] to memory, but it becomes increasingly cheaper as more funders get added to the list.

**gas-report.txt** gets generated after calling `yarn hardhat test`

## Add scripts to package.json

You can add shortcuts to frequently run commands like this:

```shell
"scripts": {
    "test": "yarn hardhat test"
}
```

Then you can just run `yarn test` on the terminal to run tests.

## Lint with solhint

First, create a solhint config file with `yarn solhint --init`

Then, you can use the script specified on package.json with `yarn lint`

And autofix with `yarn lint:fix`

## Price Feeds

FundMe and PriceConverter contracts are refactored to take a priceFeed address that's different across different blockchains.

These addresses are stored on **helper-hardhat-config.js**

- Get a different address here: https://docs.chain.link/docs/data-feeds/price-feeds/addresses/?network=ethereum

## Install dependencies manually

`yarn add --dev @chainlink/contracts hardhat-deploy @nomiclabs/hardhat-ethers@npm:hardhat-deploy-ethers ethers`
