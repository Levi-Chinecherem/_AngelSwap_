import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchOrders } from "../store/slices/orderBookSlice"; // Import from orderBookSlice

const Mempool = () => {
  const dispatch = useDispatch();

  // Fetch order book activities
  const { orders, loading, error } = useSelector((state) => state.orderBook);

  // Local state for mempool transactions
  const [transactions, setTransactions] = useState([]);

  // Combine mempool transactions and order book activities
  useEffect(() => {
    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      signer.getAddress().then((address) => {
        dispatch(fetchOrders(address)); // Fetch order book activities
      });
    }
  }, [dispatch]);

  // Format order book activities for display
  useEffect(() => {
    if (orders && orders.length > 0) {
      const formattedOrders = orders.map((order) => ({
        id: order.orderId,
        sender: order.user,
        receiver: "Order Book",
        amount: `${ethers.utils.formatEther(order.amount)} ${order.token}`,
        price: `${ethers.utils.formatEther(order.price)}`,
        type: order.isBuyOrder ? "Buy Order" : "Sell Order",
        status: order.status,
      }));

      // Combine with existing mempool transactions
      setTransactions((prevTransactions) => [
        ...prevTransactions,
        ...formattedOrders,
      ]);
    }
  }, [orders]);

  const transactionsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);

  // Function to render the current page of transactions
  const renderTransactions = () => {
    const startIndex = (currentPage - 1) * transactionsPerPage;
    const endIndex = Math.min(startIndex + transactionsPerPage, transactions.length);
    const currentPageTransactions = transactions.slice(startIndex, endIndex);

    return currentPageTransactions.map((transaction) => (
      <tr className="border-t border-gray-700" key={transaction.id}>
        <td className="px-6 py-4 text-gray-300">{transaction.id}</td>
        <td className="px-6 py-4 text-gray-300">{transaction.sender}</td>
        <td className="px-6 py-4 text-gray-300">{transaction.receiver}</td>
        <td className="px-6 py-4 text-gray-300">{transaction.amount}</td>
        <td className="px-6 py-4 text-gray-300">{transaction.price}</td>
        <td className="px-6 py-4 text-gray-300">{transaction.type}</td>
        <td className="px-6 py-4 text-gray-300">{transaction.status}</td>
      </tr>
    ));
  };

  // Function to update pagination controls
  const updatePagination = () => {
    const totalPages = Math.ceil(transactions.length / transactionsPerPage);
    return [...Array(totalPages)].map((_, i) => {
      const pageNum = i + 1;
      return (
        <button
          key={pageNum}
          className={`px-4 py-2 mx-1 ${
            pageNum === currentPage ? "bg-white text-sciFiBg" : "bg-sciFiAccent text-sciFiBg"
          } rounded-full hover:bg-white transition`}
          onClick={() => setCurrentPage(pageNum)}
        >
          {pageNum}
        </button>
      );
    });
  };

  // Function to update the transaction count text
  const updateTransactionCount = () => {
    const totalTransactions = transactions.length;
    return totalTransactions === 0
      ? "No transactions available."
      : `Total Transactions: ${totalTransactions}`;
  };

  useEffect(() => {
    // Initial render
    renderTransactions();
  }, [currentPage, transactions]);

  return (
    <div className="bg-sciFiBg text-sciFiText font-sans">
      {/* Hero Section */}
      <section id="home" className="min-h-screen flex items-center justify-center text-center p-4 bg-gradient-to-b from-sciFiBg to-gray-900">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-6xl font-extrabold text-sciFiAccent mb-6">
            AngelSwap: Mempool Insights
          </h1>
          <p className="text-lg md:text-2xl text-gray-300 mb-8">
            Stay informed on pending transactions with real-time mempool data.
          </p>
        </div>
      </section>

      {/* Mempool Section */}
      <section id="mempool" className="py-16 bg-gray-800 text-gray-200">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8">Mempool Overview</h2>

          {/* Mempool Transactions Count */}
          <p className="text-lg mb-6">{updateTransactionCount()}</p>

          {/* Transactions Table */}
          <div className="overflow-x-auto shadow-xl rounded-lg bg-gray-900">
            <table className="min-w-full text-left">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-6 py-4 text-lg font-semibold text-sciFiAccent">Transaction ID</th>
                  <th className="px-6 py-4 text-lg font-semibold text-sciFiAccent">Sender</th>
                  <th className="px-6 py-4 text-lg font-semibold text-sciFiAccent">Receiver</th>
                  <th className="px-6 py-4 text-lg font-semibold text-sciFiAccent">Amount</th>
                  <th className="px-6 py-4 text-lg font-semibold text-sciFiAccent">Price</th>
                  <th className="px-6 py-4 text-lg font-semibold text-sciFiAccent">Type</th>
                  <th className="px-6 py-4 text-lg font-semibold text-sciFiAccent">Status</th>
                </tr>
              </thead>
              <tbody>{renderTransactions()}</tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="mt-8 flex justify-center space-x-2">{updatePagination()}</div>
        </div>
      </section>
    </div>
  );
};

export default Mempool;