import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ethers } from "ethers";
import { fetchOrders, clearError } from "../store/slices/orderBookSlice";
import { fetchAllTokens } from "../store/slices/liquidityPoolSlice";
import { toast } from "../components/ui/use-toast";
import { LIQUIDITY_POOL_ADDRESS, ORDER_BOOK_ADDRESS } from "../contracts/addresses";
import OrderBookArtifact from "../contracts/OrderBook.sol/OrderBook.json";

const Mempool = () => {
  const dispatch = useDispatch();
  const { address: walletAddress } = useSelector((state) => state.wallet);
  const { orders, loading: orderLoading, error: orderError } = useSelector((state) => state.orderBook);
  const { tokens, loading: tokenLoading, error: tokenError } = useSelector((state) => state.liquidityPool);

  const [pendingTxs, setPendingTxs] = useState([]);
  const [activeOrders, setActiveOrders] = useState([]);
  const transactionsPerPage = 10;
  const [txPage, setTxPage] = useState(1);
  const [orderPage, setOrderPage] = useState(1);

  const loading = orderLoading || tokenLoading;
  const error = orderError || tokenError;

  const OrderBookABI = OrderBookArtifact.abi;
  const orderBookInterface = new ethers.Interface(OrderBookABI);
  const placeOrderSelector = orderBookInterface.getFunction("placeOrder").selector;

  useEffect(() => {
    const fetchData = async () => {
      if (!walletAddress) {
        toast({
          title: "Wallet Not Connected",
          description: "Please connect your wallet to view mempool and orders.",
          variant: "destructive",
          duration: 3000,
        });
        return;
      }
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        await Promise.all([
          dispatch(fetchOrders(walletAddress)).unwrap(),
          dispatch(fetchAllTokens()).unwrap(),
        ]);

        const pendingBlock = await provider.getBlock("pending");
        if (pendingBlock && pendingBlock.transactions) {
          const formattedPendingTxs = await Promise.all(
            pendingBlock.transactions.slice(0, 10).map(async (txHash) => {
              const tx = await provider.getTransaction(txHash);
              const amount = tx.value ? ethers.formatEther(tx.value) : "0";

              // Check if transaction is a placeOrder call to OrderBook
              if (tx.to === ORDER_BOOK_ADDRESS && tx.data.startsWith(placeOrderSelector)) {
                try {
                  const decoded = orderBookInterface.parseTransaction({ data: tx.data });
                  const isPrivate = decoded.args[4]; // isPrivate is the 5th parameter
                  if (isPrivate && tx.from.toLowerCase() !== walletAddress.toLowerCase()) {
                    return {
                      id: txHash,
                      sender: "******",
                      receiver: "******",
                      amount: "******",
                      type: "Private Order Tx",
                      status: "pending",
                    };
                  }
                  return {
                    id: txHash,
                    sender: tx.from,
                    receiver: tx.to || "Unknown",
                    amount: `${ethers.formatEther(decoded.args[1])} ${getTokenSymbol(decoded.args[0])}`, // amount, token
                    type: decoded.args[3] ? "Buy Order Tx" : "Sell Order Tx", // isBuyOrder
                    status: "pending",
                  };
                } catch (err) {
                  console.error(`Error decoding transaction ${txHash}:`, err);
                  return null; // Exclude if decoding fails
                }
              }

              // Include non-zero ETH txs or those to relevant contracts
              if (amount !== "0" || tx.to === LIQUIDITY_POOL_ADDRESS || tx.to === ORDER_BOOK_ADDRESS) {
                return {
                  id: txHash,
                  sender: tx.from,
                  receiver: tx.to || "Unknown",
                  amount,
                  type: "Pending Tx",
                  status: "pending",
                };
              }
              return null;
            })
          );
          setPendingTxs(formattedPendingTxs.filter((tx) => tx !== null));
        }
      } catch (err) {
        toast({
          title: "Error",
          description: err.message || "Failed to fetch mempool data",
          variant: "destructive",
          duration: 3000,
        });
        dispatch(clearError());
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, [dispatch, walletAddress, placeOrderSelector]);

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
        duration: 3000,
      });
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const getTokenSymbol = (tokenAddress) =>
    tokens.find((t) => t.address === tokenAddress)?.symbol || "UNKNOWN";

  useEffect(() => {
    if (orders && orders.length > 0) {
      const formattedOrders = orders
        .filter((order) => order.status === "active" && order.amount !== "0")
        .map((order) => {
          if (order.isPrivate && order.user.toLowerCase() !== walletAddress?.toLowerCase()) {
            return {
              id: order.orderId,
              sender: "******",
              receiver: "******",
              amount: "******",
              price: "******",
              type: "Private Order",
              status: order.status,
            };
          }
          return {
            id: order.orderId,
            sender: order.user,
            receiver: "Order Book",
            amount: `${ethers.formatEther(order.amount)} ${getTokenSymbol(order.token)}`,
            price: ethers.formatEther(order.price),
            type: order.isBuyOrder ? "Buy Order" : "Sell Order",
            status: order.status,
          };
        });
      setActiveOrders(formattedOrders);
    }
  }, [orders, tokens, walletAddress]);

  const renderPendingTxs = () => {
    const startIndex = (txPage - 1) * transactionsPerPage;
    const endIndex = Math.min(startIndex + transactionsPerPage, pendingTxs.length);
    const currentTxs = pendingTxs.slice(startIndex, endIndex);

    return currentTxs.map((tx) => (
      <tr className="border-t border-gray-700" key={tx.id}>
        <td className="px-6 py-4 text-gray-300">{tx.id.slice(0, 6)}...</td>
        <td className="px-6 py-4 text-gray-300">{tx.sender}</td>
        <td className="px-6 py-4 text-gray-300">{tx.receiver}</td>
        <td className="px-6 py-4 text-gray-300">{tx.amount}</td>
        <td className="px-6 py-4 text-gray-300">-</td>
        <td className="px-6 py-4 text-gray-300">{tx.type}</td>
        <td className="px-6 py-4 text-gray-300">{tx.status}</td>
      </tr>
    ));
  };

  const renderOrders = () => {
    const startIndex = (orderPage - 1) * transactionsPerPage;
    const endIndex = Math.min(startIndex + transactionsPerPage, activeOrders.length);
    const currentOrders = activeOrders.slice(startIndex, endIndex);

    return currentOrders.map((order) => (
      <tr className="border-t border-gray-700" key={order.id}>
        <td className="px-6 py-4 text-gray-300">{order.id}</td>
        <td className="px-6 py-4 text-gray-300">{order.sender}</td>
        <td className="px-6 py-4 text-gray-300">{order.receiver}</td>
        <td className="px-6 py-4 text-gray-300">{order.amount}</td>
        <td className="px-6 py-4 text-gray-300">{order.price}</td>
        <td className="px-6 py-4 text-gray-300">{order.type}</td>
        <td className="px-6 py-4 text-gray-300">{order.status}</td>
      </tr>
    ));
  };

  const updatePagination = (items, currentPage, setPage) => {
    const totalPages = Math.ceil(items.length / transactionsPerPage);
    return [...Array(totalPages)].map((_, i) => (
      <button
        key={i + 1}
        className={`btn-glow nav-button px-4 py-2 mx-1 rounded-lg ${
          currentPage === i + 1 ? "bg-sciFiAccent text-sciFiBg" : "text-white"
        }`}
        onClick={() => setPage(i + 1)}
      >
        {i + 1}
      </button>
    ));
  };

  return (
    <div className="bg-sciFiBg text-sciFiText font-sans">
      <section className="min-h-screen flex items-center justify-center text-center p-4 bg-gradient-to-b from-sciFiBg to-gray-900">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-6xl font-extrabold text-sciFiAccent mb-6">
            AngelSwap: Mempool Insights
          </h1>
          <p className="text-lg md:text-2xl text-gray-300 mb-8">
            Real-time view of pending blockchain transactions and active orders.
          </p>
        </div>
      </section>

      <section className="py-16 bg-gray-800 text-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sciFiAccent"></div>
            </div>
          ) : (
            <>
              {/* Pending Blockchain Transactions */}
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4 text-sciFiAccent">Pending Blockchain Transactions</h2>
                <p className="text-lg mb-6">
                  {pendingTxs.length === 0 ? "No pending transactions." : `Pending Transactions: ${pendingTxs.length}`}
                </p>
                {pendingTxs.length > 0 && (
                  <div className="overflow-x-auto shadow-xl rounded-lg bg-gray-900 mb-8">
                    <table className="min-w-full text-left">
                      <thead className="bg-gray-800">
                        <tr>
                          <th className="px-6 py-4 text-lg font-semibold text-sciFiAccent">Tx ID</th>
                          <th className="px-6 py-4 text-lg font-semibold text-sciFiAccent">Sender</th>
                          <th className="px-6 py-4 text-lg font-semibold text-sciFiAccent">Receiver</th>
                          <th className="px-6 py-4 text-lg font-semibold text-sciFiAccent">Amount</th>
                          <th className="px-6 py-4 text-lg font-semibold text-sciFiAccent">Price</th>
                          <th className="px-6 py-4 text-lg font-semibold text-sciFiAccent">Type</th>
                          <th className="px-6 py-4 text-lg font-semibold text-sciFiAccent">Status</th>
                        </tr>
                      </thead>
                      <tbody>{renderPendingTxs()}</tbody>
                    </table>
                  </div>
                )}
                {pendingTxs.length > transactionsPerPage && (
                  <div className="flex justify-center space-x-2">
                    {updatePagination(pendingTxs, txPage, setTxPage)}
                  </div>
                )}
              </div>

              {/* Active Order Book Orders */}
              <div className="text-center">
                <h2 className="text-3xl font-bold mb-4 text-sciFiAccent">Active Order Book Orders</h2>
                <p className="text-lg mb-6">
                  {activeOrders.length === 0 ? "No active orders." : `Active Orders: ${activeOrders.length}`}
                </p>
                {activeOrders.length > 0 && (
                  <div className="overflow-x-auto shadow-xl rounded-lg bg-gray-900">
                    <table className="min-w-full text-left">
                      <thead className="bg-gray-800">
                        <tr>
                          <th className="px-6 py-4 text-lg font-semibold text-sciFiAccent">Order ID</th>
                          <th className="px-6 py-4 text-lg font-semibold text-sciFiAccent">Sender</th>
                          <th className="px-6 py-4 text-lg font-semibold text-sciFiAccent">Receiver</th>
                          <th className="px-6 py-4 text-lg font-semibold text-sciFiAccent">Amount</th>
                          <th className="px-6 py-4 text-lg font-semibold text-sciFiAccent">Price</th>
                          <th className="px-6 py-4 text-lg font-semibold text-sciFiAccent">Type</th>
                          <th className="px-6 py-4 text-lg font-semibold text-sciFiAccent">Status</th>
                        </tr>
                      </thead>
                      <tbody>{renderOrders()}</tbody>
                    </table>
                  </div>
                )}
                {activeOrders.length > transactionsPerPage && (
                  <div className="mt-8 flex justify-center space-x-2">
                    {updatePagination(activeOrders, orderPage, setOrderPage)}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default Mempool;