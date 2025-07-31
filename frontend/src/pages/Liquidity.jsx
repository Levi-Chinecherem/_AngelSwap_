import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchTokenBalances,
  provideLiquidity,
  removeLiquidity,
  fetchPoolDetails,
  fetchAllTokens,
  initialize,
  distributeRewards,
} from "../store/slices/liquidityPoolSlice";
import { fetchAllLiquidityPools } from "../store/slices/adminSlice";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { toast } from "../components/ui/use-toast";
import { ethers } from "ethers";
import { LIQUIDITY_POOL_ADDRESS } from "../contracts/addresses";
import { FaWallet, FaRocket, FaPlusCircle, FaMinusCircle, FaInfoCircle, FaTools } from "react-icons/fa";
import LiquidityPoolABI from "../contracts/LiquidityPool.sol/LiquidityPool.json";

const ERC20_ABI = [
  "function approve(address spender, uint256 amount) returns (bool)",
  "function balanceOf(address) view returns (uint256)",
  "function symbol() view returns (string)",
];

export default function Liquidity() {
  const [activeTab, setActiveTab] = useState("addLiquidity");
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const [removeAmount1, setRemoveAmount1] = useState("");
  const [removeAmount2, setRemoveAmount2] = useState("");
  const [fromToken, setFromToken] = useState("");
  const [toToken, setToToken] = useState("");
  const [selectedPool, setSelectedPool] = useState(LIQUIDITY_POOL_ADDRESS);
  const [isAddingLiquidity, setIsAddingLiquidity] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [poolPairs, setPoolPairs] = useState({});
  const [isFetching, setIsFetching] = useState(true);
  const [timers, setTimers] = useState({
    nextInterestTime: null,
    currentTime: Date.now(),
  });
  const fetchRef = useRef(false);

  const dispatch = useDispatch();
  const { address: walletAddress } = useSelector((state) => state.wallet);
  const { tokens, tokenBalances, poolDetails, loading, error } = useSelector((state) => state.liquidityPool);
  const { liquidityPools: rawLiquidityPools } = useSelector((state) => state.admin);

  const liquidityPools = Array.from(new Set([...rawLiquidityPools, LIQUIDITY_POOL_ADDRESS])).filter(
    (pool) => ethers.isAddress(pool)
  );

  const poolData = useRef({
    [LIQUIDITY_POOL_ADDRESS]: { initTime: Date.now() - 7 * 24 * 60 * 60 * 1000 },
    [selectedPool]: { userAddTime: null },
  });

  useEffect(() => {
    const fetchInitialData = async () => {
      if (fetchRef.current) return;
      fetchRef.current = true;
      setIsFetching(true);

      try {
        // Fetch tokens first to ensure tokens array is populated
        const tokenList = await dispatch(fetchAllTokens()).unwrap();

        if (walletAddress) {
          // Fetch balances after tokens are set
          await dispatch(fetchTokenBalances(walletAddress)).unwrap();
          const poolData = await dispatch(fetchPoolDetails(walletAddress)).unwrap();
          await dispatch(fetchAllLiquidityPools()).unwrap();

          const initialized = poolData?.token1 && poolData?.token2 && poolData.token1 !== "0x0000000000000000000000000000000000000000";
          setIsInitialized(initialized);
        }

        if (walletAddress && liquidityPools.length > 0) {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const pairs = {};
          for (const poolAddr of liquidityPools) {
            try {
              const poolContract = new ethers.Contract(poolAddr, LiquidityPoolABI.abi, provider);
              const [token1, token2] = await Promise.all([poolContract.token1(), poolContract.token2()]);
              const token1Contract = new ethers.Contract(token1, ERC20_ABI, provider);
              const token2Contract = new ethers.Contract(token2, ERC20_ABI, provider);
              const [symbol1, symbol2] = await Promise.all([token1Contract.symbol(), token2Contract.symbol()]);
              pairs[poolAddr] = `${symbol1}/${symbol2}`;
            } catch (err) {
              pairs[poolAddr] = "UNKNOWN/UNKNOWN";
            }
          }
          setPoolPairs(pairs);
        }

        setIsFetching(false);
        setTimers({
          nextInterestTime: Date.now() + 24 * 60 * 60 * 1000,
          currentTime: Date.now(),
        });
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to load initial data: " + (err.message || "Unknown error"),
          variant: "destructive",
        });
      } finally {
        fetchRef.current = false;
      }
    };

    if (walletAddress) fetchInitialData();
    else setIsFetching(false);
  }, [dispatch, walletAddress]);

  useEffect(() => {
    if (isFetching) return;
    const interval = setInterval(() => {
      setTimers((prev) => ({ ...prev, currentTime: Date.now() }));
    }, 1000);
    return () => clearInterval(interval);
  }, [isFetching]);

  useEffect(() => {
    if (tokens && tokens.length >= 2) {
      setFromToken(tokens[0]?.address || "");
      setToToken(tokens[1]?.address || "");
    }
  }, [tokens]);

  const getBalance = (tokenAddress) => {
    const balance = tokenBalances[tokenAddress];
    return balance ? parseFloat(ethers.formatEther(balance)).toFixed(6) : "0.000000";
  };

  const getFormattedBalance = (tokenAddress) => {
    const balance = tokenBalances[tokenAddress];
    return balance ? parseFloat(ethers.formatEther(balance)).toFixed(6) : "0.000000";
  };

  const getTokenSymbol = (tokenAddress) => tokens.find((t) => t.address === tokenAddress)?.symbol || "UNKNOWN";

  const calculateInterest = () => {
    const timeElapsed = (timers.currentTime - (poolData.current[selectedPool]?.userAddTime || timers.currentTime)) / (1000 * 60 * 60 * 24);
    const baseLiquidity = parseFloat(ethers.formatEther(poolDetails.userLiquidity1 || "0"));
    return (baseLiquidity * 0.05 * timeElapsed).toFixed(4);
  };

  const calculateRewards = () => {
    const timeElapsed = (timers.currentTime - (poolData.current[selectedPool]?.userAddTime || timers.currentTime)) / (1000 * 60 * 60 * 24);
    return (10 * timeElapsed).toFixed(4);
  };

  const formatCountdown = (futureTime) => {
    if (!futureTime) return "N/A";
    const diff = Math.max(0, futureTime - timers.currentTime) / 1000;
    const hours = Math.floor(diff / 3600);
    const minutes = Math.floor((diff % 3600) / 60);
    const seconds = Math.floor(diff % 60);
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  const handleInitializePool = async () => {
    if (!walletAddress || !fromToken || !toToken) {
      toast({ title: "Error", description: "Connect wallet and select tokens", variant: "destructive" });
      return;
    }
    try {
      setIsAddingLiquidity(true);
      await dispatch(initialize({ token1: fromToken, token2: toToken })).unwrap();
      toast({ title: "Success", description: "Pool initialized" });
      await dispatch(fetchPoolDetails(walletAddress)).unwrap();
      setIsInitialized(true);
    } catch (err) {
      toast({ title: "Initialization Failed", description: err.message || "Failed to initialize pool", variant: "destructive" });
    } finally {
      setIsAddingLiquidity(false);
    }
  };

  const canAddLiquidity = () => {
    const amount1Valid = fromAmount && parseFloat(fromAmount) > 0;
    const amount2Valid = toAmount && parseFloat(toAmount) > 0;
    const result = amount1Valid && amount2Valid && walletAddress && isInitialized && !isAddingLiquidity && !isFetching;
    
    if (!result) {
      let reason = "";
      if (!amount1Valid) reason = "Invalid 'From' amount";
      else if (!amount2Valid) reason = "Invalid 'To' amount";
      else if (!walletAddress) reason = "Wallet not connected";
      else if (!isInitialized) reason = "Pool not initialized";
      else if (isAddingLiquidity) reason = "Liquidity addition in progress";
      else if (isFetching) reason = "Fetching data";
      toast({ title: "Cannot Add Liquidity", description: reason, variant: "destructive" });
      console.log("canAddLiquidity failed:", { amount1Valid, amount2Valid, walletAddress: !!walletAddress, isInitialized, isAddingLiquidity, isFetching });
    }
    
    return result;
  };

  const handleAddLiquidity = async () => {
    if (!canAddLiquidity()) {
      return;
    }

    try {
      const amount1 = ethers.parseEther(fromAmount);
      const amount2 = ethers.parseEther(toAmount);
      const balance1 = BigInt(tokenBalances[fromToken] || "0");
      const balance2 = BigInt(tokenBalances[toToken] || "0");

      if (amount1 > balance1 || amount2 > balance2) {
        toast({ title: "Insufficient Balance", description: "Not enough tokens", variant: "destructive" });
        return;
      }

      setIsAddingLiquidity(true);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const token1Contract = new ethers.Contract(fromToken, ERC20_ABI, signer);
      const token2Contract = new ethers.Contract(toToken, ERC20_ABI, signer);
      await token1Contract.approve(selectedPool, amount1).then(tx => tx.wait());
      await token2Contract.approve(selectedPool, amount2).then(tx => tx.wait());

      await dispatch(provideLiquidity({ amount1: amount1.toString(), amount2: amount2.toString() })).unwrap();

      toast({ title: "Success", description: "Liquidity added successfully" });
      poolData.current[selectedPool].userAddTime = Date.now();
      setTimers((prev) => ({ ...prev, nextInterestTime: Date.now() + 24 * 60 * 60 * 1000 }));
      setFromAmount("");
      setToAmount("");
      await dispatch(fetchTokenBalances(walletAddress)).unwrap();
      await dispatch(fetchPoolDetails(walletAddress)).unwrap();
    } catch (err) {
      toast({ title: "Transaction Failed", description: err.message || "Failed to add liquidity", variant: "destructive" });
    } finally {
      setIsAddingLiquidity(false);
    }
  };

  const handleRemoveLiquidity = async () => {
    if (!walletAddress || !removeAmount1 || !removeAmount2) {
      toast({ title: "Invalid Input", description: "Enter valid amounts", variant: "destructive" });
      return;
    }

    try {
      const amount1 = ethers.parseEther(removeAmount1);
      const amount2 = ethers.parseEther(removeAmount2);
      const userLiquidity1 = BigInt(poolDetails.userLiquidity1 || "0");
      const userLiquidity2 = BigInt(poolDetails.userLiquidity2 || "0");

      if (amount1 > userLiquidity1 || amount2 > userLiquidity2) {
        toast({ title: "Insufficient Liquidity", description: "Not enough liquidity", variant: "destructive" });
        return;
      }

      await dispatch(removeLiquidity({ amount1: amount1.toString(), amount2: amount2.toString() })).unwrap();
      toast({ title: "Success", description: "Liquidity removed successfully" });
      setRemoveAmount1("");
      setRemoveAmount2("");
      await dispatch(fetchTokenBalances(walletAddress)).unwrap();
      await dispatch(fetchPoolDetails(walletAddress)).unwrap();
    } catch (err) {
      toast({ title: "Transaction Failed", description: err.message || "Failed to remove liquidity", variant: "destructive" });
    }
  };

  const handleClaimRewards = async () => {
    if (!walletAddress) {
      toast({ title: "Error", description: "Connect wallet to claim rewards", variant: "destructive" });
      return;
    }

    // Assume poolDetails.pendingRewards exists; adjust based on actual slice
    const pendingRewards = poolDetails.pendingRewards ? parseFloat(ethers.formatEther(poolDetails.pendingRewards)) : parseFloat(calculateRewards());
    if (pendingRewards <= 0) {
      toast({ title: "No Rewards", description: "No rewards available to claim", variant: "destructive" });
      return;
    }

    try {
      console.log("Attempting to claim rewards for:", walletAddress);
      await dispatch(distributeRewards()).unwrap();
      toast({ title: "Success", description: "Rewards claimed successfully" });
      await dispatch(fetchTokenBalances(walletAddress)).unwrap();
      await dispatch(fetchPoolDetails(walletAddress)).unwrap();
    } catch (err) {
      console.log("Claim rewards error:", err.message);
      toast({ title: "Transaction Failed", description: err.message || "Failed to claim rewards", variant: "destructive" });
    }
  };

  const updateRemoveAmounts = (percentage) => {
    const userLiquidity1 = ethers.formatEther(poolDetails.userLiquidity1 || "0");
    const userLiquidity2 = ethers.formatEther(poolDetails.userLiquidity2 || "0");
    const amount1 = (percentage / 100) * parseFloat(userLiquidity1);
    const amount2 = (percentage / 100) * parseFloat(userLiquidity2);
    setRemoveAmount1(amount1.toFixed(18));
    setRemoveAmount2(amount2.toFixed(18));
  };

  return (
    <div className="bg-sciFiBg text-sciFiText font-sans min-h-screen">
      {error && <div className="text-red-500 text-center py-4">Error: {error}</div>}
      <section className="pt-24 px-4 bg-gradient-to-b from-sciFiBg via-gray-900 to-gray-800">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold text-sciFiAccent mb-12 animate-pulse">
            Master Liquidity Management
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
              <FaWallet className="text-sciFiAccent text-3xl mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Connect Wallet</h3>
              <p className="text-gray-300 text-sm">
                Link your MetaMask wallet to PulseChain testnet (chain ID 943). Ensure it’s active before proceeding.
              </p>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
              <FaRocket className="text-sciFiAccent text-3xl mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Initialize Pool</h3>
              <p className="text-gray-300 text-sm">
                Select two tokens and click "Initialize Pool" below. Confirm in MetaMask and wait for completion.
              </p>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
              <FaPlusCircle className="text-sciFiAccent text-3xl mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Add Liquidity</h3>
              <p className="text-gray-300 text-sm">
                Enter token amounts, approve, and add liquidity. Confirm all transactions in your wallet.
              </p>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
              <FaMinusCircle className="text-sciFiAccent text-3xl mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Remove Liquidity</h3>
              <p className="text-gray-300 text-sm">
                Switch to "Remove", specify amounts, and withdraw your liquidity stake.
              </p>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
              <FaInfoCircle className="text-sciFiAccent text-3xl mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Expectations</h3>
              <p className="text-gray-300 text-sm">
                Buttons gray out during processing. Disabled buttons lack glow and hover effects.
              </p>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
              <FaTools className="text-sciFiAccent text-3xl mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Troubleshooting</h3>
              <p className="text-gray-300 text-sm">
                Check console (F12) and MetaMask for errors if stuck. Ensure gas and network are set.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-gray-800 relative">
        <div className="max-w-lg mx-auto">
          <Card className="w-full bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-2xl text-sciFiAccent text-center">Liquidity Actions</CardTitle>
              <div className="flex justify-between mb-4">
                <button
                  className={`btn-glow nav-button py-2 px-6 rounded-lg font-bold text-lg text-white ${
                    activeTab === "addLiquidity" ? "bg-sciFiAccent text-sciFiBg" : ""
                  }`}
                  onClick={() => setActiveTab("addLiquidity")}
                  disabled={isFetching}
                >
                  Add
                </button>
                <button
                  className={`btn-glow nav-button py-2 px-6 rounded-lg font-bold text-lg text-white ${
                    activeTab === "removeLiquidity" ? "bg-sciFiAccent text-sciFiBg" : ""
                  }`}
                  onClick={() => setActiveTab("removeLiquidity")}
                  disabled={isFetching}
                >
                  Remove
                </button>
              </div>
            </CardHeader>

            <CardContent className="relative">
              {isFetching && (
                <div className="absolute inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-10">
                  <div className="text-white text-lg animate-pulse">Fetching pools...</div>
                </div>
              )}
              {activeTab === "addLiquidity" ? (
                <div>
                  <div className="mb-4">
                    <label className="text-white font-semibold text-lg mb-2 block">Select Pool</label>
                    <select
                      className="input-glow bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 w-full"
                      value={selectedPool}
                      onChange={(e) => setSelectedPool(e.target.value)}
                      disabled={isFetching}
                    >
                      {liquidityPools.map((pool) => (
                        <option key={pool} value={pool}>
                          {poolPairs[pool] || "Loading..."} - {pool.slice(0, 6)}...{pool.slice(-4)}
                          {pool === LIQUIDITY_POOL_ADDRESS ? " (Default)" : ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  {(!isInitialized) && (
                    <div className="mb-4">
                      <p className="text-white text-sm mb-2">Pool not initialized. Select tokens and initialize:</p>
                      <button
                        className={`btn-glow nav-button py-2 px-4 rounded-lg w-full ${
                          isAddingLiquidity || !walletAddress || isFetching
                            ? "opacity-50 cursor-not-allowed"
                            : "hover:bg-sciFiAccentHover"
                        }`}
                        onClick={handleInitializePool}
                        disabled={isAddingLiquidity || !walletAddress || isFetching}
                      >
                        {isAddingLiquidity ? "Initializing..." : "Initialize Pool"}
                      </button>
                    </div>
                  )}

                  <div className="flex flex-col mb-4">
                    <div className="flex items-center mb-3">
                      <label className="text-white font-semibold text-lg">From</label>
                      <span className="text-white ml-2">
                        Balance: {getFormattedBalance(fromToken)} {getTokenSymbol(fromToken)}
                      </span>
                    </div>
                    <div className="flex items-center mb-4">
                      <input
                        type="number"
                        className="input-glow bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 w-full"
                        placeholder="0.0"
                        value={fromAmount}
                        onChange={(e) => setFromAmount(e.target.value)}
                        disabled={isFetching}
                      />
                      <select
                        className="input-glow bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 w-24 ml-2"
                        value={fromToken}
                        onChange={(e) => setFromToken(e.target.value)}
                        disabled={isFetching}
                      >
                        {tokens.map((token) => (
                          <option key={token.address} value={token.address}>
                            {token.symbol}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-center items-center mb-4">
                    <span className="text-2xl text-white font-bold">+</span>
                  </div>

                  <div className="flex flex-col mb-4">
                    <div className="flex items-center mb-3">
                      <label className="text-white font-semibold text-lg">To</label>
                      <span className="text-white ml-2">
                        Balance: {getFormattedBalance(toToken)} {getTokenSymbol(toToken)}
                      </span>
                    </div>
                    <div className="flex items-center mb-4">
                      <input
                        type="number"
                        className="input-glow bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 w-full"
                        placeholder="0.0"
                        value={toAmount}
                        onChange={(e) => setToAmount(e.target.value)}
                        disabled={isFetching}
                      />
                      <select
                        className="input-glow bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 w-24 ml-2"
                        value={toToken}
                        onChange={(e) => setToToken(e.target.value)}
                        disabled={isFetching}
                      >
                        {tokens.map((token) => (
                          <option key={token.address} value={token.address}>
                            {token.symbol}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {(parseFloat(fromAmount) > 0 || parseFloat(toAmount) > 0) && (
                    <div id="poolDetails" className="mb-4">
                      <h3 className="text-sciFiAccent font-bold text-lg mb-2 border-b border-sciFiAccent pb-1">
                        Prices and Pool Share
                      </h3>
                      <div className="bg-gray-900 p-4 rounded-lg shadow-lg">
                        <p className="text-white text-sm flex items-center justify-between">
                          <span>{getTokenSymbol(fromToken)} per {getTokenSymbol(toToken)}:</span>
                          <span className="text-sciFiAccent font-semibold">{poolDetails?.token1PerToken2 || "0"}</span>
                        </p>
                        <p className="text-white text-sm flex items-center justify-between">
                          <span>{getTokenSymbol(toToken)} per {getTokenSymbol(fromToken)}:</span>
                          <span className="text-sciFiAccent font-semibold">{poolDetails?.token2PerToken1 || "0"}</span>
                        </p>
                        <p className="text-white text-sm flex items-center justify-between">
                          <span>Share of Pool:</span>
                          <span className="text-sciFiAccent font-semibold">{poolDetails?.poolShare || "0%"}</span>
                        </p>
                      </div>
                    </div>
                  )}

                  <button
                    className={`btn-glow nav-button py-3 px-6 rounded-lg w-full ${
                      !canAddLiquidity() ? "opacity-50 cursor-not-allowed" : "hover:bg-sciFiAccentHover"
                    }`}
                    onClick={handleAddLiquidity}
                    disabled={!canAddLiquidity()}
                  >
                    {isAddingLiquidity ? "Processing..." : "Add Liquidity"}
                  </button>

                  <button
                    onClick={async () => {
                      if (walletAddress) {
                        await dispatch(fetchTokenBalances(walletAddress)).unwrap();
                      }
                    }}
                    className="mt-2 text-sciFiAccent hover:text-sciFiAccentHover"
                  >
                    Refresh Balances
                  </button>
                </div>
              ) : (
                <div>
                  <p className="text-white font-semibold text-lg mb-4">Remove Liquidity</p>
                  <div id="liquidityList">
                    <div className="bg-gray-900 p-4 rounded-lg mb-4">
                      <h3 className="text-sciFiAccent font-bold mb-2">
                        Pool: {poolPairs[selectedPool] || "Loading..."} - {selectedPool.slice(0, 6)}...{selectedPool.slice(-4)}
                      </h3>
                      <div className="text-white text-sm mb-4">
                        <p>
                          Your Liquidity: {ethers.formatEther(poolDetails.userLiquidity1 || "0")}{" "}
                          {getTokenSymbol(fromToken)} /{" "}
                          {ethers.formatEther(poolDetails.userLiquidity2 || "0")}{" "}
                          {getTokenSymbol(toToken)}
                        </p>
                        <p>
                          Your Pool Share: <span className="text-sciFiAccent font-semibold">{poolDetails?.poolShare || "0%"}</span>
                        </p>
                        <p>
                          Accrued Interest: <span className="text-sciFiAccent font-semibold">{calculateInterest()} {getTokenSymbol(fromToken)}</span>
                        </p>
                        <p>
                          Rewards to Claim: <span className="text-sciFiAccent font-semibold">{calculateRewards()} RWD</span>
                        </p>
                        <p>
                          Next Interest: <span className="text-sciFiAccent font-semibold">{formatCountdown(timers.nextInterestTime)}</span>
                        </p>
                      </div>
                      <div className="mt-4">
                        <p className="text-white text-sm mb-2">Amounts to Remove:</p>
                        <div className="flex flex-col gap-2 mb-4">
                          <input
                            type="number"
                            placeholder={`${getTokenSymbol(fromToken)} Amount`}
                            className="input-glow bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-2 w-full"
                            value={removeAmount1}
                            onChange={(e) => setRemoveAmount1(e.target.value)}
                            disabled={isFetching}
                          />
                          <input
                            type="number"
                            placeholder={`${getTokenSymbol(toToken)} Amount`}
                            className="input-glow bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-2 w-full"
                            value={removeAmount2}
                            onChange={(e) => setRemoveAmount2(e.target.value)}
                            disabled={isFetching}
                          />
                        </div>
                        <div className="flex space-x-4 mb-4">
                          {[25, 50, 75, 100].map((percentage) => (
                            <button
                              key={percentage}
                              className={`bg-sciFiAccent text-white px-4 py-2 rounded-lg ${
                                isFetching ? "opacity-50 cursor-not-allowed" : "hover:bg-sciFiAccentHover"
                              }`}
                              onClick={() => updateRemoveAmounts(percentage)}
                              disabled={isFetching}
                            >
                              {percentage}%
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <button
                    className={`btn-glow nav-button py-3 px-6 rounded-lg w-full ${
                      loading || !walletAddress || isFetching
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:bg-sciFiAccentHover"
                    }`}
                    onClick={handleRemoveLiquidity}
                    disabled={loading || !walletAddress || isFetching}
                  >
                    {loading ? "Processing..." : "Remove Liquidity"}
                  </button>
                  <button
                    className={`btn-glow nav-button py-3 px-6 rounded-lg w-full mt-2 ${
                      loading || !walletAddress || isFetching || parseFloat(calculateRewards()) <= 0
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:bg-sciFiAccentHover"
                    }`}
                    onClick={handleClaimRewards}
                    disabled={loading || !walletAddress || isFetching || parseFloat(calculateRewards()) <= 0}
                  >
                    {loading ? "Processing..." : "Claim Rewards"}
                  </button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}