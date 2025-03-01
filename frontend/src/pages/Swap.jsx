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
import { toast } from "../components/ui/use-toast";
import OrderBook from "../components/OrderBook";

const Swap = () => {
  const dispatch = useDispatch();
  const { address: walletAddress } = useSelector((state) => state.wallet);
  const { tokens, tokenBalances, poolDetails, loading, error } = useSelector((state) => state.liquidityPool);
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
  const [poolReserves, setPoolReserves] = useState({ token1: "0.000000", token2: "0.000000" });

  // Fetch initial data
  useEffect(() => {
    if (!walletAddress) {
      toast({ title: "Wallet Not Connected", description: "Please connect your wallet.", variant: "destructive" });
      return;
    }
    const fetchData = async () => {
      try {
        const [tokenList, balances, poolData, orderData] = await Promise.all([
          dispatch(fetchAllTokens()).unwrap(),
          dispatch(fetchTokenBalances(walletAddress)).unwrap(),
          dispatch(fetchPoolDetails(walletAddress)).unwrap(),
          dispatch(fetchOrders(walletAddress)).unwrap(),
        ]);
        console.log("Fetched tokens:", tokenList);
        console.log("Fetched balances:", balances);
        console.log("Fetched pool details:", poolData);
        console.log("Fetched orders:", orderData);
      } catch (err) {
        console.error("Fetch error:", err);
        toast({ title: "Error", description: err.message || "Failed to load data", variant: "destructive" });
      }
    };
    fetchData();
  }, [dispatch, walletAddress]);

  // Set initial tokens
  useEffect(() => {
    if (tokens.length > 0) {
      setFromToken(tokens[0]?.address || "");
      setToToken(tokens[1]?.address || tokens[0]?.address);
      setLimitFromToken(tokens[0]?.address || "");
      setLimitToToken(tokens[1]?.address || tokens[0]?.address);
      console.log("Initial tokens set:", { fromToken: tokens[0]?.address, toToken: tokens[1]?.address });
    } else {
      console.log("No tokens available to set");
    }
  }, [tokens]);

  // Update pool reserves
  useEffect(() => {
    if (poolDetails && poolDetails.totalLiquidity1 && poolDetails.totalLiquidity2) {
      setPoolReserves({
        token1: parseFloat(ethers.formatEther(poolDetails.totalLiquidity1 || "0")).toFixed(6),
        token2: parseFloat(ethers.formatEther(poolDetails.totalLiquidity2 || "0")).toFixed(6),
      });
    }
  }, [poolDetails]);

  const getBalance = (tokenAddress) => {
    const balance = tokenBalances[tokenAddress];
    const formattedBalance = balance ? parseFloat(ethers.formatEther(balance)).toFixed(6) : "0.000000";
    console.log(`Getting balance for ${tokenAddress}:`, { raw: balance?.toString(), formatted: formattedBalance });
    return formattedBalance;
  };

  const getTokenSymbol = (tokenAddress) => tokens.find((t) => t.address === tokenAddress)?.symbol || "UNKNOWN";
  const getPoolReserve = (tokenAddress) => (tokenAddress === poolDetails?.token1 ? poolReserves.token1 : poolReserves.token2) || "0.000000";

  // Calculate output amount
  const calculateToAmount = () => {
    if (!fromAmount || !fromToken || !toToken || !poolReserves.token1 || !poolReserves.token2) return;
    const amountIn = ethers.parseEther(fromAmount);
    const reserveIn = ethers.parseEther(fromToken === poolDetails.token1 ? poolReserves.token1 : poolReserves.token2);
    const reserveOut = ethers.parseEther(fromToken === poolDetails.token1 ? poolReserves.token2 : poolReserves.token1);
    const amountOutWithFee = (amountIn * reserveOut * BigInt(998)) / (reserveIn * BigInt(1000) + amountIn * BigInt(998));
    setToAmount(parseFloat(ethers.formatEther(amountOutWithFee)).toFixed(6));
  };

  useEffect(() => calculateToAmount(), [fromAmount, fromToken, toToken, poolReserves]);

  // Relaxed canSwap for testing
  const canSwap = () => {
    const result = !!(fromAmount && walletAddress && fromToken && toToken && parseFloat(fromAmount) > 0);
    console.log("canSwap check:", {
      fromAmount,
      walletAddress: !!walletAddress,
      fromToken: !!fromToken,
      toToken: !!toToken,
      amountValid: parseFloat(fromAmount) > 0,
      result,
    });
    return result;
  };

  const handleMaxAmount = () => setFromAmount(getBalance(fromToken));
  const switchTokens = () => {
    setFromToken(toToken);
    setToToken(fromToken);
    setFromAmount(toAmount);
    setToAmount(fromAmount);
  };

  const handleSwap = async () => {
    const amountIn = parseFloat(fromAmount);
    const reserve = parseFloat(getPoolReserve(fromToken));
    if (!canSwap()) {
      toast({ title: "Cannot Swap", description: "Invalid amount or wallet not connected", variant: "destructive" });
      return;
    }
    if (amountIn > reserve) {
      toast({
        title: "Insufficient Liquidity",
        description: `Swap amount (${amountIn} ${getTokenSymbol(fromToken)}) exceeds reserve (${reserve} ${getTokenSymbol(fromToken)}). Please reduce the amount.`,
        variant: "destructive",
      });
      return;
    }

    const amountInWei = ethers.parseEther(fromAmount);
    const minAmountOutWei = ethers.parseEther(toAmount || "0") * BigInt(1000 - Math.floor(slippage * 10)) / BigInt(1000);

    try {
      const result = await dispatch(swapTokens({ fromToken, amountIn: amountInWei, minAmountOut: minAmountOutWei })).unwrap();
      console.log("Swap result:", result);
      await Promise.all([
        dispatch(fetchTokenBalances(walletAddress)).unwrap(),
        dispatch(fetchPoolDetails(walletAddress)).unwrap(),
      ]);
      setFromAmount("");
      setToAmount("");
      toast({ title: "Success", description: "Swap completed!" });
    } catch (err) {
      console.error("Swap error:", err);
      toast({ title: "Swap Failed", description: err.reason || err.message || "Swap error", variant: "destructive" });
    }
  };

  const canPlaceOrder = () => {
    const result = !!(limitFromAmount && limitPrice && walletAddress && limitFromToken && limitToToken && parseFloat(limitFromAmount) > 0 && parseFloat(limitPrice) > 0);
    console.log("canPlaceOrder check:", {
      limitFromAmount,
      limitPrice,
      walletAddress: !!walletAddress,
      limitFromToken: !!limitFromToken,
      limitToToken: !!limitToToken,
      amountValid: parseFloat(limitFromAmount) > 0,
      priceValid: parseFloat(limitPrice) > 0,
      result,
    });
    return result;
  };

  const handleLimitOrder = async () => {
    if (!canPlaceOrder()) {
      toast({ title: "Invalid Order", description: "Fill all fields with valid values", variant: "destructive" });
      return;
    }
    const amount = parseFloat(limitFromAmount);
    const balance = parseFloat(getBalance(limitFromToken));
    if (amount > balance) {
      toast({ title: "Insufficient Balance", description: `Only ${balance} ${getTokenSymbol(limitFromToken)} available`, variant: "destructive" });
      return;
    }

    const amountWei = ethers.parseEther(limitFromAmount);
    const priceWei = ethers.parseEther(limitPrice);
    const isBuyOrder = limitFromToken !== limitToToken;
    const token = isBuyOrder ? limitToToken : limitFromToken;

    try {
      const result = await dispatch(placeOrder({ token, amount: amountWei, price: priceWei, isBuyOrder })).unwrap();
      console.log("Limit order result:", result);
      await dispatch(fetchOrders(walletAddress)).unwrap();
      await dispatch(fetchTokenBalances(walletAddress)).unwrap();
      setLimitFromAmount("");
      setLimitPrice("");
      toast({ title: "Success", description: "Limit order placed!" });
    } catch (err) {
      console.error("Limit order error:", err);
      toast({ title: "Order Failed", description: err.reason || err.message || "Order error", variant: "destructive" });
    }
  };

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
                  <span className="text-white ml-2">Balance: {getBalance(fromToken)} {getTokenSymbol(fromToken)}</span>
                  <button className="ml-2 text-sciFiAccent" onClick={handleMaxAmount} disabled={!walletAddress || loading}>
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
                    disabled={loading || !walletAddress}
                  />
                  <select
                    className="input-glow bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 w-24 ml-2"
                    value={fromToken}
                    onChange={(e) => setFromToken(e.target.value)}
                    disabled={loading || !walletAddress}
                  >
                    {tokens.map((token) => (
                      <option key={token.address} value={token.address}>{token.symbol}</option>
                    ))}
                  </select>
                </div>
                <p className="text-white text-sm mt-1">Pool Reserve: {getPoolReserve(fromToken)} {getTokenSymbol(fromToken)}</p>
              </div>

              <div className="flex justify-center mb-4">
                <button className="arrow-btn text-white" onClick={switchTokens} disabled={loading || !walletAddress}>⇅</button>
              </div>

              <div className="flex flex-col mb-4">
                <div className="flex items-center mb-3">
                  <label className="text-white font-semibold text-lg">To</label>
                  <span className="text-white ml-2">Balance: {getBalance(toToken)} {getTokenSymbol(toToken)}</span>
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
                    disabled={loading || !walletAddress}
                  >
                    {tokens.map((token) => (
                      <option key={token.address} value={token.address}>{token.symbol}</option>
                    ))}
                  </select>
                </div>
                <p className="text-white text-sm mt-1">Pool Reserve: {getPoolReserve(toToken)} {getTokenSymbol(toToken)}</p>
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
                  disabled={loading || !walletAddress}
                />
                <span className="text-white">%</span>
              </div>

              <button
                className={`btn-glow nav-button py-3 px-6 rounded-lg w-full ${
                  !canSwap() || loading ? "opacity-50 cursor-not-allowed" : "hover:bg-sciFiAccentHover"
                }`}
                onClick={handleSwap}
                disabled={!canSwap() || loading}
              >
                {loading ? "Swapping..." : "Swap"}
              </button>

              {/* Debug Button */}
              <button
                onClick={async () => {
                  const balances = await dispatch(fetchTokenBalances(walletAddress)).unwrap();
                  console.log("Manual fetch balances:", balances);
                }}
                className="mt-2 text-sciFiAccent"
              >
                Refresh Balances
              </button>
            </>
          ) : (
            <>
              <div className="flex flex-col mb-4">
                <div className="flex items-center mb-3">
                  <label className="text-white font-semibold text-lg">From</label>
                  <span className="text-white ml-2">Balance: {getBalance(limitFromToken)} {getTokenSymbol(limitFromToken)}</span>
                </div>
                <div className="flex items-center">
                  <input
                    type="number"
                    className="input-glow bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 w-full"
                    value={limitFromAmount}
                    onChange={(e) => setLimitFromAmount(e.target.value)}
                    placeholder="0.0"
                    disabled={loading || !walletAddress}
                  />
                  <select
                    className="input-glow bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 w-24 ml-2"
                    value={limitFromToken}
                    onChange={(e) => setLimitFromToken(e.target.value)}
                    disabled={loading || !walletAddress}
                  >
                    {tokens.map((token) => (
                      <option key={token.address} value={token.address}>{token.symbol}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-col mb-4">
                <div className="flex items-center mb-3">
                  <label className="text-white font-semibold text-lg">To</label>
                  <span className="text-white ml-2">Balance: {getBalance(limitToToken)} {getTokenSymbol(limitToToken)}</span>
                </div>
                <div className="flex items-center">
                  <input type="number" className="input-glow bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 w-full" readOnly placeholder="0.0" />
                  <select
                    className="input-glow bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 w-24 ml-2"
                    value={limitToToken}
                    onChange={(e) => setLimitToToken(e.target.value)}
                    disabled={loading || !walletAddress}
                  >
                    {tokens.map((token) => (
                      <option key={token.address} value={token.address}>{token.symbol}</option>
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
                  disabled={loading || !walletAddress}
                />
              </div>

              <button
                className={`btn-glow nav-button py-3 px-6 rounded-lg w-full ${
                  !canPlaceOrder() || loading ? "opacity-50 cursor-not-allowed" : "hover:bg-sciFiAccentHover"
                }`}
                onClick={handleLimitOrder}
                disabled={!canPlaceOrder() || loading}
              >
                {loading ? "Placing..." : "Place Limit Order"}
              </button>

              <div className="mt-6">
                <h3 className="text-white font-semibold text-lg mb-3">Your Limit Orders</h3>
                <div className="space-y-2">
                  {orders.map((order) => (
                    <div key={order.orderId} className="flex items-center justify-between bg-gray-800 p-2 rounded">
                      <span className="text-white">
                        {parseFloat(ethers.formatEther(order.amount)).toFixed(6)} {getTokenSymbol(order.token)} @{" "}
                        {parseFloat(ethers.formatEther(order.price)).toFixed(6)}
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