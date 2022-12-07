# Basics on how Ethers.js works

## Setup

Clone this repo

`git clone https://github.com/PatrickAlphaC/ethers-simple-storage`

`cd ethers-simple-storage`

Then install dependencies

`yarn`

Then compile to get ABI and Binary files

`yarn compile`

(you can make the .abi file easier to read by changing it's extension to .json, then saving formatting it with Prettier extension, then changing the extension to .abi again)

## Dependencies setup (if not auto installed)

Install the Solidity compiler for the contract's version
`yarn add solc@0.8.7-fixed`

Install Ethers
`yarn add ethers`

Install Dotenv
`yarn add dotenv`

Install Prettier
`yarn add prettier prettier-plugin-solidity`

## To try out the deploy script on Ganache

Download Ganache and run it to get the RPC URL and Private Key

https://trufflesuite.com/ganache/

Then rename **.env.example** to **.env** and fill in the blanks with Ganache data.

Finally, run `node deploy.js`

You can also try `node tx-deploy.js` to do it by sending raw transaction data

## Try out the deploy script on Goerli

Replace **GOERLI_RPC_URL** and **GOERLI_PRIVATE_KEY** with your credentials on the **.env** file

## To try out the encryptKey script

Run `node encryptKey.js`

After getting the **encryptedKey.json** file, you can delete the **PRIVATE_KEY** and **PRIVATE_KEY_PASSWORD** variables from the **.env** file.

Then, you can run the **encrypted-deploy.js** script with `PRIVATE_KEY_PASSWORD=password node encrypted-deploy.js`
