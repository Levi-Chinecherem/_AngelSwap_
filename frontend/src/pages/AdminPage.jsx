import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ethers } from "ethers";
import {
  createLiquidityPool,
  addTokenToOrderBook,
  fetchAllLiquidityPools,
  fetchAllTokens as fetchAdminTokens,
  clearError,
} from "../store/slices/adminSlice";
import { fetchTokenBalances, fetchPoolDetails } from "../store/slices/liquidityPoolSlice";
import { toast } from "../components/ui/use-toast";
import LiquidityPoolABI from "../contracts/LiquidityPool.sol/LiquidityPool.json";

const ERC20_ABI = [
  "function symbol() view returns (string)",
];

const AdminPage = () => {
  const dispatch = useDispatch();
  const { liquidityPools, tokens: adminTokens, loading, error } = useSelector((state) => state.admin);
  const [token1, setToken1] = useState("");
  const [token2, setToken2] = useState("");
  const [newToken, setNewToken] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [connecting, setConnecting] = useState(false);
  const [poolDetails, setPoolDetails] = useState({}); // Store pool address -> {token1Symbol/token2Symbol}
  const [tokenSymbols, setTokenSymbols] = useState({}); // Store token address -> symbol

  // Parse admin wallet addresses from .env
  const adminAddresses = (process.env.REACT_APP_ADMIN_WALLET_ADDRESSES || process.env.REACT_APP_ADMIN_WALLET_ADDRESS || "")
    .split(",")
    .map(addr => addr.trim().toLowerCase())
    .filter(addr => addr && ethers.isAddress(addr)); // Ensure valid addresses

  // Handle create liquidity pool
  const handleCreateLiquidityPool = async () => {
    if (!token1 || !token2) {
      toast({
        title: "Invalid Input",
        description: "Please enter both token addresses",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await dispatch(createLiquidityPool({ token1, token2 })).unwrap();
      toast({
        title: "Success",
        description: `Pool created successfully at ${result.poolAddress}`,
      });
      setToken1("");
      setToken2("");
      dispatch(fetchAllLiquidityPools());
    } catch (error) {
      toast({
        title: "Error",
        description: error.toString(),
        variant: "destructive",
      });
    }
  };

  // Handle add token to order book
  const handleAddToken = async () => {
    if (!newToken) {
      toast({
        title: "Invalid Input",
        description: "Please enter a token address",
        variant: "destructive",
      });
      return;
    }
    try {
      await dispatch(addTokenToOrderBook(newToken)).unwrap();
      toast({
        title: "Success",
        description: "Token added successfully",
      });
      setNewToken("");
      dispatch(fetchAdminTokens());
    } catch (error) {
      toast({
        title: "Error",
        description: error.toString(),
        variant: "destructive",
      });
    }
  };

  // Connect wallet
  const connectWallet = async () => {
    if (!window.ethereum) {
      toast({
        title: "Error",
        description: "Please install MetaMask.",
        variant: "destructive",
      });
      return;
    }

    setConnecting(true);
    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      if (accounts.length > 0) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();

        setWalletAddress(address);
        setIsConnected(true);
        setIsAdmin(adminAddresses.includes(address.toLowerCase()));
      }
    } catch (error) {
      console.error("Connection error:", error);
      toast({
        title: "Error",
        description: "Failed to connect wallet",
        variant: "destructive",
      });
    } finally {
      setConnecting(false);
    }
  };

  // Check wallet connection on mount
  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: "eth_accounts" });
          if (accounts.length > 0) {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const address = await signer.getAddress();

            setWalletAddress(address);
            setIsConnected(true);
            setIsAdmin(adminAddresses.includes(address.toLowerCase()));
          }
        } catch (error) {
          console.error("Error checking connection:", error);
        }
      }
    };

    checkConnection();
  }, [adminAddresses]);

  // Handle wallet events
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = async (accounts) => {
      if (accounts.length > 0) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();

        setWalletAddress(address);
        setIsConnected(true);
        setIsAdmin(adminAddresses.includes(address.toLowerCase()));
      } else {
        setWalletAddress("");
        setIsConnected(false);
        setIsAdmin(false);
      }
    };

    const handleChainChanged = () => {
      window.location.reload();
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);

    return () => {
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
      window.ethereum.removeListener("chainChanged", handleChainChanged);
    };
  }, [adminAddresses]);

  // Fetch data when connected
  useEffect(() => {
    if (isConnected && isAdmin) {
      dispatch(fetchAllLiquidityPools());
      dispatch(fetchAdminTokens());
    }
  }, [dispatch, isConnected, isAdmin]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        if (window.ethereum) {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          const address = await signer.getAddress();

          console.log("Fetching pool details for address:", address);

          await Promise.all([
            dispatch(fetchTokenBalances(address)).unwrap(),
            dispatch(fetchPoolDetails(address)).unwrap(),
          ]);
        }
      } catch (err) {
        console.error("Error fetching initial data:", err);
        toast({
          title: "Error",
          description: "Failed to load initial data: " + (err.message || "Unknown error"),
          variant: "destructive",
        });
      }
    };
    fetchInitialData();
  }, [dispatch]);

  // Fetch token symbols and pool pairs
  useEffect(() => {
    const fetchTokenDetails = async () => {
      if (!walletAddress || !isAdmin) return;

      const provider = new ethers.BrowserProvider(window.ethereum);

      // Fetch token symbols for order book tokens
      const tokenSymbolsMap = {};
      for (const tokenAddr of adminTokens) {
        try {
          const tokenContract = new ethers.Contract(tokenAddr, ERC20_ABI, provider);
          const symbol = await tokenContract.symbol();
          tokenSymbolsMap[tokenAddr] = symbol;
        } catch (err) {
          console.error(`Error fetching symbol for token ${tokenAddr}:`, err);
          tokenSymbolsMap[tokenAddr] = "UNKNOWN";
        }
      }
      setTokenSymbols(tokenSymbolsMap);

      // Fetch pool pairs
      const poolPairsMap = {};
      for (const poolAddr of liquidityPools) {
        try {
          const poolContract = new ethers.Contract(poolAddr, LiquidityPoolABI.abi, provider);
          const [token1, token2] = await Promise.all([poolContract.token1(), poolContract.token2()]);
          const token1Contract = new ethers.Contract(token1, ERC20_ABI, provider);
          const token2Contract = new ethers.Contract(token2, ERC20_ABI, provider);
          const [symbol1, symbol2] = await Promise.all([token1Contract.symbol(), token2Contract.symbol()]);
          poolPairsMap[poolAddr] = `${symbol1}/${symbol2}`;
        } catch (err) {
          console.error(`Error fetching pair for pool ${poolAddr}:`, err);
          poolPairsMap[poolAddr] = "UNKNOWN/UNKNOWN";
        }
      }
      setPoolDetails(poolPairsMap);
    };

    if (isConnected && isAdmin && (adminTokens.length > 0 || liquidityPools.length > 0)) {
      fetchTokenDetails();
    }
  }, [isConnected, isAdmin, adminTokens, liquidityPools]);

  // Auto-clear errors
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  return (
    <div className="container mx-auto px-4 pt-20 py-8">
      {!isConnected ? (
        <div className="text-center pt-20 py-12">
          <h2 className="text-2xl font-bold mb-4">Welcome to Admin Dashboard</h2>
          <button
            onClick={connectWallet}
            disabled={connecting}
            className="btn-glow nav-button px-6 py-2 rounded-lg"
          >
            {connecting ? "Connecting..." : "Connect Wallet"}
          </button>
        </div>
      ) : !isAdmin ? (
        <div className="text-center pt-20 py-12">
          <h2 className="text-2xl font-bold text-red-500">Access Denied</h2>
          <p className="text-gray-400">Only admins can access this page.</p>
          <p className="text-gray-400 mt-4">
            Connected Wallet: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
          </p>
        </div>
      ) : (
        <>
          <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

          {/* Create Liquidity Pool */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Create Liquidity Pool</h2>
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="Token 1 Address"
                value={token1}
                onChange={(e) => setToken1(e.target.value)}
                className="input-glow bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-2 flex-1"
              />
              <input
                type="text"
                placeholder="Token 2 Address"
                value={token2}
                onChange={(e) => setToken2(e.target.value)}
                className="input-glow bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-2 flex-1"
              />
              <button
                onClick={handleCreateLiquidityPool}
                className="btn-glow nav-button px-6 py-2 rounded-lg whitespace-nowrap"
                disabled={loading}
              >
                {loading ? "Creating..." : "Create Pool"}
              </button>
            </div>
          </div>

          {/* Add Token to Order Book */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Add Token to Order Book</h2>
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="Token Address"
                value={newToken}
                onChange={(e) => setNewToken(e.target.value)}
                className="input-glow bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-2 flex-1"
              />
              <button
                onClick={handleAddToken}
                className="btn-glow nav-button px-6 py-2 rounded-lg whitespace-nowrap"
                disabled={loading}
              >
                {loading ? "Adding..." : "Add Token"}
              </button>
            </div>
          </div>

          {/* Display Liquidity Pools */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Liquidity Pools</h2>
            {loading ? (
              <p className="text-gray-400">Loading pools...</p>
            ) : liquidityPools.length > 0 ? (
              <div className="bg-gray-800 rounded-lg p-4">
                <ul className="space-y-2">
                  {liquidityPools.map((pool, index) => (
                    <li key={index} className="text-gray-300 break-all">
                      <span className="font-medium">Pool {index + 1}:</span>{" "}
                      {poolDetails[pool] || "Loading..."} - {pool}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-gray-400">No liquidity pools found</p>
            )}
          </div>

          {/* Display Tokens */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Tokens in Order Book</h2>
            {loading ? (
              <p className="text-gray-400">Loading tokens...</p>
            ) : adminTokens.length > 0 ? (
              <div className="bg-gray-800 rounded-lg p-4">
                <ul className="space-y-2">
                  {adminTokens.map((token, index) => (
                    <li key={index} className="text-gray-300 break-all">
                      <span className="font-medium">Token {index + 1}:</span>{" "}
                      {tokenSymbols[token] || "Loading..."} - {token}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-gray-400">No tokens found</p>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <div className="fixed bottom-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg">
              <p>{error}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminPage;