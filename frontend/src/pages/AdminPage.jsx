import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ethers } from "ethers";
import {
  createLiquidityPool,
  addTokenToOrderBook,
  fetchAllLiquidityPools,
  fetchAllTokens,
} from "../store/slices/adminSlice";

const AdminPage = () => {
  const dispatch = useDispatch();
  const { liquidityPools, tokens, loading, error } = useSelector((state) => state.admin);
  const [token1, setToken1] = useState("");
  const [token2, setToken2] = useState("");
  const [newToken, setNewToken] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  // Check if the connected wallet is the admin
  useEffect(() => {
    const checkAdmin = async () => {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const address = await signer.getAddress();
        const adminAddress = process.env.REACT_APP_ADMIN_WALLET_ADDRESS; // Set in .env
        setIsAdmin(address.toLowerCase() === adminAddress.toLowerCase());
      }
    };
    checkAdmin();
  }, []);

  // Fetch data on load
  useEffect(() => {
    dispatch(fetchAllLiquidityPools());
    dispatch(fetchAllTokens());
  }, [dispatch]);

  // Handle create liquidity pool
  const handleCreateLiquidityPool = async () => {
    if (!token1 || !token2) return;
    await dispatch(createLiquidityPool({ token1, token2 }));
    setToken1("");
    setToken2("");
  };

  // Handle add token to order book
  const handleAddToken = async () => {
    if (!newToken) return;
    await dispatch(addTokenToOrderBook(newToken));
    setNewToken("");
  };

  if (!isAdmin) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-red-500">Access Denied</h2>
        <p className="text-gray-400">Only the admin can access this page.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
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
            className="input-glow bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-2"
          />
          <input
            type="text"
            placeholder="Token 2 Address"
            value={token2}
            onChange={(e) => setToken2(e.target.value)}
            className="input-glow bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-2"
          />
          <button
            onClick={handleCreateLiquidityPool}
            className="btn-glow nav-button px-6 py-2 rounded-lg"
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
            className="input-glow bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-2"
          />
          <button
            onClick={handleAddToken}
            className="btn-glow nav-button px-6 py-2 rounded-lg"
            disabled={loading}
          >
            {loading ? "Adding..." : "Add Token"}
          </button>
        </div>
      </div>

      {/* Display Liquidity Pools */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Liquidity Pools</h2>
        <ul className="space-y-2">
          {liquidityPools.map((pool, index) => (
            <li key={index} className="text-gray-300">
              Pool {index + 1}: {pool}
            </li>
          ))}
        </ul>
      </div>

      {/* Display Tokens */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Tokens in Order Book</h2>
        <ul className="space-y-2">
          {tokens.map((token, index) => (
            <li key={index} className="text-gray-300">
              Token {index + 1}: {token}
            </li>
          ))}
        </ul>
      </div>

      {/* Error Display */}
      {error && <p className="text-red-500 mt-4">{error}</p>}
    </div>
  );
};

export default AdminPage;