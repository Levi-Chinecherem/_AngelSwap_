import React, { useState, useEffect } from 'react';

const OrderBook = () => {
  const [buyOrders, setBuyOrders] = useState([]);
  const [sellOrders, setSellOrders] = useState([]);
  const [currentPageBuy, setCurrentPageBuy] = useState(1);
  const [currentPageSell, setCurrentPageSell] = useState(1);
  const ordersPerPage = 10;

  // Mock Data Generation
  const generateMockData = (type) => {
    const data = [];
    for (let i = 0; i < 50; i++) {
      const price = (0.001 + Math.random() * 0.001).toFixed(4);
      const amount = Math.floor(Math.random() * 500) + 1;
      const total = (price * amount).toFixed(2);
      data.push({ price, amount, total, type });
    }
    return data;
  };

  // Pagination Logic
  const updatePagination = (orders, currentPage, setCurrentPage) => {
    const totalPages = Math.ceil(orders.length / ordersPerPage);
    return [...Array(totalPages)].map((_, index) => (
      <button
        key={index}
        className={`px-4 py-2 mx-1 ${index + 1 === currentPage ? 'bg-white text-sciFiBg' : 'bg-sciFiAccent text-sciFiBg'} rounded-full hover:bg-white transition`}
        onClick={() => setCurrentPage(index + 1)}
      >
        {index + 1}
      </button>
    ));
  };

  // Render Orders
  const renderOrders = (orders, currentPage) => {
    const startIndex = (currentPage - 1) * ordersPerPage;
    const endIndex = Math.min(startIndex + ordersPerPage, orders.length);
    const currentPageOrders = orders.slice(startIndex, endIndex);

    return currentPageOrders.map((order, index) => (
      <tr key={index} className="border-t border-gray-700">
        <td className={`px-6 py-4 ${order.type === 'buy' ? 'text-buyColor' : 'text-sellColor'}`}>{order.price}</td>
        <td className="px-6 py-4 text-gray-300">{order.amount}</td>
        <td className="px-6 py-4 text-gray-300">{order.total}</td>
      </tr>
    ));
  };

  // Initial render for Buy and Sell orders
  useEffect(() => {
    setBuyOrders(generateMockData('buy'));
    setSellOrders(generateMockData('sell'));
  }, []);

  return (
    <div className="bg-sciFiBg text-sciFiText font-sans">
      

      {/* Order Book Section */}
      <section className="pt-20 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8 text-sciFiAccent">Order Book</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Buy Orders */}
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
              <h2 className="text-xl font-semibold text-sciFiAccent mb-4">Buy Orders</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-sciFiBg text-sciFiText text-center rounded-lg">
                  <thead>
                    <tr className="bg-gray-700">
                      <th className="px-4 py-2">Price</th>
                      <th className="px-4 py-2">Amount</th>
                      <th className="px-4 py-2">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {renderOrders(buyOrders, currentPageBuy)}
                  </tbody>
                </table>
                <div className="flex justify-center mt-4">
                  {updatePagination(buyOrders, currentPageBuy, setCurrentPageBuy)}
                </div>
              </div>
            </div>
            {/* Sell Orders */}
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
              <h2 className="text-xl font-semibold text-sciFiAccent mb-4">Sell Orders</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-sciFiBg text-sciFiText text-center rounded-lg">
                  <thead>
                    <tr className="bg-gray-700">
                      <th className="px-4 py-2">Price</th>
                      <th className="px-4 py-2">Amount</th>
                      <th className="px-4 py-2">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {renderOrders(sellOrders, currentPageSell)}
                  </tbody>
                </table>
                <div className="flex justify-center mt-4">
                  {updatePagination(sellOrders, currentPageSell, setCurrentPageSell)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default OrderBook;
