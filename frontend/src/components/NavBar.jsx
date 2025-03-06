import React, { useState, useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ethers } from "ethers";
import {
  setWalletAddress,
  setIsConnecting,
  setWalletError,
  resetWallet,
} from "../store/slices/walletSlice";
import { toggleGlobalSecurity, setSecurityEnabled } from "../store/slices/securitySlice"; // Added setSecurityEnabled
import { FaWallet, FaLock, FaUnlock } from "react-icons/fa";
import { toast } from "../components/ui/use-toast";
import LiquidityPoolABI from "../contracts/LiquidityPool.sol/LiquidityPool.json";
import { LIQUIDITY_POOL_ADDRESS } from "../contracts/addresses";

const NavBar = () => {
  const dispatch = useDispatch();
  const [showMenu, setShowMenu] = useState(false);
  const { securityEnabled, loading, error: securityError } = useSelector((state) => state.security);
  const { address: walletAddress, isConnecting } = useSelector((state) => state.wallet);

  // Wallet connection logic
  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      toast({ title: "Error", description: "MetaMask not detected", variant: "destructive" });
      dispatch(setWalletError("MetaMask not detected"));
      return;
    }
    try {
      dispatch(setIsConnecting(true));
      const provider = new ethers.BrowserProvider(window.ethereum);
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      dispatch(setWalletAddress(address));
      toast({ title: "Connected", description: `Wallet: ${address.slice(0, 6)}...${address.slice(-4)}` });
    } catch (error) {
      console.error("Wallet connection error:", error);
      toast({ title: "Connection Failed", description: error.message, variant: "destructive" });
      dispatch(setWalletError(error.message));
      dispatch(resetWallet());
    } finally {
      dispatch(setIsConnecting(false));
    }
  }, [dispatch]);

  // Check wallet and security state on mount
  useEffect(() => {
    if (!window.ethereum) return;

    const checkConnectionAndSecurity = async () => {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        const accounts = await window.ethereum.request({ method: "eth_accounts" });

        if (accounts.length > 0) {
          dispatch(setWalletAddress(address));

          // Check blockchain security state
          const liquidityPool = new ethers.Contract(LIQUIDITY_POOL_ADDRESS, LiquidityPoolABI.abi, provider);
          const isSecurityEnabled = await liquidityPool.securityToggled(address);
          console.log("Blockchain security state for", address, ":", isSecurityEnabled);
          dispatch(setSecurityEnabled(isSecurityEnabled)); // Sync Redux with blockchain
        }
      } catch (error) {
        console.error("Error checking connection or security:", error);
      }
    };

    checkConnectionAndSecurity();

    window.ethereum.on("accountsChanged", (accounts) => {
      if (accounts.length === 0) dispatch(resetWallet());
      else connectWallet();
    });
    window.ethereum.on("chainChanged", () => window.location.reload());

    return () => {
      window.ethereum.removeListener("accountsChanged", () => {});
      window.ethereum.removeListener("chainChanged", () => {});
    };
  }, [dispatch, connectWallet]);

  // Security toggle handler
  const handleToggleSecurity = async () => {
    if (!walletAddress) {
      toast({ title: "Error", description: "Please connect your wallet first", variant: "destructive" });
      return;
    }
    try {
      console.log("Toggling security to:", !securityEnabled);
      const result = await dispatch(toggleGlobalSecurity(!securityEnabled)).unwrap();
      console.log("Toggle result:", result);
      toast({
        title: "Security Updated",
        description: `Security is now ${result ? "enabled" : "disabled"}`,
      });
    } catch (error) {
      console.error("Security toggle error:", error);
      toast({ title: "Toggle Failed", description: error.message || "Could not toggle security", variant: "destructive" });
    }
  };

  // Debug security state changes
  useEffect(() => {
    console.log("Security state:", { securityEnabled, loading, securityError });
  }, [securityEnabled, loading, securityError]);

  return (
    <header className="fixed top-0 w-full z-50 bg-sciFiBg shadow-lg">
      <nav className="max-w-7xl mx-auto flex justify-between items-center p-4">
        <a href="/" className="text-2xl font-bold text-sciFiAccent">AngelSwap</a>
        <button onClick={() => setShowMenu(!showMenu)} className="md:hidden text-sciFiAccent text-2xl">
          {showMenu ? "✕" : "☰"}
        </button>
        <ul
          className={`fixed top-0 left-0 w-full h-screen bg-sciFiBg flex flex-col justify-center items-center space-y-6 text-lg font-semibold transition-transform transform ${
            showMenu ? "translate-x-0" : "-translate-x-full"
          } md:static md:flex md:flex-row md:space-y-0 md:space-x-6 md:h-auto md:w-auto md:translate-x-0`}
        >
          {[ "Swap", "Liquidity", "Mempool", "History", "About"].map((item) => (
            <li key={item}>
              <a href={`/${item.toLowerCase()}`} className="hover:text-sciFiAccent text-white" onClick={() => setShowMenu(false)}>
                {item}
              </a>
            </li>
          ))}
        </ul>
        <div className="flex items-center space-x-4">
          <button
            onClick={connectWallet}
            disabled={isConnecting}
            className="flex items-center space-x-2 text-sciFiAccent hover:text-sciFiAccentHover"
          >
            <FaWallet className="text-xl" />
            <span className="text-sm text-white">
              {isConnecting ? "Connecting..." : walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : "Connect Wallet"}
            </span>
          </button>
          <button
            onClick={handleToggleSecurity}
            disabled={loading}
            className={`flex items-center space-x-2 ${securityEnabled ? "text-red-500" : "text-green-500"} ${
              loading ? "opacity-50 cursor-not-allowed" : "hover:text-opacity-80"
            }`}
          >
            {securityEnabled ? <FaLock className="text-xl" /> : <FaUnlock className="text-xl" />}
            <span className="text-sm">{loading ? "Toggling..." : securityEnabled ? "Secure" : "Open"}</span>
          </button>
        </div>
      </nav>
    </header>
  );
};

export default NavBar;