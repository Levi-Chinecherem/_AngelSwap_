import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import OrderBook from '../components/OrderBook';
import {
  swapTokens,
  fetchTokenBalances,
  fetchAllTokens,
  getAmountOut,
  fetchPoolDetails,
  revealTransaction
} from '../store/slices/liquidityPoolSlice';
import { placeOrder, fetchOrders } from '../store/slices/orderBookSlice'; // Import from orderBookSlice
import { ethers } from 'ethers';

const Swap = () => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState('market');
  const [slippage, setSlippage] = useState(0.5); // Default 0.5% slippage
  
  // Redux state
  const {
    tokens,
    token1Balance,
    token2Balance,
    poolDetails,
    loading,
    error,
    transactions,
    securityEnabled
  } = useSelector((state) => state.liquidityPool);

  const { orders } = useSelector((state) => state.orderBook); // Access orders from orderBookSlice

  // Market order state
  const [marketFromAmount, setMarketFromAmount] = useState('');
  const [marketToAmount, setMarketToAmount] = useState('');
  const [marketFromToken, setMarketFromToken] = useState('');
  const [marketToToken, setMarketToToken] = useState('');

  // Limit order state
  const [limitFromAmount, setLimitFromAmount] = useState('');
  const [limitToAmount, setLimitToAmount] = useState('');
  const [limitFromToken, setLimitFromToken] = useState('');
  const [limitToToken, setLimitToToken] = useState('');
  const [limitPrice, setLimitPrice] = useState('');
  const [maxAmount, setMaxAmount] = useState(false);

  useEffect(() => {
    // Initialize with available tokens and balances
    const fetchInitialData = async () => {
      await dispatch(fetchAllTokens());
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const address = await signer.getAddress();
        dispatch(fetchTokenBalances(address));
        dispatch(fetchPoolDetails(address));
        dispatch(fetchOrders(address)); // Fetch orders from orderBookSlice
      }
    };
    fetchInitialData();
  }, [dispatch]);

  useEffect(() => {
    // Set initial tokens once available
    if (tokens && tokens.length >= 2) {
      setMarketFromToken(tokens[0]);
      setMarketToToken(tokens[1]);
      setLimitFromToken(tokens[0]);
      setLimitToToken(tokens[1]);
    }
  }, [tokens]);

  // Calculate minimum amount out based on slippage
  const calculateMinAmountOut = (amount) => {
    if (!amount) return '0';
    const amountBN = ethers.BigNumber.from(amount);
    const slippageBN = ethers.BigNumber.from(1000 - (slippage * 10));
    return amountBN.mul(slippageBN).div(1000).toString();
  };

  // Handle market order amount changes
  const handleMarketFromAmountChange = async (value) => {
    setMarketFromAmount(value);
    if (value && marketFromToken && marketToToken) {
      try {
        const amountIn = ethers.utils.parseEther(value);
        const result = await dispatch(getAmountOut({
          amountIn: amountIn.toString(),
          reserveIn: poolDetails.token1PerToken2,
          reserveOut: poolDetails.token2PerToken1
        })).unwrap();
        setMarketToAmount(ethers.utils.formatEther(result));
      } catch (error) {
        console.error('Error calculating amount out:', error);
      }
    } else {
      setMarketToAmount('');
    }
  };

  // Handle market swap
  const handleMarketSwap = async () => {
    if (!marketFromAmount || !marketFromToken || !marketToToken) return;

    try {
      const amountIn = ethers.utils.parseEther(marketFromAmount);
      const minAmountOut = calculateMinAmountOut(ethers.utils.parseEther(marketToAmount));

      await dispatch(swapTokens({
        fromToken: marketFromToken,
        amountIn: amountIn.toString(),
        minAmountOut
      })).unwrap();

      // Reset form and refresh balances
      setMarketFromAmount('');
      setMarketToAmount('');
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const address = await signer.getAddress();
        dispatch(fetchTokenBalances(address));
        dispatch(fetchPoolDetails(address));
      }
    } catch (error) {
      console.error('Market swap failed:', error);
    }
  };

  // Handle limit order submission
  const handleLimitOrder = async () => {
    if (!limitFromAmount || !limitPrice || !limitFromToken || !limitToToken) return;

    try {
      const amountIn = ethers.utils.parseEther(limitFromAmount);
      const limitPriceWei = ethers.utils.parseEther(limitPrice);

      await dispatch(placeOrder({
        token: limitFromToken,
        amount: amountIn.toString(),
        price: limitPriceWei.toString(),
        isBuyOrder: true // or false, depending on your logic
      })).unwrap();

      // Reset form
      setLimitFromAmount('');
      setLimitToAmount('');
      setLimitPrice('');
      setMaxAmount(false);

      // Refresh balances and orders
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const address = await signer.getAddress();
        dispatch(fetchTokenBalances(address));
        dispatch(fetchPoolDetails(address));
        dispatch(fetchOrders(address)); // Fetch updated orders
      }
    } catch (error) {
      console.error('Limit order failed:', error);
    }
  };

  const switchMarketTokens = () => {
    setMarketFromToken(marketToToken);
    setMarketToToken(marketFromToken);
    setMarketFromAmount(marketToAmount);
    setMarketToAmount(marketFromAmount);
  };

  const switchLimitTokens = () => {
    setLimitFromToken(limitToToken);
    setLimitToToken(limitFromToken);
    setLimitFromAmount(limitToAmount);
    setLimitToAmount(limitFromAmount);
  };

  const getBalance = (token) => {
    if (token === tokens[0]) return token1Balance;
    if (token === tokens[1]) return token2Balance;
    return '0';
  };

  const getFormattedBalance = (token) => {
    const balance = getBalance(token);
    return ethers.utils.formatEther(balance || '0');
  };

  const handleMaxAmount = (tokenBalance) => {
    setMaxAmount(true);
    setLimitFromAmount(ethers.utils.formatEther(tokenBalance));
  };

  return (
    <>
      <div className="container mx-auto px-4 py-8 pt-20">
        <div className="flex justify-center">
          <div className="w-full max-w-lg bg-card shadow-2xl p-6">
            {/* Tab Buttons */}
            <div className="flex justify-between mb-4">
              <button
                className={`btn-glow nav-button py-2 px-4 rounded-lg font-semibold text-lg tab-secondary ${
                  activeTab === 'market' ? 'tab-active' : ''
                }`}
                onClick={() => setActiveTab('market')}
              >
                Market
              </button>
              <button
                className={`btn-glow nav-button py-2 px-4 rounded-lg font-semibold text-lg tab-secondary ${
                  activeTab === 'limit' ? 'tab-active' : ''
                }`}
                onClick={() => setActiveTab('limit')}
              >
                Limit
              </button>
            </div>

            {/* Market Tab Content */}
            {activeTab === 'market' && (
              <div id="marketContent">
                {/* From Section */}
                <div className="flex flex-col mb-4">
                  <div className="flex items-center mb-3">
                    <label className="text-white font-semibold text-lg">From</label>
                    <span className="text-white ml-2">
                      Balance: {getFormattedBalance(marketFromToken)} {marketFromToken && ethers.utils.getAddress(marketFromToken).slice(0, 6)}
                    </span>
                  </div>
                  <div className="flex items-center mb-4">
                    <input
                      type="number"
                      className="input-glow bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 w-full"
                      value={marketFromAmount}
                      onChange={(e) => handleMarketFromAmountChange(e.target.value)}
                      placeholder="0.0"
                    />
                    <select
                      className="input-glow bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 w-24 ml-2"
                      value={marketFromToken}
                      onChange={(e) => setMarketFromToken(e.target.value)}
                    >
                      {tokens.map((token) => (
                        <option key={token} value={token}>
                          {ethers.utils.getAddress(token).slice(0, 6)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Switch Button */}
                <div className="flex justify-center items-center mb-4">
                  <button className="arrow-btn text-white" onClick={switchMarketTokens}>
                    ⇅
                  </button>
                </div>

                {/* To Section */}
                <div className="flex flex-col mb-4">
                  <div className="flex items-center mb-3">
                    <label className="text-white font-semibold text-lg">To</label>
                    <span className="text-white ml-2">
                      Balance: {getFormattedBalance(marketToToken)} {marketToToken && ethers.utils.getAddress(marketToToken).slice(0, 6)}
                    </span>
                  </div>
                  <div className="flex items-center mb-4">
                    <input
                      type="number"
                      className="input-glow bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 w-full"
                      value={marketToAmount}
                      placeholder="0.0"
                      readOnly
                    />
                    <select
                      className="input-glow bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 w-24 ml-2"
                      value={marketToToken}
                      onChange={(e) => setMarketToToken(e.target.value)}
                    >
                      {tokens.map((token) => (
                        <option key={token} value={token}>
                          {ethers.utils.getAddress(token).slice(0, 6)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Slippage Control */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-white">Slippage Tolerance</span>
                  <input
                    type="number"
                    className="input-glow bg-gray-800 text-white border border-gray-700 rounded-lg px-2 py-1 w-20"
                    value={slippage}
                    onChange={(e) => setSlippage(parseFloat(e.target.value))}
                    min="0.1"
                    max="5"
                    step="0.1"
                  />
                  <span className="text-white">%</span>
                </div>

                {/* Swap Button */}
                <button
                  className="btn-glow nav-button py-3 px-6 rounded-lg w-full"
                  onClick={handleMarketSwap}
                  disabled={!marketFromAmount || loading}
                >
                  {loading ? 'Processing...' : marketFromAmount ? 'Swap' : 'Enter an amount'}
                </button>
              </div>
            )}

            {/* Limit Tab Content */}
            {activeTab === 'limit' && (
              <div id="limitContent">
                {/* Limit Order Header */}
                <div className="flex justify-between mb-4">
                  <p className="text-white font-semibold text-lg">Limit Order</p>
                </div>

                {/* From Section */}
                <div className="flex flex-col mb-4">
                  <div className="flex items-center mb-3">
                    <label className="text-white font-semibold text-lg">From</label>
                    <span className="text-white ml-2">
                      Balance: {getFormattedBalance(limitFromToken)} {limitFromToken && ethers.utils.getAddress(limitFromToken).slice(0, 6)}
                    </span>
                    <div className="flex items-center ml-2">
                      <input
                        type="checkbox"
                        className="mr-2 text-cyan-500"
                        checked={maxAmount}
                        onChange={() => handleMaxAmount(getBalance(limitFromToken))}
                      />
                      <span className="text-white text-sm">MAX</span>
                    </div>
                  </div>
                  <div className="flex items-center mb-4">
                    <input
                      type="number"
                      className="input-glow bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 w-full"
                      value={limitFromAmount}
                      onChange={(e) => setLimitFromAmount(e.target.value)}
                      placeholder="0.0"
                    />
                    <select
                      className="input-glow bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 w-24 ml-2"
                      value={limitFromToken}
                      onChange={(e) => setLimitFromToken(e.target.value)}
                    >
                      {tokens.map((token) => (
                        <option key={token} value={token}>
                          {ethers.utils.getAddress(token).slice(0, 6)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Switch Button */}
                <div className="flex justify-center items-center mb-4">
                  <button className="arrow-btn text-white" onClick={switchLimitTokens}>
                    ⇅
                  </button>
                </div>

                {/* To Section */}
                <div className="flex flex-col mb-4">
                  <div className="flex items-center mb-3">
                    <label className="text-white font-semibold text-lg">To</label>
                    <span className="text-white ml-2">
                      Balance: {getFormattedBalance(limitToToken)} {limitToToken && ethers.utils.getAddress(limitToToken).slice(0, 6)}
                    </span>
                  </div>
                  <div className="flex items-center mb-4">
                    <input
                      type="number"
                      className="input-glow bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 w-full"
                      value={limitToAmount}
                      onChange={(e) => setLimitToAmount(e.target.value)}
                      placeholder="0.0"
                    />
                    <select
                      className="input-glow bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 w-24 ml-2"
                      value={limitToToken}
                      onChange={(e) => setLimitToToken(e.target.value)}
                    >
                      {tokens.map((token) => (
                        <option key={token} value={token}>
                          {ethers.utils.getAddress(token).slice(0, 6)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Limit Price Section */}
                <div className="flex flex-col mb-4">
                  <div className="flex items-center mb-3">
                    <label className="text-white font-semibold text-lg">Limit Price</label>
                  </div>
                  <div className="flex items-center mb-4">
                    <input
                      type="number"
                      className="input-glow bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 w-full"
                      value={limitPrice}
                      onChange={(e) => setLimitPrice(e.target.value)}
                      placeholder="0.0"
                    />
                  </div>
                </div>

                {/* Above Market Section */}
                <div className="flex flex-col mb-4">
                  <div className="flex items-center mb-3">
                    <label className="text-white font-semibold text-lg">Above Market</label>
                    <span className="text-white ml-2">
                      {poolDetails.token1PerToken2 ? 
                        `${((Number(limitPrice) / Number(poolDetails.token1PerToken2)) - 1 * 100).toFixed(2)}%` 
                        : '0.0%'}
                    </span>
                  </div>
                </div>

                {/* Slippage Control */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-white">Slippage Tolerance</span>
                  <input
                    type="number"
                    className="input-glow bg-gray-800 text-white border border-gray-700 rounded-lg px-2 py-1 w-20"
                    value={slippage}
                    onChange={(e) => setSlippage(parseFloat(e.target.value))}
                    min="0.1"
                    max="5"
                    step="0.1"
                  />
                  <span className="text-white">%</span>
                </div>

                {/* Place Order Button */}
                <button
                  className="btn-glow nav-button py-3 px-6 rounded-lg w-full"
                  onClick={handleLimitOrder}
                  disabled={!limitFromAmount || !limitPrice || loading}
                >
                  Place Limit Order
                </button>

                {/* Limit Orders Section */}
                <div className="mt-6">
                  <h3 className="text-white font-semibold text-lg mb-3">Your Limit Orders</h3>
                  <div className="space-y-2">
                    {orders.map((order) => (
                      <div key={order.orderId} className="flex items-center justify-between bg-gray-800 p-2 rounded">
                        <span className="text-white">
                          {order.amount} {ethers.utils.getAddress(order.token).slice(0, 6)} @ {order.price}
                        </span>
                        <span className="text-white">{order.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="mt-4 text-red-500 text-sm">{error}</div>
            )}

            {/* Transaction History Section */}
            {securityEnabled && transactions.length > 0 && (
              <div className="mt-6">
                <h3 className="text-white font-semibold text-lg mb-3">Pending Transactions</h3>
                <div className="space-y-2">
                  {transactions.map((txHash) => (
                    <div key={txHash} className="flex items-center justify-between bg-gray-800 p-2 rounded">
                      <span className="text-white">{txHash.slice(0, 10)}...</span>
                      <button
                        className="btn-glow nav-button py-1 px-3 rounded text-sm"
                        onClick={() => dispatch(revealTransaction(txHash))}
                      >
                        Reveal
                      </button>
                    </div>
                  ))}
                </div>
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
