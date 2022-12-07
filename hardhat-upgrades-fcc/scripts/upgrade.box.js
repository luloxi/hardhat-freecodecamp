// manual way

const { ethers } = require("hardhat")

async function main() {
  const boxProxyAdmin = await ethers.getContract("BoxProxyAdmin")
  const transparentProxy = await ethers.getContract("Box_Proxy")

  // Getting the Box ABI and loading it at the
  // transparentProxy address

  // Log initial version
  const proxyBoxV1 = await ethers.getContractAt("Box", transparentProxy.address)
  const versionV1 = await proxyBoxV1.version()
  console.log("Version " + versionV1.toString())
  console.log(versionV1)

  // Upgrade (switch) versions
  const boxV2 = await ethers.getContract("BoxV2")
  // This function will change the implementation
  const upgradeTx = await boxProxyAdmin.upgrade(transparentProxy.address, boxV2.address)
  await upgradeTx.wait(1)

  // Log final version
  const proxyBoxV2 = await ethers.getContractAt("BoxV2", transparentProxy.address)
  const versionV2 = await proxyBoxV2.version()
  console.log("Version " + versionV2.toString())
  console.log(versionV2)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
