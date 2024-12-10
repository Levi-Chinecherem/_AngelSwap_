import React, { useState } from 'react';
import OrderBook from '../components/OrderBook';

const Swap = () => {
  const [activeTab, setActiveTab] = useState('market');
  const [marketFromAmount, setMarketFromAmount] = useState('');
  const [marketToAmount, setMarketToAmount] = useState('');
  const [marketFromCurrency, setMarketFromCurrency] = useState('FTM');
  const [marketToCurrency, setMarketToCurrency] = useState('TOMB');
  const [limitFromAmount, setLimitFromAmount] = useState('');
  const [limitToAmount, setLimitToAmount] = useState('');
  const [limitFromCurrency, setLimitFromCurrency] = useState('FTM');
  const [limitToCurrency, setLimitToCurrency] = useState('TOMB');

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
  };

  const swapMarketAmounts = () => {
    setMarketFromAmount(marketToAmount);
    setMarketToAmount(marketFromAmount);
    setMarketFromCurrency(marketToCurrency);
    setMarketToCurrency(marketFromCurrency);
  };

  const swapLimitAmounts = () => {
    setLimitFromAmount(limitToAmount);
    setLimitToAmount(limitFromAmount);
    setLimitFromCurrency(limitToCurrency);
    setLimitToCurrency(limitFromCurrency);
  };

  const handleSubmitMarket = () => {
    // Logic for submitting market swap (if applicable)
    console.log('Market Swap Submitted');
  };

  const handleSubmitLimit = () => {
    // Logic for submitting limit swap (if applicable)
    console.log('Limit Swap Submitted');
  };

  return (
    <>
    <div className="container mx-auto px-4 py-8 pt-20">
      <div className="flex justify-center">
        <div className="w-full max-w-lg bg-card shadow-2xl p-6">
          <div className="flex justify-between mb-4">
            <button
              className={`btn-glow nav-button py-2 px-4 rounded-lg font-semibold text-lg tab-secondary ${activeTab === 'market' ? 'tab-active' : ''}`}
              onClick={() => handleTabSwitch('market')}
            >
              Market
            </button>
            <button
              className={`btn-glow nav-button py-2 px-4 rounded-lg font-semibold text-lg tab-secondary ${activeTab === 'limit' ? 'tab-active' : ''}`}
              onClick={() => handleTabSwitch('limit')}
            >
              Limit
            </button>
          </div>

          {activeTab === 'market' && (
            <div id="marketContent">
              <div className="flex flex-col mb-4">
                <div className="flex items-center mb-3">
                  <label className="text-white font-semibold text-lg">From</label>
                  <span className="text-white ml-2">Balance: 26.7667 FTM</span>
                </div>
                <div className="flex items-center mb-4">
                  <input
                    type="number"
                    id="marketFromAmount"
                    className="input-glow bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 w-full"
                    value={marketFromAmount}
                    onChange={(e) => setMarketFromAmount(e.target.value)}
                    placeholder="0.0"
                  />
                  <select
                    className="input-glow bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 w-24 ml-2"
                    value={marketFromCurrency}
                    onChange={(e) => setMarketFromCurrency(e.target.value)}
                  >
                    <option value="FTM">FTM</option>
                    <option value="TOMB">TOMB</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-center items-center mb-4">
                <button className="arrow-btn text-white" onClick={swapMarketAmounts}>
                  ⇅
                </button>
              </div>

              <div className="flex flex-col mb-4">
                <div className="flex items-center mb-3">
                  <label className="text-white font-semibold text-lg">To</label>
                  <span className="text-white ml-2">Balance: 0 TOMB</span>
                </div>
                <div className="flex items-center mb-4">
                  <input
                    type="number"
                    id="marketToAmount"
                    className="input-glow bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 w-full"
                    value={marketToAmount}
                    onChange={(e) => setMarketToAmount(e.target.value)}
                    placeholder="0.0"
                  />
                  <select
                    className="input-glow bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 w-24 ml-2"
                    value={marketToCurrency}
                    onChange={(e) => setMarketToCurrency(e.target.value)}
                  >
                    <option value="FTM">FTM</option>
                    <option value="TOMB">TOMB</option>
                  </select>
                </div>
              </div>

              <button className="btn-glow nav-button py-3 px-6 rounded-lg w-full" onClick={handleSubmitMarket}>
                Enter an amount
              </button>
            </div>
          )}

          {activeTab === 'limit' && (
            <div id="limitContent">
                <div className="flex justify-between mb-4">
                    <p className="text-white font-semibold text-lg">Limit Order</p>
                </div>

                <div className="flex flex-col mb-4">
                    <div className="flex items-center mb-3">
                        <label className="text-white font-semibold text-lg">From</label>
                        <span className="text-white ml-2">Balance: 26.7667 FTM</span>
                        <div className="flex items-center ml-2">
                            <input type="checkbox" className="mr-2 text-cyan-500" />
                            <span className="text-white text-sm">50%</span>
                            <button className="btn-glow nav-button py-1 px-3 rounded ml-2">MAX</button>
                        </div>
                    </div>
                    <div className="flex items-center mb-4">
                        <input type="number" id="limitFromAmount" className="input-glow bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 w-full" placeholder="0.0" />
                        <select className="input-glow bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 w-24 ml-2">
                            <option value="FTM">FTM</option>
                            <option value="TOMB">TOMB</option>
                        </select>
                    </div>
                </div>

                <div className="flex flex-col mb-4">
                    <div className="flex items-center mb-3">
                        <label className="text-white font-semibold text-lg">To</label>
                        <span className="text-white ml-2">Balance: 0 TOMB</span>
                    </div>
                    <div className="flex items-center mb-4">
                        <input type="number" id="limitToAmount" className="input-glow bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 w-full" placeholder="0.0" />
                        <select className="input-glow bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 w-24 ml-2">
                            <option value="FTM">FTM</option>
                            <option value="TOMB">TOMB</option>
                        </select>
                    </div>
                </div>

                <div className="flex flex-col mb-4">
                    <div className="flex items-center mb-3">
                        <label className="text-white font-semibold text-lg">Limit Price</label>
                    </div>
                    <div className="flex items-center mb-4">
                        <input type="number" id="limitPrice" className="input-glow bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 w-full" placeholder="0.0" />
                    </div>
                </div>

                <div className="flex flex-col mb-4">
                    <div className="flex items-center mb-3">
                        <label className="text-white font-semibold text-lg">Above Market</label>
                        <span className="text-white ml-2">0.0</span>
                    </div>
                </div>

                <button className="btn-glow nav-button py-3 px-6 rounded-lg w-full">Place Limit Order</button>
            </div>
          )}
        </div>
      </div>
    </div>
    <OrderBook />
    </>
  );
};

export default Swap;
