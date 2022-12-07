// SPDX-License-Identifier: MIT
// Pragma
pragma solidity ^0.8.8;

// Imports
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "./PriceConverter.sol";

// Error codes
error FundMe__NotOwner();

// Interfaces, Libraries, Contracts

/** @title A contract for crowd funding
 * @author Lulox
 * @notice This contract is to demo a sample funding contract
 * @dev This implements price feeds as our library
 */
contract FundMe {
  // Type Declarations
  using PriceConverter for uint256;

  // State variables
  mapping(address => uint256) private s_addressToAmountFunded;
  address[] private s_funders;
  address private immutable i_owner;
  uint256 public constant MINIMUM_USD = 50 * 10**18;
  // 2. Variable of type AggregatorV3Interface to store priceFeed address
  AggregatorV3Interface private s_priceFeed;

  // Modifiers
  modifier onlyOwner() {
    if (msg.sender != i_owner) revert FundMe__NotOwner();
    _;
  }

  // Functions order:
  //// constructor
  //// receive
  //// fallback
  //// external
  //// public
  //// internal
  //// private
  //// view / pure

  // Functions
  // 1. We give an address to the constructor for the priceFeed
  constructor(address priceFeedAddress) {
    i_owner = msg.sender;
    // Useful for changing the priceFeed address depending on what chain we're on
    s_priceFeed = AggregatorV3Interface(priceFeedAddress);
  }

  /** @notice This function funds this contract
   */
  function fund() public payable {
    // 3. We call the library that is using PriceConverter for uint256.
    // 1st parameter is msg.value (value sent), 2nd is priceFeed.
    require(
      msg.value.getConversionRate(s_priceFeed) >= MINIMUM_USD,
      "You need to spend more ETH!"
    );
    // require(PriceConverter.getConversionRate(msg.value) >= MINIMUM_USD, "You need to spend more ETH!");
    s_addressToAmountFunded[msg.sender] += msg.value;
    s_funders.push(msg.sender);
  }

  function withdraw() public onlyOwner {
    for (
      uint256 funderIndex = 0;
      funderIndex < s_funders.length;
      funderIndex++
    ) {
      address funder = s_funders[funderIndex];
      s_addressToAmountFunded[funder] = 0;
    }
    s_funders = new address[](0);
    // // transfer
    // payable(msg.sender).transfer(address(this).balance);
    // // send
    // bool sendSuccess = payable(msg.sender).send(address(this).balance);
    // require(sendSuccess, "Send failed");
    // // call
    (bool callSuccess, ) = payable(msg.sender).call{
      value: address(this).balance
    }("");
    require(callSuccess, "Call failed");
  }

  function cheaperWithdraw() public payable onlyOwner {
    // We can read the entire array into memory one time, and then read from there
    // to save gas.  Reading from memory is cheaper than reading from storage
    address[] memory funders = s_funders;
    // Mappings can't be in memory :(
    // Now we do the same as above but from memory
    for (uint256 funderIndex = 0; funderIndex < funders.length; funderIndex++) {
      // Getting an address for funder in current position
      address funder = funders[funderIndex];
      // And setting that address to 0 in the mapping
      s_addressToAmountFunded[funder] = 0;
    }
    // Setting the storage array to a new array with 0 entries
    s_funders = new address[](0);
    // Getting the success boolean out of calling (sending) the contract balance
    // to i_owner with no message ("")
    (bool success, ) = i_owner.call{value: address(this).balance}("");
    // Require success to be true or don't do anything
    require(success);
  }

  function getVersion() public view returns (uint256) {
    return s_priceFeed.version();
  }

  function getOwner() public view returns (address) {
    return i_owner;
  }

  function getFunder(uint256 index) public view returns (address) {
    return s_funders[index];
  }

  function getAddressToAmountFunded(address funder)
    public
    view
    returns (uint256)
  {
    return s_addressToAmountFunded[funder];
  }

  function getPriceFeed() public view returns (AggregatorV3Interface) {
    return s_priceFeed;
  }
}
