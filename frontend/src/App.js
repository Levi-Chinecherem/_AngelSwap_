// App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Swap from "./pages/Swap";
import Liquidity from "./pages/Liquidity";
import History from "./pages/History";
import Mempool from "./pages/Mempool";
import AdminPage from "./pages/AdminPage";
import About from "./pages/About";

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <NavBar />
        <div className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/swap" element={<Swap />} />
            <Route path="/liquidity" element={<Liquidity />} />
            <Route path="/history" element={<History />} />
            <Route path="/mempool" element={<Mempool />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
}

export default App;