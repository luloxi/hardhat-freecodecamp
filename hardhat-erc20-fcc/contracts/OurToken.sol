// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract OurToken is ERC20 {
  // Right behind constructor we add ERC20 constructor
  constructor(uint256 initialSupply) ERC20("OurToken", "OT") {
    // Mint is a ERC20 function
    // For an initial supply of 50 -> 50e18 or 50 * 10**18
    // because of the decimals (erc20 has 18 by default)
    _mint(msg.sender, initialSupply);
  }
}
