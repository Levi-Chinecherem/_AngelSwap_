import React, { useState, useEffect } from 'react';

export default function Liquidity() {
  const [activeTab, setActiveTab] = useState('addLiquidity');
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [fromCurrency, setFromCurrency] = useState('FTM');
  const [toCurrency, setToCurrency] = useState('TOMB');
  const [poolDetails, setPoolDetails] = useState({
    avaxPerFtm: '0.157275',
    ftmPerAvax: '6.35827',
    poolShare: '0.21%'
  });

  const [liquidityItems] = useState([
    {
      id: 1,
      pair: 'FTM/TOMB',
      initialInvestment: '100 FTM',
      poolShare: '5%',
      interestEarned: '10 FTM',
      total: 110
    },
    {
      id: 2,
      pair: 'ETH/DAI',
      initialInvestment: '450 ETH',
      poolShare: '5%',
      interestEarned: '50 ETH',
      total: 500
    }
  ]);

  const [removeLiquidityAmounts, setRemoveLiquidityAmounts] = useState({});

  useEffect(() => {
    updateLiquidity();
  }, [fromAmount, toAmount]);

  const updateLiquidity = () => {
    const fromAmountValue = parseFloat(fromAmount) || 0;
    const toAmountValue = parseFloat(toAmount) || 0;

    const avaxRate = fromAmountValue * 0.157275;
    const ftmRate = toAmountValue * 6.35827;
    const share = ((fromAmountValue + toAmountValue) / 100).toFixed(2);

    setPoolDetails({
      avaxPerFtm: avaxRate.toFixed(6),
      ftmPerAvax: ftmRate.toFixed(6),
      poolShare: `${share}%`
    });
  };

  const handleSubmitLiquidity = () => {
    const fromAmountValue = parseFloat(fromAmount) || 0;
    const toAmountValue = parseFloat(toAmount) || 0;

    if (fromAmountValue > 0 && toAmountValue > 0) {
      alert(`Liquidity added successfully!\nFrom: ${fromAmountValue} ${fromCurrency}\nTo: ${toAmountValue} ${toCurrency}`);
    } else {
      alert('Please enter valid amounts for both inputs.');
    }
  };

  const updateInputAmount = (percentage, liquidityId) => {
    const totalAmount = liquidityItems.find(item => item.id === liquidityId)?.total || 0;
    const amountToFill = (percentage / 100) * totalAmount;
    setRemoveLiquidityAmounts(prev => ({
      ...prev,
      [liquidityId]: amountToFill.toFixed(2)
    }));
  };

  return (
    <div className="bg-sciFiBg text-sciFiText font-sans">
      <div className="container mx-auto px-4 py-8 pt-20">
        <div className="flex justify-center">
          <div className="w-full max-w-lg bg-card shadow-2xl p-6">
            <div className="flex justify-between mb-4">
              <button
                className={`btn-glow nav-button py-2 px-6 rounded-lg font-bold text-lg ${activeTab === 'addLiquidity' ? 'tab-active' : ''}`}
                onClick={() => setActiveTab('addLiquidity')}
              >
                A_d_d
              </button>
              <button
                className={`btn-glow nav-button py-2 px-6 rounded-lg font-bold text-lg ${activeTab === 'removeLiquidity' ? 'tab-active' : ''}`}
                onClick={() => setActiveTab('removeLiquidity')}
              >
                Remove
              </button>
            </div>

            {activeTab === 'addLiquidity' && (
              <div>
                <p className="text-white font-semibold text-lg mb-4">Add Liquidity</p>

                <div className="flex flex-col mb-4">
                  <div className="flex items-center mb-3">
                    <label className="text-white font-semibold text-lg">From</label>
                    <span className="text-white ml-2">Balance: 0 FTM</span>
                  </div>
                  <div className="flex items-center mb-4">
                    <input
                      type="number"
                      className="input-glow bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 w-full"
                      placeholder="0.0"
                      value={fromAmount}
                      onChange={(e) => setFromAmount(e.target.value)}
                    />
                    <select
                      className="input-glow bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 w-24 ml-2"
                      value={fromCurrency}
                      onChange={(e) => setFromCurrency(e.target.value)}
                    >
                      <option value="FTM">FTM</option>
                      <option value="TOMB">TOMB</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-center items-center mb-4">
                  <span className="text-2xl text-white font-bold">+</span>
                </div>

                <div className="flex flex-col mb-4">
                  <div className="flex items-center mb-3">
                    <label className="text-white font-semibold text-lg">To</label>
                    <span className="text-white ml-2">Balance: 0 TOMB</span>
                  </div>
                  <div className="flex items-center mb-4">
                    <input
                      type="number"
                      className="input-glow bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 w-full"
                      placeholder="0.0"
                      value={toAmount}
                      onChange={(e) => setToAmount(e.target.value)}
                    />
                    <select
                      className="input-glow bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 w-24 ml-2"
                      value={toCurrency}
                      onChange={(e) => setToCurrency(e.target.value)}
                    >
                      <option value="FTM">FTM</option>
                      <option value="TOMB">TOMB</option>
                    </select>
                  </div>
                </div>

                {(parseFloat(fromAmount) > 0 && parseFloat(toAmount) > 0) && (
                  <div id="poolDetails">
                    <h3 className="text-cyan-500 font-bold text-lg mb-2 border-b border-cyan-500 pb-1">Prices and Pool Share</h3>
                    <div className="bg-card p-4 rounded-lg shadow-lg mb-4">
                      <p className="text-white text-sm flex items-center justify-between">
                        <span>AVAX per FTM:</span>
                        <span className="text-cyan-500 font-semibold">{poolDetails.avaxPerFtm}</span>
                      </p>
                      <p className="text-white text-sm flex items-center justify-between">
                        <span>FTM per AVAX:</span>
                        <span className="text-cyan-500 font-semibold">{poolDetails.ftmPerAvax}</span>
                      </p>
                      <p className="text-white text-sm flex items-center justify-between">
                        <span>Share of Pool:</span>
                        <span className="text-cyan-500 font-semibold">{poolDetails.poolShare}</span>
                      </p>
                    </div>
                  </div>
                )}
                <button
                  className="btn-glow nav-button py-3 px-6 rounded-lg w-full"
                  onClick={handleSubmitLiquidity}
                >
                  Add Liquidity
                </button>
              </div>
            )}

            {activeTab === 'removeLiquidity' && (
              <div>
                <p className="text-white font-semibold text-lg mb-4">Remove Liquidity</p>
                <div id="liquidityList">
                  {liquidityItems.map((item) => (
                    <div key={item.id} className="liquidity-item bg-card p-4 rounded-lg mb-4">
                      <h3 className="text-cyan-500 font-bold mb-2">Liquidity Pair: {item.pair}</h3>
                      <p className="text-white text-sm">Initial Investment: {item.initialInvestment}</p>
                      <p className="text-white text-sm">Pool Share: {item.poolShare}</p>
                      <p className="text-white text-sm">Interest Earned: {item.interestEarned}</p>
                      <p className="text-white text-sm">Total: {item.total} {item.pair.split('/')[0]}</p>
                      <div className="mt-4">
                        <p className="text-white text-sm mb-2">Amount to Remove:</p>
                        <div className="flex items-center mb-2">
                          <input
                            type="number"
                            placeholder="Enter amount"
                            className="input-glow bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-2 w-full"
                            value={removeLiquidityAmounts[item.id] || ''}
                            onChange={(e) => setRemoveLiquidityAmounts(prev => ({...prev, [item.id]: e.target.value}))}
                          />
                        </div>
                        <div className="flex space-x-4 mb-4">
                          {[25, 50, 75, 100].map((percentage) => (
                            <button
                              key={percentage}
                              className="bg-cyan-500 text-white px-4 py-2 rounded-lg"
                              onClick={() => updateInputAmount(percentage, item.id)}
                            >
                              {percentage}%
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  className="btn-glow nav-button py-3 px-6 rounded-lg w-full"
                >
                  Remove Liquidity
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
