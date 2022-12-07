// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

// In order to make the contract VRF Consumer able
// we gotta import this
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
// 2. We import the VRFCoordinatorV2Interface, like when importing AggregatorV3Interface
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
// This makes the contract compatible with Chainlink Keepers
import "@chainlink/contracts/src/v0.8/interfaces/KeeperCompatibleInterface.sol";

error Raffle__NotEnoughETHEntered();
error Raffle__TransferFailed();
error Raffle__NotOpen();
error Raffle__UpkeepNotNeeded(uint256 currentBalance, uint256 numPlayers, uint256 raffleState);

/** @title A sample Raffle contract
 * @author Luciano Oliva
 * @notice This contract is for creating an untamperable decentralized smart contract
 * @dev This implements Chainlink VRF V2 and Chainlink Keepers
 */

// Raffle

// VRFConsumerBaseV2 for making the contract VRF Consumer able
// and
// KeeperCompatibleInterface for making the contract compatible with
// Chainlink Keepers
contract Raffle is VRFConsumerBaseV2, KeeperCompatibleInterface {
    /* Type declarations */

    // Enums are used for custom types for a finite set of "constant values"
    // This is secretly a uint256 0 = OPEN, 1 = CALCULATING
    // This is much more expicit
    enum RaffleState {
        OPEN,
        CALCULATING
    }

    /* State variables */

    // 3. Create a VRFCoordinatorV2Interface type variable connected to contract address
    VRFCoordinatorV2Interface private immutable i_vrfCoordinator;
    bytes32 private immutable i_gasLane;
    uint64 private immutable i_subscriptionId;
    uint32 private immutable i_callbackGasLimit;
    // How many block confirmations the Chainlink node should  wait before responding
    uint16 private constant REQUEST_CONFIRMATIONS = 3;
    // How many random numbers do we wanna get
    uint16 private constant NUM_WORDS = 1;

    // Lottery variables

    uint256 private immutable i_entranceFee;
    // Store the most recent winner
    address private s_recentWinner;
    // With the enum type RaffleState, we create this variable
    RaffleState private s_raffleState;
    // Payable because when one of this players wins,
    // we're gonna have to pay them
    address payable[] private s_players;
    // Stores the lastTimeStamp of the block that called a function containing this variable
    uint256 private s_lastTimeStamp;
    // Interval is set in seconds
    uint256 private i_interval;

    /* Events */

    // Indexed parameters are the ones that search engines can query
    event RaffleEnter(address indexed player);
    event RequestedRaffleWinner(uint256 indexed requestId);
    event WinnerPicked(address indexed winner);

    /* Functions */

    // VERConsumerBaseV2 for entering the addressis of the contract
    // that does the random number verification. This is given as input to constructor
    constructor(
        address vrfCoordinatorV2, // contract address
        uint256 entranceFee,
        bytes32 gasLane,
        uint64 subscriptionId,
        uint32 callbackGasLimit,
        uint256 interval
    ) VRFConsumerBaseV2(vrfCoordinatorV2) {
        i_entranceFee = entranceFee;
        // 4. Linking the interface to the addresss of the contract
        i_vrfCoordinator = VRFCoordinatorV2Interface(vrfCoordinatorV2);
        // Sets the maximum gas price you are willing to pay for gas in wei
        i_gasLane = gasLane;
        // Subscription that we need for funding our requests
        i_subscriptionId = subscriptionId;
        // Limit for how much gas to use for the callback request
        // (fulfillRandomWords). Sets a limit to how much computation it can use.
        i_callbackGasLimit = callbackGasLimit;
        // Initialize the contract in an OPEN state, from the enum type variable s_raffleState
        s_raffleState = RaffleState.OPEN;
        // Initializes lastTimeStamp with timestamp of contract creating
        s_lastTimeStamp = block.timestamp;
        // This will be used for the minimum interval between current
        // time and the last time fullfillRandomWords was called
        i_interval = interval;
    }

    function enterRaffle() public payable {
        // require (msg.value > i_entranceFee);
        if (msg.value < i_entranceFee) {
            revert Raffle__NotEnoughETHEntered();
        }
        // If raffleState is not open, revert
        if (s_raffleState != RaffleState.OPEN) {
            revert Raffle__NotOpen();
        }
        s_players.push(payable(msg.sender));
        // Emit an event when we update a dynamic array or mapping
        emit RaffleEnter(msg.sender);
    }

    /**
     * @dev This is the function that the Chainlink Keeper nodes call
     * they look for the "upkeepNeeded" to return true
     * The following should be true in order to return true
     * 1. Our time interval should have passed
     * 2. The raffle should have at least 1 player, and have some ETH
     * 3. Our subscription is funded with LINK
     * 4. The raffle should be in an "OPEN" state
     */

    function checkUpkeep(
        bytes memory /* checkData */ /* This means there's an imported checkUpkeep */ /* public to be able to be called from outside and inisde the contract */
    )
        public
        override
        returns (
            bool upkeepNeeded, /* If true, keepers will call performUpkeep */
            bytes memory /* performData */
        )
    {
        // Check if RaffleState is OPEN
        bool isOpen = (RaffleState.OPEN == s_raffleState);
        // block.timestamp returns the current timestamp of the blockchain. Then (block.timestamp - last block timestamp)
        bool timePassed = ((block.timestamp - s_lastTimeStamp) > i_interval);
        // Check if there are enough players
        bool hasPlayers = (s_players.length > 0);
        // Check if the contract has funds
        bool hasBalance = address(this).balance > 0;
        // This will be true if all 4 conditions are true
        // No need to specify the type because it was initialized in "returns"
        upkeepNeeded = (isOpen && timePassed && hasPlayers && hasBalance);
    }

    // Request the random number
    // Once we get it, do something with it
    // 2 transaction process

    // "requestRandomWinner" function
    function performUpkeep(
        bytes calldata /* performData */
    ) external override {
        // CHeck if upKeep is needed (We call it with blank checkData)
        (bool upkeepNeeded, ) = checkUpkeep("");
        // If it's not, revert with error showing state when called
        if (!upkeepNeeded) {
            revert Raffle__UpkeepNotNeeded(
                address(this).balance,
                s_players.length,
                uint256(s_raffleState)
            );
        }
        // If not reverted, change RaffleState from OPEN to CALCULATING
        s_raffleState = RaffleState.CALCULATING;
        // 1. Here, we call the requestRandomWords function
        // 5. Finally, we use that interface to call "requestRandomWords"
        uint256 requestId = i_vrfCoordinator.requestRandomWords(
            i_gasLane, // keyHash
            i_subscriptionId,
            REQUEST_CONFIRMATIONS,
            i_callbackGasLimit,
            NUM_WORDS
        );
        // This is redundant!!
        // We could use the requestId event from the VRFCoordinator!!
        emit RequestedRaffleWinner(requestId);
    }

    // "words" comes from Computer Sciense terminology
    /** @dev associated with the randomness. (It is triggered via
     * @dev a call to rawFulfillRandomness, below) ???
     * @param requestId The Id initially returned by requestRandomness
     * @param randomWords The VRF output expanded to the requested number of words
     */

    // Fulfill random number (words)
    function fulfillRandomWords(
        uint256 requestId, /* requestId */
        uint256[] memory randomWords /* array of size 1 (NUM_WORDS) */
    ) internal override {
        // If | s_players size 10
        // and | randomNumber 202
        // Then | 202 % 10 = 2
        // This will give us the index of the random winner
        uint256 indexOfWinner = randomWords[0] % s_players.length;
        // Get the winner address into a payable winner address
        address payable recentWinner = s_players[indexOfWinner];
        // Store in recent winner variable to display for everyone
        s_recentWinner = recentWinner;
        // Set the raffle state to OPEN again
        s_raffleState = RaffleState.OPEN;
        // Reset the players list to a new array
        s_players = new address payable[](0);
        // Set the lastTimeStamp to current block timestamp
        s_lastTimeStamp = block.timestamp;
        // Transfer this contracts balance to recentWinner
        (bool success, ) = recentWinner.call{value: address(this).balance}("");
        // If above doesn't return success, revert everything with an error
        if (!success) {
            revert Raffle__TransferFailed();
        }
        // If everything went well, emit event
        emit WinnerPicked(recentWinner);
    }

    /* View / Pure functions */

    function getEntranceFee() public view returns (uint256) {
        return i_entranceFee;
    }

    function getPlayer(uint256 index) public view returns (address) {
        return s_players[index];
    }

    function getRecentWinner() public view returns (address) {
        return s_recentWinner;
    }

    function getRaffleState() public view returns (RaffleState) {
        return s_raffleState;
    }

    function getNumWords() public pure returns (uint256) {
        return NUM_WORDS;
    }

    function getNumberOfPlayers() public view returns (uint256) {
        return s_players.length;
    }

    function getLatestTimeStamp() public view returns (uint256) {
        return s_lastTimeStamp;
    }

    function getRequestConfirmations() public pure returns (uint256) {
        return REQUEST_CONFIRMATIONS;
    }

    function getInterval() public view returns (uint256) {
        return i_interval;
    }
}
