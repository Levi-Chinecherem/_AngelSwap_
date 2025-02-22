import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ethers } from "ethers";
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Swap from "./pages/Swap";
import Liquidity from "./pages/Liquidity";
import Trade from "./pages/Trade";
import History from "./pages/History";
import Mempool from "./pages/Mempool";
import AdminPage from "./pages/AdminPage";
import { setWalletAddress, setProvider, setSigner } from "./store/slices/walletSlice";

function App() {
  const dispatch = useDispatch();
  const walletAddress = useSelector((state) => state.wallet.address);

  // Connect wallet on page load
  useEffect(() => {
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

    connectWallet();
  }, [dispatch]);

  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <NavBar />
        <div className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/swap" element={<Swap />} />
            <Route path="/liquidity" element={<Liquidity />} />
            <Route path="/trade" element={<Trade />} />
            <Route path="/history" element={<History />} />
            <Route path="/mempool" element={<Mempool />} />
            <Route path="/admin" element={<AdminPage />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
