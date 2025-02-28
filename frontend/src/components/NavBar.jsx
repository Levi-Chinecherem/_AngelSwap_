import React, { useState, useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ethers } from "ethers"; // Import ethers fully
import {
  setWalletAddress,
  setIsConnecting,
  setWalletError,
  resetWallet,
} from "../store/slices/walletSlice";
import { toggleGlobalSecurity, revealGlobalTransaction } from "../store/slices/securitySlice";
import { createSelector } from "@reduxjs/toolkit";
import { FaWallet, FaLock, FaUnlock } from "react-icons/fa";

const selectTransactions = createSelector(
  [(state) => state.liquidityPool.transactions, (state) => state.orderBook.transactions],
  (liquidityPool, orderBook) => ({
    liquidityPool,
    orderBook,
  })
);

const NavBar = () => {
  const dispatch = useDispatch();
  const [showMenu, setShowMenu] = useState(false);

  const { securityEnabled, loading } = useSelector((state) => state.security);
  const transactions = useSelector(selectTransactions);
  const { address: walletAddress, isConnecting } = useSelector((state) => state.wallet);

  // Connect or restore wallet connection
  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      console.error("MetaMask or compatible wallet not detected.");
      dispatch(setWalletError("MetaMask not detected"));
      return;
    }

    if (isConnecting) return;

    try {
      dispatch(setIsConnecting(true));
      dispatch(setWalletError(null));

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();

      // Request accounts if not already connected
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      if (accounts.length === 0) {
        throw new Error("No accounts found");
      }

      dispatch(setWalletAddress(address));
    } catch (error) {
      console.error("Error connecting wallet:", error);
      dispatch(setWalletError(error.message));
      dispatch(resetWallet());
    } finally {
      dispatch(setIsConnecting(false));
    }
  }, [dispatch, isConnecting]);

  // Check wallet connection on mount and navigation
  useEffect(() => {
    const checkWalletConnection = async () => {
      if (!window.ethereum) return;

      try {
        const accounts = await window.ethereum.request({ method: "eth_accounts" });
        if (accounts.length > 0) {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          const address = await signer.getAddress();
          dispatch(setWalletAddress(address));
        } else if (walletAddress) {
          // If no accounts but walletAddress exists, reset (user disconnected manually)
          dispatch(resetWallet());
        }
      } catch (error) {
        console.error("Error checking wallet connection:", error);
        dispatch(setWalletError(error.message));
      }
    };

    checkWalletConnection();
  }, [dispatch, walletAddress]); // Include walletAddress to re-check on navigation

  // Handle wallet events
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = async (accounts) => {
      if (accounts.length === 0) {
        dispatch(resetWallet());
      } else {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        dispatch(setWalletAddress(address));
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
  }, [dispatch]);

  const handleToggleSecurity = async () => {
    const newSecurityState = !securityEnabled;
    await dispatch(toggleGlobalSecurity(newSecurityState));

    if (!newSecurityState) {
      if (transactions.liquidityPool.items) {
        for (const tx of transactions.liquidityPool.items) {
          if (tx.status === "pending") {
            await dispatch(
              revealGlobalTransaction({
                txHash: tx.txHash,
                contractType: "liquidityPool",
              })
            );
          }
        }
      }

      if (transactions.orderBook.length > 0) {
        for (const txHash of transactions.orderBook) {
          await dispatch(
            revealGlobalTransaction({
              txHash,
              contractType: "orderBook",
            })
          );
        }
      }
    }
  };

  const toggleMenu = () => {
    setShowMenu((prevState) => !prevState);
  };

  return (
    <header className="fixed top-0 w-full z-50 bg-sciFiBg shadow-lg">
      <nav className="max-w-7xl mx-auto flex justify-between items-center p-4">
        <a href="/" className="text-2xl font-bold text-sciFiAccent">
          AngelSwap
        </a>

        <button
          className="md:hidden flex items-center justify-center w-10 h-10 text-sciFiAccent z-50"
          onClick={toggleMenu}
        >
          {showMenu ? (
            <span className="text-2xl font-bold">✕</span>
          ) : (
            <span className="text-2xl font-bold">☰</span>
          )}
        </button>

        <ul
          className={`fixed top-0 left-0 w-full h-screen bg-sciFiBg flex flex-col justify-center items-center space-y-6 text-lg font-semibold transition-transform transform ${
            showMenu ? "translate-x-0" : "-translate-x-full"
          } md:static md:flex md:flex-row md:space-y-0 md:space-x-6 md:h-auto md:w-auto md:translate-x-0 z-40`}
        >
          <li>
            <a
              href="/"
              className="hover:text-sciFiAccent text-white"
              onClick={() => setShowMenu(false)}
            >
              Home
            </a>
          </li>
          <li>
            <a
              href="/swap"
              className="hover:text-sciFiAccent text-white"
              onClick={() => setShowMenu(false)}
            >
              Swap
            </a>
          </li>
          <li>
            <a
              href="/liquidity"
              className="hover:text-sciFiAccent text-white"
              onClick={() => setShowMenu(false)}
            >
              Liquidity
            </a>
          </li>
          <li>
            <a
              href="/mempool"
              className="hover:text-sciFiAccent text-white"
              onClick={() => setShowMenu(false)}
            >
              Mempool
            </a>
          </li>
          <li>
            <a
              href="/history"
              className="hover:text-sciFiAccent text-white"
              onClick={() => setShowMenu(false)}
            >
              History
            </a>
          </li>
          <li>
            <a
              href="/about"
              className="hover:text-sciFiAccent text-white"
              onClick={() => setShowMenu(false)}
            >
              About
            </a>
          </li>
        </ul>

        <div className="flex items-center space-x-4">
          <button
            onClick={connectWallet}
            disabled={isConnecting}
            className="flex items-center space-x-2 text-sciFiAccent hover:text-sciFiAccentHover transition-colors"
          >
            <FaWallet className="text-xl" />
            {isConnecting ? (
              <span className="text-sm text-white">Connecting...</span>
            ) : walletAddress ? (
              <span className="text-sm text-white">
                {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
              </span>
            ) : (
              <span className="text-sm text-white">Connect Wallet</span>
            )}
          </button>

          <button
            onClick={handleToggleSecurity}
            disabled={loading}
            className="flex items-center space-x-2 text-sciFiAccent hover:text-sciFiAccentHover transition-colors"
          >
            {securityEnabled ? (
              <FaLock className="text-xl" />
            ) : (
              <FaUnlock className="text-xl" />
            )}
          </button>
        </div>
      </nav>
    </header>
  );
};

export default NavBar;