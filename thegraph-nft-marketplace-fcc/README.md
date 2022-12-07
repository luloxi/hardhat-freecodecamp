# The Graph NFT Marketplace

Instead of reading the events from Moralis, we will:

1. Index them with The Graph
2. Read from The Graph

## schema.graphql

Is how we tell The Graph how to work and index our events.

Every time we update schema.graphql, if we run `graph codegen`, it runs through **schema.graphql** and creates/fills a typescript file in the **generated/** folder.

## src/nft-marketplace.ts

Imports events from **generated** code and it has functions that will trigger every time a specific event is emitted.

All this is defined in **subgraph.yaml**, listing event names as **entities** and then **eventHandlers** specifying content and what to do call for an specific event

## subgraph.yaml

We can tell it to listen for events since right before our contract was deployed, adding **startBlock: 7824188** in **dataSources > source**

## Upload to The Graph

Follow the "Auth and deploy" section of your subgraph.

The `graph build` command compiles everything into a build folder, ready for deployment.

After running the deploy command, we get a **Subgraph endpoint Queries (HTTP) address**
