import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Liquidity from "./pages/Liquidity";
import Swap from "./pages/Swap";
import Mempool from "./pages/Mempool";
import History from "./pages/History";
import About from "./pages/About";

function App() {
  return (
    <Router>
      <div className="app bg-sciFiBg text-sciFiText font-sans">
        <NavBar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/liquidity" element={<Liquidity />} />
          <Route path="/swap" element={<Swap />} />
          <Route path="/mempool" element={<Mempool />} />
          <Route path="/history" element={<History />} />
          <Route path="/about" element={<About />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
