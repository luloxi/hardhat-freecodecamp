import { useMoralis } from "react-moralis"
import { useEffect } from "react"

export default function ManualHeader() {
  // enableWeb3 is a function we get from useMoralis hook that says
  // "go ahead and connect" it is the equivalent to saying
  // await ethereum.request({ method: "eth_requestAccounts"})

  // isWeb3Enabled keeps track wether or not our wallet is connected
  // better than that is "account", that not only keeps track of that
  // maybe web3 is connected, but they didnt connect to an account
  const { enableWeb3, account, isWeb3Enabled, Moralis, deactivateWeb3, isWeb3EnableLoading } =
    useMoralis()

  // Takes two parameters, a function as first parameters, and second
  // optionally a dependency array that will keep checking values in
  // this dependency array, and if anything changes, it will re-render
  // the frontend
  useEffect(() => {
    // this will skip doing anything if we're already connected
    // If window exists and localStorage item "connected" has been created, we're already in!
    if (
      !isWeb3Enabled &&
      typeof window !== "undefined" &&
      window.localStorage.getItem("connected")
    ) {
      enableWeb3()
    }
  }, [isWeb3Enabled])
  // no array, run on every render
  // empty array, run once
  // dependency array, run when the stuff in it changes

  useEffect(() => {
    Moralis.onAccountChanged((account) => {
      console.log(`Account changed to ${account}`)
      // If account is null we can assume wallet is disconnected
      if (account == null) {
        window.localStorage.removeItem("connected")
        // Sets isWeb3Enabled to false
        deactivateWeb3()
        console.log("Null account found")
      }
    })
  }, [])

  return (
    <div>
      {
        // If account exists do this, if not, do that
        account ? (
          <div>
            Connected to: {account.slice(0, 6)}...{account.slice(account.length - 4)}
          </div>
        ) : (
          <button
            onClick={async () => {
              await enableWeb3()
              // We're making sure that there's a window
              if (typeof window !== "undefined") {
                // we store a little rememberance here
                // a new key-value in f12 application Local storage
                window.localStorage.setItem("connected", "injected")
              }
            }}
            disabled={isWeb3EnableLoading}
          >
            Connect
          </button>
        )
      }
    </div>
  )
}
