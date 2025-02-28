import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchTokenBalances,
  provideLiquidity,
  removeLiquidity,
  fetchPoolDetails,
  fetchAllTokens,
  initialize,
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

  const dispatch = useDispatch();
  const { address: walletAddress } = useSelector((state) => state.wallet);
  const { tokens, tokenBalances, poolDetails, loading, error } = useSelector(
    (state) => state.liquidityPool
  );
  const { liquidityPools } = useSelector((state) => state.admin);

  useEffect(() => {
    const fetchInitialData = async () => {
      setIsFetching(true);
      const maxRetries = 3;
      let success = false;
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          console.log(`Fetching initial data (attempt ${attempt})...`);
          await Promise.race([
            Promise.all([
              dispatch(fetchAllTokens()).unwrap(),
              walletAddress && dispatch(fetchTokenBalances(walletAddress)).unwrap(),
              walletAddress && dispatch(fetchPoolDetails(walletAddress)).unwrap(),
              walletAddress && dispatch(fetchAllLiquidityPools()).unwrap(),
            ]),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error("Timeout fetching data")), 15000)
            ),
          ]);
          console.log("Initial pool details:", poolDetails);
          setIsInitialized(!!poolDetails.token1 && !!poolDetails.token2 && poolDetails.token1 !== "0x0000000000000000000000000000000000000000");

          // Fetch token pairs for pools
          if (walletAddress && liquidityPools.length > 0) {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const pairs = {};
            for (const poolAddr of liquidityPools) {
              const poolContract = new ethers.Contract(poolAddr, LiquidityPoolABI.abi, provider);
              const [token1, token2] = await Promise.all([poolContract.token1(), poolContract.token2()]);
              const token1Contract = new ethers.Contract(token1, ERC20_ABI, provider);
              const token2Contract = new ethers.Contract(token2, ERC20_ABI, provider);
              const [symbol1, symbol2] = await Promise.all([token1Contract.symbol(), token2Contract.symbol()]);
              pairs[poolAddr] = `${symbol1}/${symbol2}`;
            }
            setPoolPairs(pairs);
          }
          success = true;
          break;
        } catch (err) {
          console.error(`Fetch initial data error (attempt ${attempt}):`, err);
          if (attempt === maxRetries) {
            toast({
              title: "Error",
              description: "Failed to load initial data after retries: " + (err.message || "Unknown error"),
              variant: "destructive",
            });
          } else {
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        }
      }
      setIsFetching(!success);
    };
    fetchInitialData();
  }, [dispatch, walletAddress, liquidityPools]);

  useEffect(() => {
    if (tokens && tokens.length >= 2) {
      setFromToken(tokens[0]?.address || "");
      setToToken(tokens[1]?.address || "");
    }
  }, [tokens]);

  const getBalance = (tokenAddress) =>
    tokenBalances[tokenAddress] ? ethers.formatEther(tokenBalances[tokenAddress]) : "0";

  const getFormattedBalance = (tokenAddress) => {
    const balance = tokenBalances[tokenAddress] || "0";
    try {
      return ethers.formatEther(balance);
    } catch (error) {
      console.error("Error formatting balance:", error);
      return "0";
    }
  };

  const getTokenSymbol = (tokenAddress) => {
    const token = tokens.find((t) => t.address === tokenAddress);
    return token?.symbol || "UNKNOWN";
  };

  const handleInitializePool = async () => {
    if (!walletAddress) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return;
    }

    try {
      if (!fromToken || !toToken) {
        toast({
          title: "Invalid Tokens",
          description: "Please select valid tokens",
          variant: "destructive",
        });
        return;
      }

      setIsAddingLiquidity(true);
      console.log("Triggering pool initialization...");
      console.log("Initializing pool with tokens:", { token1: fromToken, token2: toToken });
      const tx = await dispatch(initialize({ token1: fromToken, token2: toToken })).unwrap();
      console.log("Initialization transaction:", tx);
      toast({
        title: "Success",
        description: "Liquidity pool initialized successfully",
      });
      await dispatch(fetchPoolDetails(walletAddress)).unwrap();
      setIsInitialized(true);
      console.log("Pool initialized, new details:", poolDetails);
    } catch (err) {
      console.error("Initialize pool error:", err);
      toast({
        title: "Initialization Failed",
        description: err.message || "Failed to initialize pool",
        variant: "destructive",
      });
    } finally {
      setIsAddingLiquidity(false);
    }
  };

  const handleAddLiquidity = async () => {
    if (!walletAddress) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return;
    }

    try {
      if (!fromAmount || !toAmount) {
        toast({
          title: "Invalid Input",
          description: "Please enter valid amounts for both tokens",
          variant: "destructive",
        });
        return;
      }

      const amount1 = ethers.parseEther(fromAmount);
      const amount2 = ethers.parseEther(toAmount);
      const balance1 = BigInt(tokenBalances[fromToken] || "0");
      const balance2 = BigInt(tokenBalances[toToken] || "0");

      console.log("Adding liquidity:", { amount1, amount2, balance1, balance2 });

      if (amount1 > balance1 || amount2 > balance2) {
        toast({
          title: "Insufficient Balance",
          description: "You don’t have enough tokens",
          variant: "destructive",
        });
        return;
      }

      setIsAddingLiquidity(true);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      console.log("Approving tokens...");
      const token1Contract = new ethers.Contract(fromToken, ERC20_ABI, signer);
      const token2Contract = new ethers.Contract(toToken, ERC20_ABI, signer);
      const approvalTx1 = await token1Contract.approve(selectedPool, amount1);
      await approvalTx1.wait();
      console.log("Token 1 approved:", approvalTx1.hash);
      const approvalTx2 = await token2Contract.approve(selectedPool, amount2);
      await approvalTx2.wait();
      console.log("Token 2 approved:", approvalTx2.hash);

      console.log("Providing liquidity to pool:", selectedPool);
      await dispatch(
        provideLiquidity({
          amount1: amount1.toString(),
          amount2: amount2.toString(),
        })
      ).unwrap();

      toast({
        title: "Success",
        description: "Liquidity added successfully",
      });

      setFromAmount("");
      setToAmount("");
      await dispatch(fetchTokenBalances(walletAddress)).unwrap();
      await dispatch(fetchPoolDetails(walletAddress)).unwrap();
      console.log("Updated pool details:", poolDetails);
    } catch (err) {
      console.error("Add liquidity error:", err);
      toast({
        title: "Transaction Failed",
        description: err.message || "Failed to add liquidity",
        variant: "destructive",
      });
    } finally {
      setIsAddingLiquidity(false);
    }
  };

  const handleRemoveLiquidity = async () => {
    if (!walletAddress) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return;
    }

    try {
      if (!removeAmount1 || !removeAmount2) {
        toast({
          title: "Invalid Input",
          description: "Please enter valid amounts to remove",
          variant: "destructive",
        });
        return;
      }

      const amount1 = ethers.parseEther(removeAmount1);
      const amount2 = ethers.parseEther(removeAmount2);
      const userLiquidity1 = BigInt(poolDetails.userLiquidity1 || "0");
      const userLiquidity2 = BigInt(poolDetails.userLiquidity2 || "0");

      console.log("Removing liquidity:", { amount1, amount2, userLiquidity1, userLiquidity2 });

      if (amount1 > userLiquidity1 || amount2 > userLiquidity2) {
        toast({
          title: "Insufficient Liquidity",
          description: "You don’t have enough liquidity to remove",
          variant: "destructive",
        });
        return;
      }

      await dispatch(
        removeLiquidity({
          amount1: amount1.toString(),
          amount2: amount2.toString(),
        })
      ).unwrap();

      toast({
        title: "Success",
        description: "Liquidity removed successfully",
      });

      setRemoveAmount1("");
      setRemoveAmount2("");
      await dispatch(fetchTokenBalances(walletAddress)).unwrap();
      await dispatch(fetchPoolDetails(walletAddress)).unwrap();
    } catch (err) {
      console.error("Remove liquidity error:", err);
      toast({
        title: "Transaction Failed",
        description: err.message || "Failed to remove liquidity",
        variant: "destructive",
      });
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
      {error && (
        <div className="text-red-500 text-center py-4">Error: {error}</div>
      )}
      {/* Instructions Section */}
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

      {/* Main Actions Section */}
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
                  {/* Pool Selection */}
                  <div className="mb-4">
                    <label className="text-white font-semibold text-lg mb-2 block">Select Pool</label>
                    <select
                      className="input-glow bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 w-full"
                      value={selectedPool}
                      onChange={(e) => setSelectedPool(e.target.value)}
                      disabled={isFetching}
                    >
                      <option value={LIQUIDITY_POOL_ADDRESS}>
                        {LIQUIDITY_POOL_ADDRESS.slice(0, 6)}...{LIQUIDITY_POOL_ADDRESS.slice(-4)} (Default)
                      </option>
                      {liquidityPools.map((pool) => (
                        <option key={pool} value={pool}>
                          {poolPairs[pool] || `${pool.slice(0, 6)}...${pool.slice(-4)}`}
                        </option>
                      ))}
                    </select>
                  </div>

                  {(!poolDetails.token1 || !poolDetails.token2 || poolDetails.token1 === "0x0000000000000000000000000000000000000000") && (
                    <div className="mb-4">
                      <p className="text-white text-sm mb-2">
                        Pool not initialized. Select tokens and initialize:
                      </p>
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
                          <span className="text-sciFiAccent font-semibold">
                            {poolDetails?.token1PerToken2 || "0"}
                          </span>
                        </p>
                        <p className="text-white text-sm flex items-center justify-between">
                          <span>{getTokenSymbol(toToken)} per {getTokenSymbol(fromToken)}:</span>
                          <span className="text-sciFiAccent font-semibold">
                            {poolDetails?.token2PerToken1 || "0"}
                          </span>
                        </p>
                        <p className="text-white text-sm flex items-center justify-between">
                          <span>Share of Pool:</span>
                          <span className="text-sciFiAccent font-semibold">
                            {poolDetails?.poolShare || "0%"}
                          </span>
                        </p>
                      </div>
                    </div>
                  )}

                  <button
                    className={`btn-glow nav-button py-3 px-6 rounded-lg w-full ${
                      isAddingLiquidity || !walletAddress || !isInitialized || isFetching
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:bg-sciFiAccentHover"
                    }`}
                    onClick={handleAddLiquidity}
                    disabled={isAddingLiquidity || !walletAddress || !isInitialized || isFetching}
                  >
                    {isAddingLiquidity ? "Processing..." : "Add Liquidity"}
                  </button>
                </div>
              ) : (
                <div>
                  <p className="text-white font-semibold text-lg mb-4">Remove Liquidity</p>
                  <div id="liquidityList">
                    <div className="bg-gray-900 p-4 rounded-lg mb-4">
                      <h3 className="text-sciFiAccent font-bold mb-2">
                        Pair: {getTokenSymbol(fromToken)}/{getTokenSymbol(toToken)}
                      </h3>
                      <p className="text-white text-sm">
                        Your Liquidity: {ethers.formatEther(poolDetails.userLiquidity1 || "0")}{" "}
                        {getTokenSymbol(fromToken)} /{" "}
                        {ethers.formatEther(poolDetails.userLiquidity2 || "0")}{" "}
                        {getTokenSymbol(toToken)}
                      </p>
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
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}