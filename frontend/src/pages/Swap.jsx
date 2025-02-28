import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ethers } from "ethers";
import {
  swapTokens,
  fetchAllTokens,
  fetchTokenBalances,
  fetchPoolDetails,
} from "../store/slices/liquidityPoolSlice";
import { placeOrder, fetchOrders } from "../store/slices/orderBookSlice";
import { revealGlobalTransaction } from "../store/slices/securitySlice";
import OrderBook from "../components/OrderBook";

const Swap = () => {
  const dispatch = useDispatch();
  const { address: walletAddress } = useSelector((state) => state.wallet);
  const { tokens, tokenBalances, poolDetails, loading, error } = useSelector(
    (state) => state.liquidityPool
  );
  const { securityEnabled } = useSelector((state) => state.security);
  const { orders } = useSelector((state) => state.orderBook);

  const [fromToken, setFromToken] = useState("");
  const [toToken, setToToken] = useState("");
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const [limitFromToken, setLimitFromToken] = useState("");
  const [limitToToken, setLimitToToken] = useState("");
  const [limitFromAmount, setLimitFromAmount] = useState("");
  const [limitPrice, setLimitPrice] = useState("");
  const [slippage, setSlippage] = useState(0.5);
  const [isLimitOrder, setIsLimitOrder] = useState(false);

  useEffect(() => {
    if (walletAddress) {
      dispatch(fetchAllTokens());
      dispatch(fetchTokenBalances(walletAddress));
      dispatch(fetchPoolDetails(walletAddress));
      dispatch(fetchOrders(walletAddress));
    }
  }, [dispatch, walletAddress]);

  useEffect(() => {
    if (tokens.length > 0) {
      setFromToken(tokens[0].address);
      setToToken(tokens[1]?.address || tokens[0].address);
      setLimitFromToken(tokens[0].address);
      setLimitToToken(tokens[1]?.address || tokens[0].address);
    }
  }, [tokens]);

  const getBalance = (tokenAddress) =>
    tokenBalances[tokenAddress] ? ethers.formatEther(tokenBalances[tokenAddress]) : "0";

  const getTokenSymbol = (tokenAddress) =>
    tokens.find((t) => t.address === tokenAddress)?.symbol || "UNKNOWN";

  const handleMaxAmount = (balance) => setFromAmount(balance);

  const switchTokens = () => {
    setFromToken(toToken);
    setToToken(fromToken);
    setFromAmount(toAmount);
    setToAmount(fromAmount);
  };

  const handleSwap = async () => {
    if (!fromAmount || !walletAddress) return;
    const amountIn = ethers.parseEther(fromAmount);
    const minAmountOut = ethers.parseEther(toAmount) * BigInt(100 - slippage * 10) / BigInt(1000); // Slippage adjustment
    try {
      await dispatch(
        swapTokens({
          fromToken,
          amountIn,
          minAmountOut,
        })
      ).unwrap();
      dispatch(fetchTokenBalances(walletAddress));
      dispatch(fetchPoolDetails(walletAddress));
      setFromAmount("");
      setToAmount("");
    } catch (err) {
      console.error("Swap error:", err);
    }
  };

  const handleLimitOrder = async () => {
    if (!limitFromAmount || !limitPrice || !walletAddress) return;
    const amount = ethers.parseEther(limitFromAmount);
    const price = ethers.parseEther(limitPrice);
    const isBuyOrder = limitFromToken === toToken;
    try {
      await dispatch(
        placeOrder({
          token: isBuyOrder ? limitToToken : limitFromToken,
          amount,
          price,
          isBuyOrder,
        })
      ).unwrap();
      dispatch(fetchOrders(walletAddress));
      setLimitFromAmount("");
      setLimitPrice("");
    } catch (err) {
      console.error("Limit order error:", err);
    }
  };

  const calculateToAmount = () => {
    if (!fromAmount || !poolDetails.token1PerToken2) return;
    const amountIn = ethers.parseEther(fromAmount); // BigInt
    const rate = ethers.parseEther(
      fromToken === tokens[0].address ? poolDetails.token1PerToken2 : poolDetails.token2PerToken1
    ); // Convert rate to BigInt
    const amountOut = (amountIn * rate) / ethers.parseEther("1"); // BigInt arithmetic
    setToAmount(ethers.formatEther(amountOut));
  };

  useEffect(() => {
    calculateToAmount();
  }, [fromAmount, fromToken, toToken, poolDetails]);

  return (
    <div className="pt-20 pb-16 px-4 bg-sciFiBg text-sciFiText">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-sciFiAccent">
          {isLimitOrder ? "Place Limit Order" : "Swap Tokens"}
        </h1>
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <button
            onClick={() => setIsLimitOrder(!isLimitOrder)}
            className="mb-4 text-sciFiAccent hover:text-sciFiAccentHover"
          >
            {isLimitOrder ? "Switch to Market Swap" : "Switch to Limit Order"}
          </button>

          {!isLimitOrder ? (
            <>
              <div className="flex flex-col mb-4">
                <div className="flex items-center mb-3">
                  <label className="text-white font-semibold text-lg">From</label>
                  <span className="text-white ml-2">
                    Balance: {getBalance(fromToken)} {getTokenSymbol(fromToken)}
                  </span>
                  <button
                    className="ml-2 text-sciFiAccent"
                    onClick={() => handleMaxAmount(getBalance(fromToken))}
                  >
                    MAX
                  </button>
                </div>
                <div className="flex items-center">
                  <input
                    type="number"
                    className="input-glow bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 w-full"
                    value={fromAmount}
                    onChange={(e) => setFromAmount(e.target.value)}
                    placeholder="0.0"
                  />
                  <select
                    className="input-glow bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 w-24 ml-2"
                    value={fromToken}
                    onChange={(e) => setFromToken(e.target.value)}
                  >
                    {tokens.map((token) => (
                      <option key={token.address} value={token.address}>
                        {token.symbol}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-center mb-4">
                <button className="arrow-btn text-white" onClick={switchTokens}>
                  ⇅
                </button>
              </div>

              <div className="flex flex-col mb-4">
                <div className="flex items-center mb-3">
                  <label className="text-white font-semibold text-lg">To</label>
                  <span className="text-white ml-2">
                    Balance: {getBalance(toToken)} {getTokenSymbol(toToken)}
                  </span>
                </div>
                <div className="flex items-center">
                  <input
                    type="number"
                    className="input-glow bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 w-full"
                    value={toAmount}
                    readOnly
                    placeholder="0.0"
                  />
                  <select
                    className="input-glow bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 w-24 ml-2"
                    value={toToken}
                    onChange={(e) => setToToken(e.target.value)}
                  >
                    {tokens.map((token) => (
                      <option key={token.address} value={token.address}>
                        {token.symbol}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

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

              <button
                className="btn-glow nav-button py-3 px-6 rounded-lg w-full"
                onClick={handleSwap}
                disabled={!fromAmount || loading}
              >
                {loading ? "Swapping..." : "Swap"}
              </button>
            </>
          ) : (
            <>
              <div className="flex flex-col mb-4">
                <div className="flex items-center mb-3">
                  <label className="text-white font-semibold text-lg">From</label>
                  <span className="text-white ml-2">
                    Balance: {getBalance(limitFromToken)} {getTokenSymbol(limitFromToken)}
                  </span>
                </div>
                <div className="flex items-center">
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
                      <option key={token.address} value={token.address}>
                        {token.symbol}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-col mb-4">
                <div className="flex items-center mb-3">
                  <label className="text-white font-semibold text-lg">To</label>
                  <span className="text-white ml-2">
                    Balance: {getBalance(limitToToken)} {getTokenSymbol(limitToToken)}
                  </span>
                </div>
                <div className="flex items-center">
                  <input
                    type="number"
                    className="input-glow bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 w-full"
                    readOnly
                    placeholder="0.0"
                  />
                  <select
                    className="input-glow bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 w-24 ml-2"
                    value={limitToToken}
                    onChange={(e) => setLimitToToken(e.target.value)}
                  >
                    {tokens.map((token) => (
                      <option key={token.address} value={token.address}>
                        {token.symbol}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-col mb-4">
                <label className="text-white font-semibold text-lg mb-3">Limit Price</label>
                <input
                  type="number"
                  className="input-glow bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 w-full"
                  value={limitPrice}
                  onChange={(e) => setLimitPrice(e.target.value)}
                  placeholder="0.0"
                />
              </div>

              <button
                className="btn-glow nav-button py-3 px-6 rounded-lg w-full"
                onClick={handleLimitOrder}
                disabled={!limitFromAmount || !limitPrice || loading}
              >
                {loading ? "Placing..." : "Place Limit Order"}
              </button>

              <div className="mt-6">
                <h3 className="text-white font-semibold text-lg mb-3">Your Limit Orders</h3>
                <div className="space-y-2">
                  {orders.map((order) => (
                    <div
                      key={order.orderId}
                      className="flex items-center justify-between bg-gray-800 p-2 rounded"
                    >
                      <span className="text-white">
                        {ethers.formatEther(order.amount)} {getTokenSymbol(order.token)} @{" "}
                        {ethers.formatEther(order.price)}
                      </span>
                      <span className="text-white">{order.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {error && <div className="mt-4 text-red-500 text-sm">{error}</div>}
        </div>
      </div>
      <OrderBook />
    </div>
  );
};

export default Swap;