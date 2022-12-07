const { getNamedAccounts, ethers } = require("hardhat")
const { getWeth, AMOUNT } = require("../scripts/getWeth")

async function main() {
    // Replace this variable with an import from helper-hardhat-config
    const wethTokenAddress = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
    const daiTokenAddress = "0x6b175474e89094c44da98b954eedeac495271d0f"

    // the protocol treats everything as an ERC20
    // convert some ETH into WETH to use with AAVE
    await getWeth()
    // Get an account to interact with the contract
    const { deployer } = await getNamedAccounts()

    // Get the contract with getLendingPool function and set "deployer" to interact with it
    const lendingPool = await getLendingPool(deployer)
    console.log(`Lending pool address: ${lendingPool.address}`)

    // Approve lendingPool to transferFrom WETH token from our wallet
    await approveErc20(wethTokenAddress, lendingPool.address, AMOUNT, deployer)
    // Deposit
    console.log("Depositing...")
    // Address of asset, amount deposited, address whom will receive the aTokens (in this case, the caller), referral code (deprecated)
    await lendingPool.deposit(wethTokenAddress, AMOUNT, deployer, 0)
    console.log("Deposited!")

    // Get borrow data for deployer from lendingPool
    // How much we have borrowed, how much we have in collateral, how much we can borrow
    let { availableBorrowsETH, totalDebtETH } = await getBorrowUserData(lendingPool, deployer)

    // availableBorrowETH ?? What's the conversion rate on DAI?
    const daiPrice = await getDaiPrice()
    // In JavaScript you can do the .toString() and still do math.
    // Get 95% of the total available DAI to borrow to not hit the cap
    const amountDaiToBorrow = availableBorrowsETH.toString() * 0.95 * (1 / daiPrice.toNumber())
    console.log(`You can borrow ${amountDaiToBorrow} DAI`)
    // To keep working with this amount we need to convert it to wei
    const amountDaiToBorrowWei = ethers.utils.parseEther(amountDaiToBorrow.toString())

    // Borrow time!
    await borrowDai(daiTokenAddress, lendingPool, amountDaiToBorrowWei, deployer)
    await getBorrowUserData(lendingPool, deployer)

    // Repay time!
    await repay(amountDaiToBorrowWei, daiTokenAddress, lendingPool, deployer)
    await getBorrowUserData(lendingPool, deployer)
}

async function getLendingPool(account) {
    // Get ABI and Address
    // Lending Pool Address Provider: 0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5
    // Lending Pool:  Need to get it from here ^
    const lendingPoolAddressesProvider = await ethers.getContractAt(
        "ILendingPoolAddressesProvider",
        "0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5",
        account
    )
    // Get the address of the Lending Pool contract
    const lendingPoolAddress = await lendingPoolAddressesProvider.getLendingPool()
    // Set the contract on a variable ready for work
    const lendingPool = await ethers.getContractAt("ILendingPool", lendingPoolAddress, account)
    // Returning the contract to start working with it
    return lendingPool
}

async function approveErc20(erc20Address, spenderAddress, amountToSpend, account) {
    // Get interface for ERC, Address of the token, and Account
    const erc20Token = await ethers.getContractAt("IERC20", erc20Address, account)

    const tx = await erc20Token.approve(spenderAddress, amountToSpend)
    tx.wait(1)
    console.log("Approved!")
}

async function getBorrowUserData(lendingPool, account) {
    const { totalCollateralETH, totalDebtETH, availableBorrowsETH } =
        await lendingPool.getUserAccountData(account)
    console.log(`You have ${totalCollateralETH} ETH deposited`)
    console.log(`You have ${totalDebtETH} ETH borrowed`)
    console.log(`You can borrow ${availableBorrowsETH} ETH`)
    return { availableBorrowsETH, totalDebtETH }
}

async function getDaiPrice() {
    // For reading only, getContractAt can be called without a signer
    const daiEthPriceFeed = await ethers.getContractAt(
        "AggregatorV3Interface",
        "0x773616E4d11A78F511299002da57A0a94577F1f4"
    )
    // Wrapping the await and selecting only one of the 5 return values it gives
    const price = (await daiEthPriceFeed.latestRoundData())[1]
    console.log(`The DAI/ETH price is ${price.toString()}`)
    return price
}

async function borrowDai(daiAddress, lendingPool, amountDaiToBorrow, account) {
    // Call the borrow function of the lendingPool with arguments (asset, amount, interestRateMode, referralCode (deprecated), onBehalfOf (self))
    const borrowTx = await lendingPool.borrow(daiAddress, amountDaiToBorrow, 1, 0, account)
    await borrowTx.wait(1)
    console.log("You've borrowed!")
}

async function repay(amount, daiAddress, lendingPool, account) {
    // Approve sending the DAI back
    await approveErc20(daiAddress, lendingPool.address, amount, account)
    // Repay the amount to the pool
    const repayTx = await lendingPool.repay(daiAddress, amount, 1, account)
    await repayTx.wait(1)
    console.log("Repayed!")
}

// Call th main function and log errors if any occur
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
