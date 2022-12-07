const { network } = require("hardhat")
const { networkConfig, developmentChains } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")
const { storeImages, storeTokenUriMetadata } = require("../utils/uploadToPinata")

const FUND_AMOUNT = "1000000000000000000000"
const imagesLocation = "./images/randomNft/"
let tokenUris = [
  "ipfs://QmaVkBn2tKmjbhphU7eyztbvSQU5EXDdqRyXZtRhSGgJGo",
  "ipfs://QmYQC5aGZu2PTH8XzbJrbDnvhj3gVs7ya33H9mqUNvST3d",
  "ipfs://QmZYmH5iDbD6v3U2ixoVAjioSzvWJszDzYdbeCLquGSpVm",
]

const metadataTemplate = {
  name: "",
  description: "",
  image: "",
  attributes: [
    {
      trait_type: "Cuteness",
      value: 100,
    },
  ],
}

module.exports = async function ({ getNamedAccounts, deployments }) {
  const { deploy, log } = deployments
  const { deployer } = await getNamedAccounts()
  const chainId = network.config.chainId
  let vrfCoordinatorV2Address, subscriptionId

  // Get the IPFS hashes of our images
  if (process.env.UPLOAD_TO_PINATA == "true") {
    tokenUris = await handleTokenUris()
  }

  log("----------------------------")

  if (chainId == 31337) {
    // If on a local network, get the already deployed VRFCoordinatorV2Mock
    const vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock")
    // Save Mock address to a variable
    vrfCoordinatorV2Address = vrfCoordinatorV2Mock.address
    // Create a subscription
    const txResponse = await vrfCoordinatorV2Mock.createSubscription()
    const txReceipt = await txResponse.wait()
    // Using subId out of the event after creating a subscription
    subscriptionId = txReceipt.events[0].args.subId
    // Fund the mock contract
    await vrfCoordinatorV2Mock.fundSubscription(subscriptionId, FUND_AMOUNT)
  } else {
    // Else, get this info from helper-hardhat-config
    vrfCoordinatorV2Address = networkConfig[chainId].vrfCoordinatorV2
    subscriptionId = networkConfig[chainId].subscriptionId
  }

  log("----------------------------")

  // same as doing "let args" but cooler
  arguments = [
    vrfCoordinatorV2Address,
    subscriptionId,
    networkConfig[chainId]["gasLane"],
    networkConfig[chainId]["mintFee"],
    networkConfig[chainId]["callbackGasLimit"],
    tokenUris,
  ]

  const randomIpfsNft = await deploy("RandomIpfsNft", {
    from: deployer,
    args: arguments,
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
  })

  log("----------------------------")

  if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
    log("Verifying...")
    await verify(randomIpfsNft.address, arguments)
  }
}

/* Complementary function to get token URIs */

async function handleTokenUris() {
  tokenUris = []
  // we need to store the image to IPFS
  // and store the metadata to IPFS

  // responses is gonna be a list of the responses from pinata
  // and each response will carry a hash for the uploaded file
  const { responses: imageUploadResponses, files } = await storeImages(imagesLocation)
  for (imageUploadResponsesIndex in imageUploadResponses) {
    // create metadata
    // upload metadata

    // First we stick everything in metadataTemplate into tokenUriMetadata
    let tokenUriMetadata = { ...metadataTemplate }
    // Then fill name attribute with filename minus file extension
    tokenUriMetadata.name = files[imageUploadResponsesIndex].replace(".png", "")
    tokenUriMetadata.description = `An adorable ${tokenUriMetadata.name} pup!`
    // Get the IpfsHash of the response of current file upload
    tokenUriMetadata.image = `ipfs://${imageUploadResponses[imageUploadResponsesIndex].IpfsHash}`
    console.log(`Uploading ${tokenUriMetadata.name} metadata...`)
    // Store the JSON to Pinata / IPFS
    const metadataUploadResponse = await storeTokenUriMetadata(tokenUriMetadata)
    tokenUris.push(`ìpfs://${metadataUploadResponse.IpfsHash}`)
  }
  console.log("TokenURIs Uploaded! They are: ")
  console.log(tokenUris)
  // Get them from console and paste them up, then enable config in .env
  return tokenUris
}

module.exports.tags = ["all", "randomipfs", "main"]
