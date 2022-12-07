// SPDX-License-Identifier: MIT

// This contract is better visualized in Remix IDE

pragma solidity ^0.8.7;

import "@openzeppelin/contracts/proxy/Proxy.sol";

// Being "Proxy" gives it the functionality of delegating received calls to Implementation
contract SmallProxy is Proxy {
    // This is the keccak-256 hash of "eip1967.proxy.implementation" substracted by 1
    bytes32 private constant _IMPLEMENTATION_SLOT =
        0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc;

    // ^ Location of the implementation addresss

    function setImplementation(address newImplementation) public {
        assembly {
            sstore(_IMPLEMENTATION_SLOT, newImplementation)
        }
    }

    function _implementation() internal view override returns (address implementationAddress) {
        assembly {
            // := stands for "set to"
            implementationAddress := sload(_IMPLEMENTATION_SLOT)
        }
    }

    // Returns data to use as CALLDATA
    function getDataToTransact(uint256 numberToUpdate) public pure returns (bytes memory) {
        return abi.encodeWithSignature("setValue(uint256)", numberToUpdate);
    }

    function readStorage() public view returns (uint256 valueAtStorageSlotZero) {
        // We're reading directly from storage slot 0, and then returning it
        assembly {
            valueAtStorageSlotZero := sload(0)
        }
    }
}

// Any time somebody calls SmallProxy is gonna delegate call it to ImplementationA and save the storage in SmallProxy address
contract ImplementationA {
    uint256 public value;

    function setValue(uint256 newValue) public {
        value = newValue;
    }
}

contract ImplementationB {
    uint256 public value;

    function setValue(uint256 newValue) public {
        value = newValue + 2;
    }
}
