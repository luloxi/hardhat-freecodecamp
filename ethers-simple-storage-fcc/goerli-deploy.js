const ethers = require("ethers")
// Import to read files from the project
const fs = require("fs")
// Import to interact with .env file
require("dotenv").config()

async function main() {
  // Connect the script to the blockchain specified
  const provider = new ethers.providers.JsonRpcProvider(
    process.env.GOERLI_RPC_URL
  )
  // Connect a wallet to the script
  const wallet = new ethers.Wallet(process.env.GOERLI_PRIVATE_KEY, provider)
  // To deploy a contract, we need the ABI and the binary code compiled
  const abi = fs.readFileSync("./SimpleStorage_sol_SimpleStorage.abi", "utf8")
  const binary = fs.readFileSync(
    "./SimpleStorage_sol_SimpleStorage.bin",
    "utf8"
  )

  // Get the Ethers Contract Factory
  const contractFactory = new ethers.ContractFactory(abi, binary, wallet)
  // Deploy the contract
  console.log("Deploying, please wait...")
  const contract = await contractFactory.deploy()
  // Wait one block to confirm that the contract has deployed
  const deploymentReceipt = await contract.deployTransaction.wait(1)
  // Log deployed contract address
  console.log(`Contract address: ${contract.address}`)

  // // Here you get the contract object that has the deploy transaction in it
  // console.log("Here is the deployment transaction (transaction response): ");
  // console.log(contract.deployTransaction);
  // // You only get a transaction receipt when you wait for a block confirmation
  // console.log("Here is the transaction receipt: ");
  // console.log(deploymentReceipt);

  // Call a view function and store the response on a variable
  const currentFavoriteNumber = await contract.retrieve()
  // This gives a BigNumber as a response, so we convert it to string to make it easily readable
  console.log(`Current Favorite Number: ${currentFavoriteNumber.toString()}`)
  // This is getting a response from calling a function on a contract
  // It's a best practice to pass numbers as strings when using Javascript
  const transactionResponnse = await contract.store("7")
  // When we wait for the transactionResponse to finish, we get a transactionReceipt
  const transactionReceipt = await transactionResponnse.wait(1)
  // Call a view function and store the response on a variable
  const updatedFavoriteNumber = await contract.retrieve()
  console.log(`Updated Favorite Number: ${updatedFavoriteNumber.toString()}`)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
