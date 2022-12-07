const pinataSDK = require("@pinata/sdk")
const path = require("path")
const fs = require("fs")
require("dotenv").config()

const pinataApiKey = process.env.PINATA_API_KEY
const pinataApiSecret = process.env.PINATA_API_SECRET
const pinata = pinataSDK(pinataApiKey, pinataApiSecret)

// This function will take everything from the images/randomNFT folder
async function storeImages(imagesFilePath) {
  // If we give this a relative path, it returns the absolute path
  const fullImagesPath = path.resolve(imagesFilePath)
  // Read the entire directory and the filenames in an array
  const files = fs.readdirSync(fullImagesPath)

  let responses = []
  console.log("Uploading images to Pinata!")
  // For each file in files variable (each as an index number)
  for (fileIndex in files) {
    console.log(`Working on ${files[fileIndex]}`)
    // We create a stream where we read all the data inside an image with
    // createReadStream with the path and filename (selected with index number)
    const readableStreamForFile = fs.createReadStream(`${fullImagesPath}/${files[fileIndex]}`)
    // Then we send it
    try {
      const response = await pinata.pinFileToIPFS(readableStreamForFile)
      responses.push(response)
    } catch (e) {
      console.log(e)
    }
  }
  // We're returning the responses of pushing the files up, and also the files
  // THe response has the hash of the uploaded file
  return { responses, files }
}

async function storeTokenUriMetadata(metadata) {
  try {
    // It attempts to pin (upload) the JSON to IPFS (Pinata)
    const response = await pinata.pinJSONToIPFS(metadata)
    // Don't know why it returns a response
    return response
  } catch (e) {
    console.log(e)
  }
  // Don't know why it returns null either
  return null
}

module.exports = { storeImages, storeTokenUriMetadata }
