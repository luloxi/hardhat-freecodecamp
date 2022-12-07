// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you"ll find the Hardhat
// Runtime Environment"s members available in the global scope.
const hre = require("hardhat");

async function main() {
  // Here we compile the contract prior to deploying it
  await hre.run("compile");

  // We get the contract to deploy
  const SimpleStorage = await hre.ethers.getContractFactory("SimpleStorage");
  // Then we deploy it
  const simpleStorage = await SimpleStorage.deploy();
  // And we wait for it to be deployed
  await simpleStorage.deployed();
  console.log(`Contract address: ${simpleStorage.address}`);
  // We call the store function
  const transactionResponse = await simpleStorage.store(1);
  // and get the Receipt for the store transaction
  const transactionReceipt = await transactionResponse.wait();
  // Finally, we log to console the event and all the variables of it
  console.log(transactionReceipt.events[0]);
  console.log(transactionReceipt.events[0].args.oldNumber.toString());
  console.log(transactionReceipt.events[0].args.newNumber.toString());
  console.log(transactionReceipt.events[0].args.addedNumber.toString());
  console.log(transactionReceipt.events[0].args.sender);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
