// Have a function to enter the lottery
import { abi, contractAddresses } from "../constants"
import { useMoralis, useWeb3Contract } from "react-moralis"
import { useEffect, useState } from "react"
import { ethers } from "ethers"
import { useNotification } from "web3uikit"

export default function LotteryEntrance() {
  // Pull the chainId object and rename it to chainIdHex
  const { Moralis, chainId: chainIdHex, isWeb3Enabled } = useMoralis()
  // Get the chainIdHex and convert it to an integer then save it
  // as chainId
  const chainId = parseInt(chainIdHex)
  // If chainId is in contractAddresses
  const raffleAddress = chainId in contractAddresses ? contractAddresses[chainId][0] : null

  // State hooks
  // https://stackoverflow.com/questions/58252454/react-hooks-using-usestate-vs-just-variables

  // entranceFee es gonna be the variable we call to get the entranceFee
  // setEntranceFee is gonna be the function we call to update or set
  // that entrance fee | entranceFee is gonna start out as "0"
  const [entranceFee, setEntranceFee] = useState("0")
  const [numberOfPlayers, setNumberOfPlayers] = useState("0")
  const [recentWinner, setRecentWinner] = useState("0")

  // useNotification returns at dispatch, and dispatch is a popup we get
  // 4. We call useNotification() from web3uikit ^
  const dispatch = useNotification()

  /* Contract functrions */

  const {
    runContractFunction: enterRaffle,
    data: enterTxResponse,
    isLoading,
    isFetching,
  } = useWeb3Contract({
    abi: abi, //
    contractAddress: raffleAddress,
    functionName: "enterRaffle",
    params: {},
    msgValue: entranceFee,
  })

  /* View / Pure functions */

  const { runContractFunction: getEntranceFee } = useWeb3Contract({
    abi: abi, //
    contractAddress: raffleAddress,
    functionName: "getEntranceFee",
    params: {},
  })

  const { runContractFunction: getNumberOfPlayers } = useWeb3Contract({
    abi: abi, //
    contractAddress: raffleAddress,
    functionName: "getNumberOfPlayers",
    params: {},
  })

  const { runContractFunction: getRecentWinner } = useWeb3Contract({
    abi: abi, //
    contractAddress: raffleAddress,
    functionName: "getRecentWinner",
    params: {},
  })

  // try to read the raffle entrance fee
  async function updateUI() {
    // First we get information, then we set it and trigger a re-render
    const entranceFeeFromCall = (await getEntranceFee()).toString()
    const numberOfPlayersFromCall = (await getNumberOfPlayers()).toString()
    const recentWinnerFromCall = (await getRecentWinner()).toString()
    setEntranceFee(entranceFeeFromCall)
    setNumberOfPlayers(numberOfPlayersFromCall)
    setRecentWinner(recentWinnerFromCall)
  }

  useEffect(() => {
    if (isWeb3Enabled) {
      updateUI() // <-- MISPLACING THIS WAS CAUSING THE ANNOYING ERROR
    }
  }, [isWeb3Enabled])

  // 3. We caññ dosátcj amd show a notification (settings on documentation)
  const handleNewNotification = function () {
    // Using dispatch to pop up a notification
    dispatch({
      type: "success",
      message: "Raffle entry submitted!",
      title: "Transaction Notification",
      position: "topR",
    })
  }

  // 2. We wait for transaction to go through, then call handleNewNotification
  const handleSuccess = async function (tx) {
    try {
      await tx.wait(1)
      // We update the UI
      updateUI()
      // and we send a new notification
      handleNewNotification(tx)
    } catch (error) {
      console.log(error)
    }
  }

  // Here we use ethers to convert from wei to ether
  return (
    <div className="p-5">
      <h1 className="py-4 px-4 font-bold text-3xl">Lottery</h1>
      {
        // If Raffle address exist, show Raffle data and button,
        raffleAddress ? (
          <>
            <div>
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-auto"
                onClick={async () =>
                  await enterRaffle({
                    // On complete: 1. call handleSuccess
                    // Its just checking if transaction was
                    // succesfully sent to Metamask
                    onSuccess: handleSuccess,
                    // On error:
                    onError: (error) => console.log(error),
                  })
                }
                // Disable button if this conditions are true
                disabled={isLoading || isFetching}
              >
                {isLoading || isFetching ? (
                  <div className="animate-spin spinner-border h-8 w-8 border-b-2 rounded-full"></div>
                ) : (
                  <div>Enter Raffle</div>
                )}
              </button>

              <div> Entrance Fee: {ethers.utils.formatUnits(entranceFee, "ether")} ETH</div>
              <div> Current number of players: {numberOfPlayers}</div>
              <div>Last round winner: {recentWinner}</div>
            </div>
          </>
        ) : (
          <div>Please connect to a supported chain (no raffle address detected)</div>
        )
      }
    </div>
  )
}
