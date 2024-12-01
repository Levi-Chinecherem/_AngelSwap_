import React from "react";
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";
import Home from "./pages/Home";

function App() {
  return (
    <div className="app bg-sciFiBg text-sciFiText font-sans">
      <NavBar />
      <Home />
    
      <Footer />
    </div>
  );
}

export default App;
