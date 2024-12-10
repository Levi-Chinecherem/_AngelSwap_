import React, { useState } from "react";

const NavBar = () => {
  const [securityEnabled, setSecurityEnabled] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const toggleSecurity = () => {
    setSecurityEnabled((prevState) => !prevState);
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
            <span className="text-2xl font-bold">&#10005;</span> // Close Icon
          ) : (
            <span className="text-2xl font-bold">&#9776;</span> // Hamburger Icon
          )}
        </button>

        {/* Navigation Links */}
        <ul
          className={`fixed top-0 left-0 w-full h-screen bg-sciFiBg flex flex-col justify-center items-center space-y-6 text-lg font-semibold transition-transform transform ${
            showMenu ? "translate-x-0" : "-translate-x-full"
          } md:static md:flex md:flex-row md:space-y-0 md:space-x-6 md:h-auto md:w-auto md:translate-x-0 z-40`} // Added z-index to ensure it doesn't cover the toggler
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
            <div className="flex items-center space-x-2">
              <span className="text-sm text-white">Security:</span>
              <div
                className={`relative flex items-center cursor-pointer w-10 h-6 ${
                  securityEnabled ? "bg-green-900" : "bg-gray-600"
                } rounded-full p-1`}
                onClick={toggleSecurity}
              >
                <div
                  className={`bg-sciFiAccent w-4 h-4 rounded-full transition-transform ${
                    securityEnabled ? "translate-x-4" : "translate-x-0"
                  }`}
                ></div>
                <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-white">
                  {securityEnabled ? "ON" : "OFF"}
                </span>
              </div>
            </div>
      </nav>
    </header>
  );
};

export default NavBar;