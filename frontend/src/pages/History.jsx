import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ethers } from 'ethers';
import {
  fetchUserTransactions,
  fetchTokenBalances,
  fetchPoolDetails,
  fetchAllTokens,
  fetchPendingRewards,
  revealTransaction,
} from '../store/slices/liquidityPoolSlice';
import { fetchOrders } from '../store/slices/orderBookSlice'; // Import from orderBookSlice

const History = () => {
  const dispatch = useDispatch();
  const ITEMS_PER_PAGE = 10;
  const MAX_HISTORY = 50;
  const [currentPage, setCurrentPage] = useState(1);
  const [activeFilter, setActiveFilter] = useState('all');

  // Liquidity pool state
  const {
    transactions: liquidityTransactions,
    loading: liquidityLoading,
    error: liquidityError,
    poolDetails,
    token1Balance,
    token2Balance,
    pendingRewards,
    userLiquidity1,
    userLiquidity2,
    token1,
    token2,
    securityEnabled,
  } = useSelector((state) => state.liquidityPool);

  // Order book state
  const {
    orders,
    loading: orderBookLoading,
    error: orderBookError,
  } = useSelector((state) => state.orderBook);

  // Combine loading and error states
  const loading = liquidityLoading || orderBookLoading;
  const error = liquidityError || orderBookError;

  // Fetch data from both slices
  useEffect(() => {
    const fetchData = async () => {
      if (window.ethereum) {
        try {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const signer = provider.getSigner();
          const address = await signer.getAddress();

          await Promise.all([
            dispatch(fetchUserTransactions(address)), // Fetch liquidity pool transactions
            dispatch(fetchOrders(address)), // Fetch order book transactions
            dispatch(fetchTokenBalances(address)),
            dispatch(fetchPoolDetails(address)),
            dispatch(fetchAllTokens()),
            dispatch(fetchPendingRewards(address)),
          ]);
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      }
    };

    fetchData();
    // Set up automatic refresh every minute
    const refreshInterval = setInterval(fetchData, 60000);
    return () => clearInterval(refreshInterval);
  }, [dispatch]);

  // Format order book activities for display
  const formatOrderBookActivity = (order) => ({
    type: 'order',
    status: order.status,
    amount: order.amount,
    price: order.price,
    token: order.token,
    isBuyOrder: order.isBuyOrder,
    timestamp: order.timestamp,
    transaction: order.transactionHash || order.orderId,
  });

  // Combine liquidity pool and order book activities
  const allActivities = [
    ...(liquidityTransactions?.items || []),
    ...(orders?.map(formatOrderBookActivity) || []),
  ].sort((a, b) => b.timestamp - a.timestamp); // Sort by timestamp (most recent first)

  const ActivityCard = ({ activity }) => {
    const getActivityIcon = (type) => {
      switch (type) {
        case 'swap':
          return '🔄';
        case 'addLiquidity':
          return '💧';
        case 'removeLiquidity':
          return '🔥';
        case 'claimRewards':
          return '🎁';
        case 'order':
          return '📊';
        default:
          return '📝';
      }
    };

    const formatAmount = (type, activity) => {
      switch (type) {
        case 'swap':
          return `${ethers.utils.formatEther(activity.amountIn || activity.amount)} ${token1} → 
                 ${activity.amountOut ? ethers.utils.formatEther(activity.amountOut) : '?'} ${token2}`;
        case 'addLiquidity':
        case 'removeLiquidity':
          return `${ethers.utils.formatEther(activity.amount1)} ${token1} + 
                 ${ethers.utils.formatEther(activity.amount2)} ${token2}`;
        case 'claimRewards':
          return `${ethers.utils.formatEther(activity.amount)} Rewards`;
        case 'order':
          return `${ethers.utils.formatEther(activity.amount)} ${token1} @ 
                 ${ethers.utils.formatEther(activity.price)} ${token2}`;
        default:
          return `${ethers.utils.formatEther(activity.amount || '0')}`;
      }
    };

    const handleReveal = async (txHash) => {
      if (activity.status === 'pending' && activity.isPrivate) {
        await dispatch(revealTransaction(txHash));
      }
    };

    return (
      <div className="relative bg-card rounded-xl p-6 transition-all duration-300 hover:shadow-lg input-glow">
        <div className="flex items-start gap-4">
          <div className="text-2xl">{getActivityIcon(activity.type)}</div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white">
              {activity.type === 'swap' ? 'Token Swap' :
               activity.type === 'addLiquidity' ? 'Added Liquidity' :
               activity.type === 'removeLiquidity' ? 'Removed Liquidity' :
               activity.type === 'claimRewards' ? 'Claimed Rewards' :
               activity.type === 'order' ? (activity.isBuyOrder ? 'Buy Order' : 'Sell Order') :
               'Activity'}
            </h3>
            <p className="text-gray-400 text-sm mt-1">
              {new Date(parseInt(activity.timestamp) * 1000).toLocaleString()}
            </p>
            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Amount:</span>
                <span className="text-white font-medium">
                  {formatAmount(activity.type, activity)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Transaction:</span>
                <a
                  href={`https://etherscan.io/tx/${activity.transaction}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-cyan-500"
                >
                  {activity.transaction.slice(0, 6)}...{activity.transaction.slice(-4)}
                </a>
              </div>
            </div>
          </div>
        </div>
        
        {activity.isPrivate && activity.status === 'pending' ? (
          <button
            onClick={() => handleReveal(activity.txHash)}
            className="btn-glow nav-button px-3 py-1 rounded-lg text-sm absolute top-4 right-4"
          >
            Reveal
          </button>
        ) : (
          <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-medium
            ${activity.status === 'confirmed' ? 'bg-card text-white border border-green-500' :
              activity.status === 'pending' ? 'bg-card text-white border border-yellow-500' :
              activity.status === 'failed' ? 'bg-card text-white border border-red-500' :
              'bg-card text-white border border-gray-500'}`}>
            {activity.status || 'Pending'}
          </div>
        )}
      </div>
    );
  };

  const StatCard = ({ title, value, icon, change }) => (
    <div className="bg-card rounded-xl p-6 input-glow transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <span className="text-2xl">{icon}</span>
      </div>
      <div className="text-2xl font-bold text-white mb-2">{value}</div>
      {change && (
        <div className={`text-sm ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
          {change >= 0 ? '↑' : '↓'} {Math.abs(change)}%
        </div>
      )}
    </div>
  );

  const getFilteredActivities = () => {
    let filtered = [...allActivities].slice(0, MAX_HISTORY);
    if (activeFilter !== 'all') {
      filtered = filtered.filter(tx => tx.type === activeFilter);
    }
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filtered.slice(startIndex, endIndex);
  };

  const totalPages = Math.ceil(
    Math.min(allActivities.length, MAX_HISTORY) / ITEMS_PER_PAGE
  );

  return (
    <div className="min-h-screen bg-sciFiBg">
      {/* Hero Section */}
      <section className="pt-20 pb-10 bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Activity History
          </h1>
          <p className="text-gray-400 text-lg">
            Your latest {MAX_HISTORY} activities on AngelSwap
          </p>
        </div>
      </section>

      {/* Stats Overview */}
      <section className="py-8 bg-[#1a1a1a]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Pool Share"
              value={`${poolDetails?.poolShare || '0'}%`}
              icon="🌊"
            />
            <StatCard
              title="Your Liquidity"
              value={`${ethers.utils.formatEther(userLiquidity1 || '0')} T1`}
              icon="💧"
            />
            <StatCard
              title="Balance"
              value={`${ethers.utils.formatEther(token1Balance || '0')} T1`}
              icon="💰"
            />
            <StatCard
              title="Pending Rewards"
              value={ethers.utils.formatEther(pendingRewards || '0')}
              icon="🎁"
            />
          </div>
        </div>
      </section>

      {/* Activity Feed */}
      <section className="py-8 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-8">
            {['all', 'swap', 'addLiquidity', 'removeLiquidity', 'claimRewards', 'order'].map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`btn-glow nav-button px-4 py-2 rounded-lg text-sm font-medium ${
                  activeFilter === filter ? 'tab-active' : ''
                }`}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1).replace(/([A-Z])/g, ' $1')}
              </button>
            ))}
          </div>

          {/* Activities */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500">Error loading activities: {error}</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {getFilteredActivities().map((activity, index) => (
                  <ActivityCard key={activity.transaction || index} activity={activity} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-8 gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="btn-glow nav-button px-4 py-2 rounded-lg disabled:opacity-50"
                  >
                    ←
                  </button>
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`btn-glow nav-button px-4 py-2 rounded-lg ${
                        currentPage === i + 1 ? 'tab-active' : ''
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="btn-glow nav-button px-4 py-2 rounded-lg disabled:opacity-50"
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
