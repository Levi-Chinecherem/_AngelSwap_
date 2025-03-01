import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchOrders, executeOrder, cancelOrder } from "../store/slices/orderBookSlice";
import { ethers } from "ethers";
import { toast } from "../components/ui/use-toast";

const OrderBook = () => {
  const dispatch = useDispatch();
  const { orders, loading, error } = useSelector((state) => state.orderBook);
  const { address: walletAddress } = useSelector((state) => state.wallet);
  const { securityEnabled } = useSelector((state) => state.security);
  const { poolDetails } = useSelector((state) => state.liquidityPool);
  const [buyOrders, setBuyOrders] = useState([]);
  const [sellOrders, setSellOrders] = useState([]);
  const [currentPageBuy, setCurrentPageBuy] = useState(1);
  const [currentPageSell, setCurrentPageSell] = useState(1);
  const ordersPerPage = 10;

  useEffect(() => {
    if (walletAddress) dispatch(fetchOrders(walletAddress));
  }, [dispatch, walletAddress]);

  useEffect(() => {
    const activeOrders = orders.filter((order) => order.status === "active");
    setBuyOrders(activeOrders.filter((o) => o.isBuyOrder).map(formatOrder).sort((a, b) => b.price - a.price));
    setSellOrders(activeOrders.filter((o) => !o.isBuyOrder).map(formatOrder).sort((a, b) => a.price - b.price));
  }, [orders]);

  const formatOrder = (order) => ({
    orderId: order.orderId,
    price: ethers.formatEther(order.price),
    amount: ethers.formatEther(order.amount),
    total: (ethers.formatEther(order.price) * ethers.formatEther(order.amount)).toFixed(6),
    type: order.isBuyOrder ? "buy" : "sell",
    isPrivate: order.isPrivate && securityEnabled,
    user: order.user,
  });

  const handleExecute = async (orderId) => {
    try {
      const marketLiquidity1 = ethers.parseEther(poolDetails.totalLiquidity1 || "0");
      const marketLiquidity2 = ethers.parseEther(poolDetails.totalLiquidity2 || "0");
      await dispatch(executeOrder({ orderId, marketLiquidity1, marketLiquidity2 })).unwrap();
      toast({ title: "Success", description: "Order executed!" });
      dispatch(fetchOrders(walletAddress));
    } catch (err) {
      toast({ title: "Error", description: err.message || "Execution failed", variant: "destructive" });
    }
  };

  const handleCancel = async (orderId) => {
    try {
      await dispatch(cancelOrder(orderId)).unwrap();
      toast({ title: "Success", description: "Order cancelled!" });
      dispatch(fetchOrders(walletAddress));
    } catch (err) {
      toast({ title: "Error", description: err.message || "Cancellation failed", variant: "destructive" });
    }
  };

  const renderOrders = (orders, currentPage) => {
    const start = (currentPage - 1) * ordersPerPage;
    const currentOrders = orders.slice(start, start + ordersPerPage);
    return currentOrders.map((order) => (
      <tr key={order.orderId} className="border-t border-gray-700">
        <td className={`px-6 py-4 ${order.type === "buy" ? "text-green-500" : "text-red-500"}`}>
          {securityEnabled && order.isPrivate ? "****" : order.price}
        </td>
        <td className="px-6 py-4 text-gray-300">{securityEnabled && order.isPrivate ? "****" : order.amount}</td>
        <td className="px-6 py-4 text-gray-300">{securityEnabled && order.isPrivate ? "****" : order.total}</td>
        {walletAddress && (
          <td className="px-6 py-4">
            {order.user === walletAddress && (
              <button onClick={() => handleCancel(order.orderId)} className="text-red-500 mr-2">Cancel</button>
            )}
            <button onClick={() => handleExecute(order.orderId)} className="text-green-500">Execute</button>
          </td>
        )}
      </tr>
    ));
  };

  const pagination = (orders, currentPage, setCurrentPage) => {
    const totalPages = Math.ceil(orders.length / ordersPerPage);
    return [...Array(totalPages)].map((_, i) => (
      <button
        key={i}
        className={`px-4 py-2 mx-1 ${i + 1 === currentPage ? "bg-white text-sciFiBg" : "bg-sciFiAccent text-white"} rounded-full`}
        onClick={() => setCurrentPage(i + 1)}
      >
        {i + 1}
      </button>
    ));
  };

  return (
    <div className="pt-20 pb-16 px-4 bg-sciFiBg text-sciFiText">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-sciFiAccent">Order Book</h1>
        {loading ? (
          <p className="text-center text-gray-400">Loading...</p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
              <h2 className="text-xl font-semibold text-sciFiAccent mb-4">Buy Orders</h2>
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-700">
                    <th className="px-6 py-2">Price</th>
                    <th className="px-6 py-2">Amount</th>
                    <th className="px-6 py-2">Total</th>
                    {walletAddress && <th className="px-6 py-2">Actions</th>}
                  </tr>
                </thead>
                <tbody>{renderOrders(buyOrders, currentPageBuy)}</tbody>
              </table>
              <div className="flex justify-center mt-4">{pagination(buyOrders, currentPageBuy, setCurrentPageBuy)}</div>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
              <h2 className="text-xl font-semibold text-sciFiAccent mb-4">Sell Orders</h2>
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-700">
                    <th className="px-6 py-2">Price</th>
                    <th className="px-6 py-2">Amount</th>
                    <th className="px-6 py-2">Total</th>
                    {walletAddress && <th className="px-6 py-2">Actions</th>}
                  </tr>
                </thead>
                <tbody>{renderOrders(sellOrders, currentPageSell)}</tbody>
              </table>
              <div className="flex justify-center mt-4">{pagination(sellOrders, currentPageSell, setCurrentPageSell)}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderBook;