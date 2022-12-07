# All about NFTs!

Run `yarn` to install packages.

To deploy and try the mint

1. Run: `yarn hardhat deploy --network goerli --tags main`
2. Add **RandomIpfsNft** contract address to [VRF](vrf.chain.link) as a consumer (on a sufficiently funded subscription)
3. Run: `yarn hardhat deploy --network goerli --tags mint`
4. After it finishes, you can go to [OpenSea testnets](https://testnets.opensea.io/account) and (hopefully) see your newly minted NFTs! It can take a while to load, and if they come without image, refresh their metadata and wait a bit more.

**3 contracts**

# 1. Basic NFT

Not much to say, just check **BasicNft.sol** and its test and deploy files.

# 2. Random IPFS NFT

- Pros of IPFS: Cheap
- Cons: Someone needs to pin our data (if we're not gonna host it on our computer 24/7)

Using Chainlink VRF to randomize which breed of dog the NFT will be, with a simple rarity algorithm.

We can upload files to IPFS in several ways

1. With our own IPFS node, https://docs.ipfs.io/
   Check out https://github.com/PatrickAlphaC/nft-mix for a pythonic version of uploading to the raw IPFS-daemon from https://docs.ipfs.io/how-to/command-line-quick-start/

2. Pinata https://pinata.cloud/ (instructions below)
   (they help pin your nft to several ipfs nodes)

3. NFT.storage https://nft.storage/
   (uses Filecoin to pin our data to IPFS)
   One of the msot persistent ways to keep our data up
   For this, see script **utils/uploadToNftStorage.js**

## Pinata Cloud

To upload to Pinata (which then uploads to several IPFS nodes)

1. Register at [Pinata Cloud](https://www.pinata.cloud/).
2. Add pinata to current installation with `yarn add --dev @pinata/sdk`
3. To use reading files from a script, `yarn add --dev path`
4. Go to [https://app.pinata.cloud/keys](keys) and create a new API key with "admin" enabled, name it and create it.
5. Pass the API key and API secret to script.

# 3. Dynamic SVG NFT

- Pros: The data is on chain!
- Cons: MUCH more expensive!

If price of ETH is above X -> Happy Face
If it's below -> Frowny Face

## base64 encoding

- Encode an SVG to code with [this tool](https://base64.guru/converter/encode/image/svg), then it will be directly usable in a smart contract (importing the base64.sol contract)
- Then, type `data:image/svg+xml;base64,BASE64_ENCODED_SVG_HERE` in your browser to view that image

## abi.encode

- **abi.encode(1)** will convert to bytecode the number one (0x0000000000000000000000000001 or something like that)
- if called on a string, it will return a lot of useless zeros in the code, so it's better to use **abi.encodePacked**.
- **abi.encodePacked** compresses whatever it gets passed, and we can use it whenever we don't need the perfect lowlevel binary.
- **abi.encodePacked("some string")** gives the same result as typecasting **bytes("some string")**, but behaves differently behind the scenes.
- **abi.decode** takes as parameters ("something to decode", (... list of types to decode)) and will return a list of all the different decodings.

All the solidity global variables are visible [here](https://docs.soliditylang.org/en/latest/cheatsheet.html)

Solidity Opcodes are visible [here](https://www.evm.codes/?fork=grayGlacier)

# Install dependencies manually

`yarn add --dev @chainlink/contracts@0.4.1` this version of @chainlink makes the VRFCoordinatorV2Mock work, while the newest doesn't

`yarn add --dev base64-sol`
