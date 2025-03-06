// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @title Prof. Eke Token
contract ProfEkeToken is ERC20 {
    uint256 public constant MAX_SUPPLY = 10_000_000 * 10 ** 18; // 100 Billion tokens

    constructor() ERC20("Prof. Eke Token", "EKE") {
        _mint(msg.sender, MAX_SUPPLY);
    }
}

/// @title Prof. Onuodu Token
contract ProfOnuoduToken is ERC20 {
    uint256 public constant MAX_SUPPLY = 10_000_000 * 10 ** 18; // 100 Billion tokens

    constructor() ERC20("Prof. Onuodu Token", "ONU") {
        _mint(msg.sender, MAX_SUPPLY);
    }
}

/// @title NGN Token
contract NGNToken is ERC20 {
    uint256 public constant MAX_SUPPLY = 100_000_000 * 10 ** 18; // 100 Billion tokens

    constructor() ERC20("NGN Token", "NGN") {
        _mint(msg.sender, MAX_SUPPLY);
    }
}

/// @title Angel Token
contract AngelToken is ERC20 {
    uint256 public constant MAX_SUPPLY = 1_000_000_000_000 * 10 ** 18; // 100 Billion tokens

    constructor() ERC20("Angel Token", "ANG") {
        _mint(msg.sender, MAX_SUPPLY);
    }
}

/// @title Halo Token
contract HaloToken is ERC20 {
    uint256 public constant MAX_SUPPLY = 10_000_000 * 10 ** 18; // 100 Billion tokens

    constructor() ERC20("Halo Token", "HALO") {
        _mint(msg.sender, MAX_SUPPLY);
    }
}
