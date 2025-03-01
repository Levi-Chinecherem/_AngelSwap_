import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ethers } from "ethers";
import {
  fetchUserTransactions,
  fetchTokenBalances,
  fetchPoolDetails,
  fetchAllTokens,
  fetchPendingRewards,
} from "../store/slices/liquidityPoolSlice";
import { revealGlobalTransaction } from "../store/slices/securitySlice";
import { fetchOrders } from "../store/slices/orderBookSlice";
import { toast } from "../components/ui/use-toast";

const History = () => {
  const dispatch = useDispatch();
  const ITEMS_PER_PAGE = 10;
  const MAX_HISTORY = 50;
  const [currentPage, setCurrentPage] = useState(1);
  const [activeFilter, setActiveFilter] = useState("all");

  const { address: walletAddress } = useSelector((state) => state.wallet);
  const {
    transactions: liquidityTransactions,
    loading: liquidityLoading,
    error: liquidityError,
    poolDetails,
    tokenBalances,
    pendingRewards,
    tokens,
  } = useSelector((state) => state.liquidityPool);
  const {
    orders,
    loading: orderBookLoading,
    error: orderBookError,
  } = useSelector((state) => state.orderBook);
  const { securityEnabled } = useSelector((state) => state.security);

  const loading = liquidityLoading || orderBookLoading;
  const error = liquidityError || orderBookError;

  useEffect(() => {
    const fetchData = async () => {
      if (!walletAddress || !window.ethereum) {
        toast({ title: "Wallet Not Connected", description: "Please connect your wallet", variant: "destructive" });
        return;
      }
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        await Promise.all([
          dispatch(fetchUserTransactions(walletAddress)).unwrap(),
          dispatch(fetchOrders(walletAddress)).unwrap(),
          dispatch(fetchTokenBalances(walletAddress)).unwrap(),
          dispatch(fetchPoolDetails(walletAddress)).unwrap(),
          dispatch(fetchAllTokens()).unwrap(),
          dispatch(fetchPendingRewards(walletAddress)).unwrap(),
        ]);
      } catch (err) {
        console.error("Fetch data error:", err);
        toast({ title: "Error", description: `Failed to fetch history data: ${err.message}`, variant: "destructive" });
      }
    };
    fetchData();
    const refreshInterval = setInterval(fetchData, 60000);
    return () => clearInterval(refreshInterval);
  }, [dispatch, walletAddress]);

  const getTokenSymbol = (tokenAddress) =>
    tokens.find((t) => t.address === tokenAddress)?.symbol || "UNKNOWN";

  const formatOrderBookActivity = (order) => ({
    type: "order",
    status: order.status,
    amount: order.amount,
    price: order.price,
    token: order.token,
    isBuyOrder: order.isBuyOrder,
    timestamp: order.timestamp,
    transaction: order.orderId,
    isPrivate: order.isPrivate,
    txHash: order.transaction,
  });

  const allActivities = [
    ...(liquidityTransactions.items || []),
    ...(orders?.map(formatOrderBookActivity) || []),
  ].sort((a, b) => Number(b.timestamp) - Number(a.timestamp)).slice(0, MAX_HISTORY);

  const ActivityCard = ({ activity }) => {
    const getActivityIcon = (type) => {
      switch (type) {
        case "swap": return "🔄";
        case "addLiquidity": return "💧";
        case "removeLiquidity": return "🔥";
        case "claimRewards": return "🎁";
        case "order": return "📊";
        default: return "📝";
      }
    };

    const formatAmount = (type, activity) => {
      try {
        switch (type) {
          case "swap":
            return `${parseFloat(ethers.formatEther(activity.amountIn || activity.amount)).toFixed(6)} ${getTokenSymbol(poolDetails?.token1)} → ${
              activity.amountOut ? parseFloat(ethers.formatEther(activity.amountOut)).toFixed(6) : "?"
            } ${getTokenSymbol(poolDetails?.token2)}`;
          case "addLiquidity":
          case "removeLiquidity":
            return `${parseFloat(ethers.formatEther(activity.amount1 || "0")).toFixed(6)} ${getTokenSymbol(poolDetails?.token1)} + ${parseFloat(ethers.formatEther(activity.amount2 || "0")).toFixed(6)} ${getTokenSymbol(poolDetails?.token2)}`;
          case "claimRewards":
            return `${parseFloat(ethers.formatEther(activity.amount)).toFixed(6)} Rewards`;
          case "order":
            return `${parseFloat(ethers.formatEther(activity.amount)).toFixed(6)} ${getTokenSymbol(activity.token)} @ ${parseFloat(ethers.formatEther(activity.price)).toFixed(6)}`;
          default:
            return `${parseFloat(ethers.formatEther(activity.amount || "0")).toFixed(6)}`;
        }
      } catch (err) {
        return "Error formatting amount";
      }
    };

    const formatTimestamp = (timestamp) => {
      const ts = Number(timestamp);
      console.log("Raw timestamp:", ts); // Debug raw value

      // If timestamp is too small (e.g., < 1 million seconds), assume it's invalid or in milliseconds
      if (ts < 1000000) {
        // If it looks like milliseconds (e.g., > 1 trillion for recent dates), use as is
        if (ts > 1e12) {
          return new Date(ts).toLocaleString();
        }
        // Otherwise, assume it's seconds and needs conversion, or fallback to now
        return new Date().toLocaleString() + " (Invalid timestamp)";
      }
      // Normal case: assume seconds, convert to milliseconds
      return new Date(ts * 1000).toLocaleString();
    };

    const handleReveal = async () => {
      if (activity.isPrivate && activity.status === "pending" && activity.txHash) {
        try {
          await dispatch(
            revealGlobalTransaction({
              txHash: activity.txHash,
              contractType: activity.type === "order" ? "orderBook" : "liquidityPool",
            })
          ).unwrap();
          toast({ title: "Success", description: "Transaction revealed" });
        } catch (err) {
          toast({
            title: "Error",
            description: "Failed to reveal transaction",
            variant: "destructive",
          });
        }
      }
    };

    return (
      <div className="relative bg-gray-800 rounded-xl p-6 transition-all duration-300 hover:shadow-lg input-glow">
        <div className="flex items-start gap-4">
          <div className="text-2xl">{getActivityIcon(activity.type)}</div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white">
              {activity.type === "swap" ? "Token Swap" :
               activity.type === "addLiquidity" ? "Added Liquidity" :
               activity.type === "removeLiquidity" ? "Removed Liquidity" :
               activity.type === "claimRewards" ? "Claimed Rewards" :
               activity.type === "order" ? (activity.isBuyOrder ? "Buy Order" : "Sell Order") :
               "Activity"}
            </h3>
            <p className="text-gray-400 text-sm mt-1">
              {formatTimestamp(activity.timestamp)}
            </p>
            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Amount:</span>
                <span className="text-white font-medium">{formatAmount(activity.type, activity)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Transaction:</span>
                <a
                  href={`https://scan.testnet.pulsechain.com/tx/${activity.transaction}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sciFiAccent hover:text-sciFiAccentHover"
                >
                  {activity.transaction.slice(0, 6)}...{activity.transaction.slice(-4)}
                </a>
              </div>
            </div>
          </div>
        </div>
        {securityEnabled && activity.isPrivate && activity.status === "pending" ? (
          <button
            onClick={handleReveal}
            className="btn-glow nav-button px-3 py-1 rounded-lg text-sm absolute top-4 right-4"
          >
            Reveal
          </button>
        ) : (
          <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-medium
            ${activity.status === "confirmed" ? "bg-green-600" :
              activity.status === "pending" ? "bg-yellow-600" :
              activity.status === "failed" ? "bg-red-600" :
              "bg-gray-600"} text-white`}>
            {activity.status || "Pending"}
          </div>
        )}
      </div>
    );
  };

  const StatCard = ({ title, value, icon }) => (
    <div className="bg-gray-800 rounded-xl p-6 input-glow transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <span className="text-2xl">{icon}</span>
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
    </div>
  );

  const getFilteredActivities = () => {
    let filtered = [...allActivities];
    if (activeFilter !== "all") {
      filtered = filtered.filter((tx) => tx.type === activeFilter);
    }
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filtered.slice(startIndex, endIndex);
  };

  const totalPages = Math.ceil(allActivities.length / ITEMS_PER_PAGE);

  const formatStatValue = (key, value) => {
    switch (key) {
      case "Pool Share":
        return value || "0%";
      case "Your Liquidity":
      case "Balance":
        return `${parseFloat(ethers.formatEther(tokenBalances[poolDetails?.token1] || "0")).toFixed(6)} ${getTokenSymbol(poolDetails?.token1)}`;
      case "Pending Rewards":
        return `${parseFloat(ethers.formatEther(pendingRewards || "0")).toFixed(6)}`;
      default:
        return value;
    }
  };

  return (
    <div className="min-h-screen bg-sciFiBg">
      <section className="pt-20 pb-10 bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-sciFiAccent mb-4">Activity History</h1>
          <p className="text-gray-400 text-lg">Your latest {MAX_HISTORY} activities on AngelSwap</p>
        </div>
      </section>

      <section className="py-8 bg-[#1a1a1a]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Pool Share" value={formatStatValue("Pool Share", poolDetails?.poolShare)} icon="🌊" />
            <StatCard title="Your Liquidity" value={formatStatValue("Your Liquidity")} icon="💧" />
            <StatCard title="Balance" value={formatStatValue("Balance")} icon="💰" />
            <StatCard title="Pending Rewards" value={formatStatValue("Pending Rewards")} icon="🎁" />
          </div>
        </div>
      </section>

      <section className="py-8 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-wrap gap-3 mb-8">
            {["all", "swap", "addLiquidity", "removeLiquidity", "claimRewards", "order"].map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`btn-glow nav-button px-4 py-2 rounded-lg text-sm font-medium ${
                  activeFilter === filter ? "bg-sciFiAccent text-sciFiBg" : "text-white"
                }`}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1).replace(/([A-Z])/g, " $1")}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sciFiAccent"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500">Error: {error}</p>
            </div>
          ) : allActivities.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400">No activities found.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {getFilteredActivities().map((activity, index) => (
                  <ActivityCard key={activity.transaction || index} activity={activity} />
                ))}
              </div>
              {totalPages > 1 && (
                <div className="flex justify-center mt-8 gap-2">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="btn-glow nav-button px-4 py-2 rounded-lg disabled:opacity-50 text-white"
                  >
                    ←
                  </button>
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`btn-glow nav-button px-4 py-2 rounded-lg ${
                        currentPage === i + 1 ? "bg-sciFiAccent text-sciFiBg" : "text-white"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="btn-glow nav-button px-4 py-2 rounded-lg disabled:opacity-50 text-white"
                  >
                    →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default History;