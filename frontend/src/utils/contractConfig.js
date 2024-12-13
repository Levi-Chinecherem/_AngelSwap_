// Import ABIs
import AngelTokenABI from "../contracts/AngelToken.sol//AngelToken.json";
import NGNTokenABI from "../contracts/OtherToken.sol/OtherToken.json";
import EKETokenABI from "../contracts/OtherToken.sol/OtherToken.json";
import ONUTokenABI from "../contracts/OtherToken.sol/OtherToken.json";
import HALOTokenABI from "../contracts/OtherToken.sol/OtherToken.json";
import FaucetABI from "../contracts/Faucet/Faucet.json";
import LiquidityPoolABI from "../contracts/LiquidityPool.sol//LiquidityPool.json";
import LiquidityPoolFactoryABI from "../contracts/LiquidityPoolFactory.sol//LiquidityPoolFactory.json";
import OrderBookABI from "../contracts/OrderBook.sol//OrderBook.json";

// Contract addresses
const contractAddresses = {
  AngelToken: "0xCB32472D3cf39dD88Aeb261139D9906a12dA7403",
  NGNToken: "0xf7563bF7F5FD31322566E7874ED5BAbD2C99A80F",
  EKEToken: "0xFc10A198B69d12c4539c647B5Bb37d9AfCE6a079",
  ONUToken: "0x01B1853A247E3040401f9196fF30C5f5FF548cdF",
  HALOToken: "0x708C8012C65607C5E1B437613F6FAda2A3057194",
  Faucet: "0x519863aA2Ed5245Ac77C037E2A793eC5c4EdEdd0",
  LiquidityPool: "0xd83d96b2d78335B347b269FDD6e13dEA26626Ee1",
  LiquidityPoolFactory: "0xA01BFc416F7D7Cb0e0F327908D5af95cF105a680",
  OrderBook: "0x88C6f0c6ab50Fd9C77709EF80d6A5e8874Dc1aEd",
};

// Contract configurations
const contracts = {
  AngelToken: {
    address: contractAddresses.AngelToken,
    abi: AngelTokenABI,
  },
  NGNToken: {
    address: contractAddresses.NGNToken,
    abi: NGNTokenABI,
  },
  EKEToken: {
    address: contractAddresses.EKEToken,
    abi: EKETokenABI,
  },
  ONUToken: {
    address: contractAddresses.ONUToken,
    abi: ONUTokenABI,
  },
  HALOToken: {
    address: contractAddresses.HALOToken,
    abi: HALOTokenABI,
  },
  Faucet: {
    address: contractAddresses.Faucet,
    abi: FaucetABI,
  },
  LiquidityPool: {
    address: contractAddresses.LiquidityPool,
    abi: LiquidityPoolABI,
  },
  LiquidityPoolFactory: {
    address: contractAddresses.LiquidityPoolFactory,
    abi: LiquidityPoolFactoryABI,
  },
  OrderBook: {
    address: contractAddresses.OrderBook,
    abi: OrderBookABI,
  },
};

export default contracts;
