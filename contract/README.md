# AngelSwap Contracts

AngelSwap is a decentralized platform built on PulseChain that facilitates token distribution, liquidity pooling, and decentralized trading. This repository contains the smart contract codebase for the AngelSwap ecosystem, including the AngelToken, faucet, liquidity pool, and order book functionalities.

## Table of Contents
- [Features](#features)
- [Smart Contracts](#smart-contracts)
  - [AngelToken](#angeltoken)
  - [OtherTokens (NGN, EKE, ONU, HALO)](#othertokens)
  - [Faucet](#faucet)
  - [Liquidity Pool](#liquidity-pool)
  - [Liquidity Pool Factory](#liquidity-pool-factory)
  - [Order Book](#order-book)
- [Deployment](#deployment)
  - [Pre-requisites](#pre-requisites)
  - [Deployment Steps](#deployment-steps)
- [Usage](#usage)
- [Contract Addresses](#contract-addresses)
- [Testing](#testing)
- [License](#license)

---

## Features

- **Token Distribution**: Users can claim free tokens daily using the Faucet.
- **Liquidity Pools**: Enable users to pool liquidity for decentralized trading.
- **Order Book**: Facilitates decentralized trading by matching buy and sell orders.
- **Multi-token Support**: Native ANGEL token and four additional tokens (NGN, EKE, ONU, HALO).

---

## Smart Contracts

### AngelToken
The native token of the AngelSwap platform. It's an ERC20-compliant token used for liquidity pooling, trading, and staking.

**Key Functions:**
- Standard ERC20 functions (transfer, approve, etc.)
- Minting and burning capabilities

### OtherTokens
Four additional tokens are deployed:
1. **NGN Token**: Represents a stable token.
2. **EKE Token**: Community-focused token.
3. **ONU Token**: Governance-focused token.
4. **HALO Token**: Rewards-focused token.

**Key Features:**
- Standard ERC20 compliance

### Faucet
The Faucet distributes ANGEL tokens and other tokens daily to users. Each user can claim tokens once per 24 hours.

**Key Functions:**
- Claim tokens
- Update claim amount
- Update cooldown period

### Liquidity Pool
A contract for pooling liquidity between ANGEL and other tokens, facilitating decentralized trading.

**Key Functions:**
- Add liquidity
- Remove liquidity
- Calculate pool shares

### Liquidity Pool Factory
A factory contract for deploying new liquidity pools. It ensures that all pools follow a standard implementation.

**Key Functions:**
- Deploy a new liquidity pool
- Retrieve existing pools

### Order Book
The Order Book contract matches buy and sell orders, enabling decentralized trading.

**Key Functions:**
- Place buy/sell orders
- Cancel orders
- Match orders

---

## Deployment

### Pre-requisites
- [Node.js](https://nodejs.org/)
- [Hardhat](https://hardhat.org/)
- PulseChain testnet/mainnet RPC URL
- Wallet private key with testnet/mainnet tokens for deployment gas fees

### Deployment Steps
1. Clone the repository:
   ```bash
   git clone https://github.com/Levi-Chinecherem/AngelSwap.git
   cd AngelSwap/contract
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure `.env`:
   Create a `.env` file in the root directory with the following variables:
   ```env
   PRIVATE_KEY=<your-private-key>
   PULSECHAIN_RPC_URL=<pulsechain-rpc-url>
   ```

4. Deploy contracts:
   - Deploy `AngelToken`:
     ```bash
     npx hardhat run scripts/deployAngelToken.js --network pulsechain
     ```
   - Deploy `OtherTokens`:
     ```bash
     npx hardhat run scripts/deployOtherTokens.js --network pulsechain
     ```
   - Deploy `Faucet`:
     ```bash
     npx hardhat run scripts/deployFaucet.js --network pulsechain
     ```
   - Deploy `LiquidityPool` and `LiquidityPoolFactory`:
     ```bash
     npx hardhat run scripts/deployLiquidityPool.js --network pulsechain
     npx hardhat run scripts/deployLiquidityPoolFactory.js --network pulsechain
     ```
   - Deploy `OrderBook`:
     ```bash
     npx hardhat run scripts/deployOrderBook.js --network pulsechain
     ```

---

## Usage

1. **Faucet**:
   - Users can claim ANGEL and other tokens daily.
   - The contract owner can update claim amounts and cooldown periods.

2. **Liquidity Pools**:
   - Users can add liquidity to pools and earn rewards from trading fees.
   - Pools are created and managed via the LiquidityPoolFactory.

3. **Order Book**:
   - Users can place buy/sell orders for tokens.
   - The contract matches orders and facilitates trades.

---

## Contract Addresses
The following are the deployed contract addresses on the PulseChain network:

| Contract                | Address                                    |
|-------------------------|--------------------------------------------|
| **AngelToken**          | `0xC28a443f94F01dB36796b9dcE0A5f880aAe43c6f` |
| **NGN Token**           | `0x3955FFBB3e63F898eDe0DD3DAd6fb1e1685c3b52` |
| **EKE Token**           | `0x30dBE7909a36bEd5f51C9a91B9856B8314772c4F` |
| **ONU Token**           | `0xdC7fD7f7DF8a0b9A4E2b78120d00D7A0fc512c9b` |
| **HALO Token**          | `0x8b6216C7aEf94a93f2556FD936ed8f55Cf65f9aC` |
| **Faucet**              | `0xFE7EE287CcA1092BD1B3B7B19b807295180CE801` |
| **LiquidityPool**       | `0xf29283041b2F6401EF8d00B6754AcC05e8440174` |
| **LiquidityPoolFactory**| `0x9e6Ea38aFAFe380321279A379009E7F3F0cc4101` |
| **OrderBook**           | `0x312897bF6C79c4774f36c3d1457E0E0A3fdDFEc7` |

---

## Testing

1. Write and run tests:
   ```bash
   npx hardhat test
   ```
2. Test individual scripts:
   ```bash
   npx hardhat run scripts/<script-name>.js --network pulsechain
   ```

---

## License

This project is licensed under the [MIT License](LICENSE).
