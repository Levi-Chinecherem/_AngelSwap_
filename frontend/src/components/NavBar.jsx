import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toggleGlobalSecurity, revealGlobalTransaction } from "../store/slices/securitySlice";
import { ethers } from "ethers";
import { setWalletAddress, setProvider, setSigner } from "../store/slices/walletSlice";

// Icons
import { FaWallet, FaLock, FaUnlock } from "react-icons/fa";

const NavBar = () => {
  const dispatch = useDispatch();
  const [showMenu, setShowMenu] = useState(false);

  // Get security state from the global security slice
  const { securityEnabled, loading } = useSelector((state) => state.security);
  const { transactions } = useSelector((state) => ({
    liquidityPool: state.liquidityPool.transactions,
    orderBook: state.orderBook.transactions,
  }));

  // Get wallet state from the wallet slice
  const walletAddress = useSelector((state) => state.wallet.address);

  const handleToggleSecurity = async () => {
    const newSecurityState = !securityEnabled;
    await dispatch(toggleGlobalSecurity(newSecurityState));

    // If security is being turned off, reveal all pending transactions
    if (!newSecurityState) {
      // Reveal Liquidity Pool transactions
      if (transactions.liquidityPool.items) {
        for (const tx of transactions.liquidityPool.items) {
          if (tx.status === "pending") {
            await dispatch(revealGlobalTransaction({
              txHash: tx.txHash,
              contractType: "liquidityPool",
            }));
          }
        }
      }

      // Reveal OrderBook transactions
      if (transactions.orderBook.length > 0) {
        for (const txHash of transactions.orderBook) {
          await dispatch(revealGlobalTransaction({
            txHash,
            contractType: "orderBook",
          }));
        }
      }
    }
  };

  // Connect wallet
  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        // Request account access
        await window.ethereum.request({ method: "eth_requestAccounts" });

        // Set up ethers provider and signer
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const address = await signer.getAddress();

        // Dispatch wallet connection details to Redux store
        dispatch(setWalletAddress(address));
        dispatch(setProvider(provider));
        dispatch(setSigner(signer));

        // Listen for account changes
        window.ethereum.on("accountsChanged", (accounts) => {
          dispatch(setWalletAddress(accounts[0]));
        });

        // Listen for chain changes
        window.ethereum.on("chainChanged", () => {
          window.location.reload();
        });
      } catch (error) {
        console.error("Error connecting wallet:", error);
      }
    } else {
      console.error("MetaMask or compatible wallet not detected.");
    }
  };

  const toggleMenu = () => {
    setShowMenu((prevState) => !prevState);
  };

  return (
    <header className="fixed top-0 w-full z-50 bg-sciFiBg shadow-lg">
      <nav className="max-w-7xl mx-auto flex justify-between items-center p-4">
        {/* Logo */}
        <a href="/" className="text-2xl font-bold text-sciFiAccent">
          AngelSwap
        </a>

        {/* Hamburger Menu for Mobile */}
        <button
          className="md:hidden flex items-center justify-center w-10 h-10 text-sciFiAccent z-50"
          onClick={toggleMenu}
        >
          {showMenu ? (
            <span className="text-2xl font-bold">&#10005;</span>
          ) : (
            <span className="text-2xl font-bold">&#9776;</span>
          )}
        </button>

        {/* Navigation Links */}
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

        {/* Wallet Connection and Security Toggle */}
        <div className="flex items-center space-x-4">
          {/* Wallet Connection Button */}
          <button
            onClick={connectWallet}
            className="flex items-center space-x-2 text-sciFiAccent hover:text-sciFiAccentHover transition-colors"
          >
            <FaWallet className="text-xl" />
            {walletAddress && (
              <span className="text-sm text-white">
                {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
              </span>
            )}
          </button>

          {/* Security Toggle with Loading State */}
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