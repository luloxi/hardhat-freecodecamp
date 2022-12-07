# NextJS Smartcontract Lottery

-> [Test this repo here!](https://twilight-violet-2332.on.fleek.co/) <- (use Goerli Network or it won't work)

**This project could have a function to update Recent Winner and clear Number of Players and a few other stuff to make it more interactive.**

-> [Challenge explained here](https://youtu.be/gyMwXuJrbJQ?t=65003) <-

Lottery needs some fixing for localhost, mock not performing upkeep right (front end doesn't update last winner)

## About

Initialize repo with `yarn`

Just creating apps with HTML and JavaScript is great, but it has some limitations. Working with a framework helps to put more features and styling easily.

NextJS framework makes working with the React library much easier.

This site will be hosted in a decentralized way.

Get [hardhat-smartcontract-lottery](https://github.com/luloxi/hardhat-smartcontract-lottery) on the same root folder as this repo, `yarn` install it, then deploy to a local network with `yarn hardhat node` (this will auto-populate the **constants** folder data if needed)

To simulate Chainlink Keepers doing its work, run `run scripts/mockOffchain.js --network localhost` on **009-hardhat-smartcontract-lottery project**

Remember to **Settings > Advanced > Reset account** each time you run hardhat node again, to reset the transaction history (bah, just the nonce is important) of that wallet

# Next JS setup

To create a new nextJs environment: `yarn create next-app .`

Then, to run the site `yarn run dev`. Leave it running on one terminal and open another.

## Content location

Pages at **pages** folder is where website pages are located. Index.js is the front page. **public** is for the files (images). **styles** is for the CSS files.

Additionally, we created the **components** folder. **.jsx** files are React files

### \_app.js

**\_app.js** is the entry point for everything. All pages get wrapped by **\_app.js**. The way React and Next JS work is: everything is called "Component based"

In all other files, there's an **export default function -name-**. The whole content of the return of that function is called a **Component**.

## web3uikit

`yarn add web3uikit` gives a very interesting Connect Wallet component that can be imported with `import { ConnectButton } from "web3uikit"` and then included with `<ConnectButton moralisAuth={false} />`

Documentation for all it's functionalities is [here](https://web3ui.github.io/web3uikit/): 

# Tailwind CSS

Guide [here](https://tailwindcss.com/docs/guides/nextjs)

For step 4, overwrite everything in **./styles/globals.css**

A nice guide is on [TailwindCSS homepage](https://tailwindcss.com/), to go deeper you can then go into [docs](https://tailwindcss.com/docs/installation).

Get this extensions for VS Code to make Tailwind more friendly: 
- [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss)
- [PostCSS Language Support](https://marketplace.visualstudio.com/items?itemName=csstools.postcss)

# IPFS

Decentralized static hosting of files.

## Run a IPFS node (Linux)
1. To run IPFS on Linux, go to [ipfs-desktop repo](https://github.com/ipfs/ipfs-desktop#quick-install-shortcuts) and download the AppImage. 
2. From terminal, run `chmod +x ipfs-desktop*`
3. Run the program with `./ipfs-desktop` and press TAB before enter to load the entire filename.
4. Install [IPFS Companion](https://docs.ipfs.tech/install/ipfs-companion/) in your browser so you can browse ipfs:// links from your node

For other OS, just download [here](https://github.com/ipfs/ipfs-desktop#quick-install-shortcuts) the corresponding package and install it along with [IPFS Companion](https://docs.ipfs.tech/install/ipfs-companion/)

You're set up for browsing **ipfs://** links!

## IPFS Gateway

If you can't (or don't want to) install and run IPFS, you can use a gateway, which is a centralized server that connects to IPFS and retrieves your data.

Just type in your browser `ipfs.io/ipfs/YOUR_IPFS_FILE_ADDRESS`

## Uploading code to IPFS

### Fleek (faster way)

1. Turn off IPFS companion and go to [fleek.co](fleek.co)
2. Connect to GitHub where you have your Next JS install uploaded. (see hardhat-boiler for step-by-step instructions for upload)
3. Create app and select Next Js but on Build command replace what's in it for `yarn install && yarn run build && yarn next export`
4. Hit **deploy**. That will run the commands in their servers and give us an ipfs:// address and a regular one
5. **Refresh the page.** After a while, you will get both addresses. (see above IPFS )

**If you add, commit and push a new verison to Github, Fleek will automatically start deploying the new version!!**

### Manual way

1. Build our code into what's called a "production build"
   `yarn build` (which runs `next build` by default when Next JS app is created)

2. We can see in console _automatically rendered as static HTML (uses no initial props)_ There's some server based apps that next js comes with that if we use them, our static build won't work.

3. If we had any of those, `yarn next export` would fail. Otherwise, we will have a new folder called **out**, and that is our folder that is pure static code.

4. Then, you can upload that folder to IPFS! After uploading it, **Set pinned** it to a **Local node**

5. **Copy the CID**, open a new tab and type `ipfs://` and append the CID at the end. DONE!

# Filecoin

IPFS doesn't have data persistence. You need a service like Fleek to pin your data and store it in other IPFS nodes in order to stay distributed and decentralized.

Filecoin is a blockchain that rewards providers (or slashes them if they misbehave) for storing data in IPFS.

[NFT.storage](https://nft.storage/) is good for storing NFT immutable files. It's free!

[web3.storage](https://web3.storage/) is good for storing web3 data. It's designed to give the same benefits as web2 providers. It gives 5 GiB of free available storage!

[OrbitDB](github.com/orbitdb) is designed to be a p2p distributed database. **Currently in active development,** aims to be a database storage service.

# Install dependencies manually

Dependencies used here: `yarn add react react-dom moralis react-moralis moralis-v1`

Optional: `yarn add --dev prettier`
