const ethers = require("ethers")
// Import to read files from the project
const fs = require("fs")
// Import to interact with .env file
require("dotenv").config()

// Code to encrypt private key
async function main() {
  // Create a new wallet from private key
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY)
  // Return an encrypted JSON key that we're gonna store locally and we can only decrypt it with a password
  const encryptedJsonKey = await wallet.encrypt(
    process.env.PRIVATE_KEY_PASSWORD,
    process.env.PRIVATE_KEY
  )
  console.log(encryptedJsonKey)
  // Save encrypted password to a file
  fs.writeFileSync("./.encryptedKey.json", encryptedJsonKey)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
