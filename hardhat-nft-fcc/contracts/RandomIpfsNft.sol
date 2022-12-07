// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
// Importing this, that imports ERC721 as well, and gives _setTokenURI
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
// Ownable makes it so the contract is owned by whoever deploys it
import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";

/* Error */
error RandomIpfsNft__AlreadyInitialized();
error RandomIpfsNft__NeedMoreETHSent();
error RandomIpfsNft__RangeOutOfBounds();
error RandomIpfsNft__TransferFailed();

contract RandomIpfsNft is VRFConsumerBaseV2, ERC721URIStorage, Ownable {
  // when we mint an NFT, we will rigger a Chainlink VRF call to get a random number
  // using that number, we will get a random NFT
  // Pug, Shiba Inu, St. Bernard
  // Pug: super rare
  // Shiba Inu: medium rare
  // St. Bernard: common

  // Users have to pay to mint an NFT
  // The owner of the contract can withdraw the ETH

  /* Type declaration */
  enum Breed {
    PUG,
    SHIBA_INU,
    ST_BERNARD
  }

  // Chainlink VRF Variables

  // We store an instance of VRFCoordinatorV2Interface in this variable of type VRFCoordinatorV2Interface, so we can call functions from it
  VRFCoordinatorV2Interface private immutable i_vrfCoordinator;
  uint64 private immutable i_subscriptionId;
  bytes32 private immutable i_gasLane;
  uint32 private immutable i_callbackGasLimit;
  uint16 private constant REQUEST_CONFIRMATIONS = 3;
  uint32 private constant NUM_WORDS = 1;

  // NFT Variables
  uint256 public s_tokenCounter;
  uint256 internal constant MAX_CHANCE_VALUE = 100;
  string[] internal s_dogTokenUris;
  uint256 internal i_mintFee;
  bool private s_initialized;

  // VRF Helpers
  mapping(uint256 => address) public s_requestIdToSender;

  // Events
  event NftRequested(uint256 indexed requestId, address requester);
  event NftMinted(Breed dogBreed, address minter);

  // We use the VRFConsumerBaseV2 constructor to create our contract
  // It needs an address as a parameter
  // So we pass an address vrfCoordinatorV2 to this contract
  // To then pass it as an argument to VRFConsumerBaseV2
  constructor(
    address vrfCoordinatorV2,
    uint64 subscriptionId,
    bytes32 gasLane,
    uint256 mintFee,
    uint32 callbackGasLimit,
    // list of 3 addresses for IPFS locations of dog images
    string[3] memory dogTokenUris
  ) VRFConsumerBaseV2(vrfCoordinatorV2) ERC721("Random IPFS NFT", "RIN") {
    // We're gonna save that address as a global varaible
    // so we can call requestRandomWords on it
    // that's why we wrap the address in VRFCoordinatorV2Interface
    i_vrfCoordinator = VRFCoordinatorV2Interface(vrfCoordinatorV2);
    i_subscriptionId = subscriptionId;
    i_gasLane = gasLane;
    i_callbackGasLimit = callbackGasLimit;
    i_mintFee = mintFee;
    _initializeContract(dogTokenUris);
  }

  function requestNft() public payable returns (uint256 requestId) {
    if (msg.value < i_mintFee) {
      revert RandomIpfsNft__NeedMoreETHSent();
    }
    requestId = i_vrfCoordinator.requestRandomWords(
      i_gasLane,
      i_subscriptionId,
      REQUEST_CONFIRMATIONS,
      i_callbackGasLimit,
      NUM_WORDS
    );
    s_requestIdToSender[requestId] = msg.sender;
    emit NftRequested(requestId, msg.sender);
  }

  function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords) internal override {
    address dogOwner = s_requestIdToSender[requestId];
    uint256 newTokenId = s_tokenCounter;
    // what does the token look like?
    // Doing this ensures that the number we get is
    // between 0 and 99
    uint256 moddedRng = randomWords[0] % MAX_CHANCE_VALUE;
    // If we get 7 -> PUG (between 0 and 10)
    // 14 -> Shiba Inu (between 10 and 30)
    // 88 -> St Bernard  (between 30 and 100)
    // 45 -> St Bernard
    Breed dogBreed = getBreedFromModdedRng(moddedRng);
    s_tokenCounter = s_tokenCounter + 1;
    _safeMint(dogOwner, newTokenId);
    _setTokenURI(newTokenId, s_dogTokenUris[uint256(dogBreed)]);
    // typecasting dogBreed back into uint256 to get its index
    emit NftMinted(dogBreed, dogOwner);
  }

  // we're gonna use this to give minted NFTs their dog breed
  // Returns an array of the size of 3 from memory
  function getChanceArray() public pure returns (uint256[3] memory) {
    // ( 0 - 9 ) index 0 has 10% chance of happening
    // ( 10 - 39 ) index 1 has 30% chance of happening (40 - 10)
    // (40 - 99 ) and index 2 is gonna have a 60& chance (100 - 40)
    return [10, 40, MAX_CHANCE_VALUE];
  }

  // Don't really know why this function is needed
  // instead of just plain initializing contract on constructor
  function _initializeContract(string[3] memory dogTokenUris) private {
    if (s_initialized) {
      revert RandomIpfsNft__AlreadyInitialized();
    }
    s_dogTokenUris = dogTokenUris;
    s_initialized = true;
  }

  function getBreedFromModdedRng(uint256 moddedRng) public pure returns (Breed) {
    // we're gonna loop through this
    uint256 cumulativeSum = 0;
    // we're getting the chanceArray from below
    uint256[3] memory chanceArray = getChanceArray();
    // then we do a for loop that will run 3 times
    for (uint256 i = 0; i < chanceArray.length; i++) {
      // moddedRng is the number between 0 and 99
      // for example 25, is bigger than 0 (cumulative sum) and bigger
      // than 0 + 10 chanceArray[0]. But not bigger than 10 + 30 chanceArray [1]
      // So, it returns Breed(1) -> SHIBA_INU
      if (moddedRng >= cumulativeSum && moddedRng < chanceArray[i]) {
        return Breed(i);
      }
      cumulativeSum = chanceArray[i];
    }
    revert RandomIpfsNft__RangeOutOfBounds();
  }

  function withdraw() public onlyOwner {
    uint256 amount = address(this).balance;
    (bool success, ) = payable(msg.sender).call{value: amount}("");
    if (!success) {
      revert RandomIpfsNft__TransferFailed();
    }
  }

  function getMintFee() public view returns (uint256) {
    return i_mintFee;
  }

  function getDogTokenUris(uint256 index) public view returns (string memory) {
    return s_dogTokenUris[index];
  }

  function getInitialized() public view returns (bool) {
    return s_initialized;
  }

  function getTokenCounter() public view returns (uint256) {
    return s_tokenCounter;
  }
}
