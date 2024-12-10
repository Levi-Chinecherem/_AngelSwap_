import React, { useState, useEffect } from 'react';

const History = () => {
  const transactionsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const [transactions, setTransactions] = useState([]);
  
  useEffect(() => {
    // Sample transaction data
    const transactionData = [
      { id: '123456', from: '0xabc123...', to: '0xdef456...', amount: '1000 ABC', date: '2024-11-22 12:34' },
      { id: '123457', from: '0xghi789...', to: '0xjkl012...', amount: '2000 DEF', date: '2024-11-21 14:22' },
      { id: '123458', from: '0xghi789...', to: '0xjkl012...', amount: '1500 XYZ', date: '2024-11-20 11:10' },
      { id: '123459', from: '0xghi789...', to: '0xjkl012...', amount: '1000 ABC', date: '2024-11-19 10:10' },
      { id: '123460', from: '0xghi789...', to: '0xjkl012...', amount: '2500 GHI', date: '2024-11-18 09:15' },
      { id: '123461', from: '0xghi789...', to: '0xjkl012...', amount: '1000 ABC', date: '2024-11-17 08:00' },
      { id: '123462', from: '0xghi789...', to: '0xjkl012...', amount: '2000 DEF', date: '2024-11-16 07:10' },
      { id: '123463', from: '0xghi789...', to: '0xjkl012...', amount: '1500 XYZ', date: '2024-11-15 06:30' },
      { id: '123464', from: '0xghi789...', to: '0xjkl012...', amount: '1000 ABC', date: '2024-11-14 05:20' },
      { id: '123465', from: '0xghi789...', to: '0xjkl012...', amount: '2000 DEF', date: '2024-11-13 04:40' },
      { id: '123466', from: '0xghi789...', to: '0xjkl012...', amount: '2500 GHI', date: '2024-11-12 03:50' },
      { id: '123467', from: '0xghi789...', to: '0xjkl012...', amount: '1500 XYZ', date: '2024-11-11 02:45' },
      { id: '123468', from: '0xghi789...', to: '0xjkl012...', amount: '1000 ABC', date: '2024-11-10 01:30' },
      { id: '123469', from: '0xghi789...', to: '0xjkl012...', amount: '2000 DEF', date: '2024-11-09 00:40' },
      { id: '123470', from: '0xghi789...', to: '0xjkl012...', amount: '1500 XYZ', date: '2024-11-08 23:50' },
      { id: '123471', from: '0xghi789...', to: '0xjkl012...', amount: '1000 ABC', date: '2024-11-07 22:35' },
      { id: '123472', from: '0xghi789...', to: '0xjkl012...', amount: '2500 GHI', date: '2024-11-06 21:25' },
      { id: '123473', from: '0xghi789...', to: '0xjkl012...', amount: '1500 XYZ', date: '2024-11-05 20:15' },
      { id: '123474', from: '0xghi789...', to: '0xjkl012...', amount: '1000 ABC', date: '2024-11-04 19:05' },
      { id: '123475', from: '0xghi789...', to: '0xjkl012...', amount: '2000 DEF', date: '2024-11-03 18:00' },
    ];
    setTransactions(transactionData);
  }, []);

  const renderTransactions = () => {
    const startIndex = (currentPage - 1) * transactionsPerPage;
    const endIndex = Math.min(startIndex + transactionsPerPage, transactions.length);
    const currentPageTransactions = transactions.slice(startIndex, endIndex);

    return currentPageTransactions.map(transaction => (
      <tr key={transaction.id} className="border-t border-gray-700">
        <td className="px-6 py-4 text-gray-300">{transaction.id}</td>
        <td className="px-6 py-4 text-gray-300">{transaction.from}</td>
        <td className="px-6 py-4 text-gray-300">{transaction.to}</td>
        <td className="px-6 py-4 text-gray-300">{transaction.amount}</td>
        <td className="px-6 py-4 text-gray-300">{transaction.date}</td>
      </tr>
    ));
  };

  const totalPages = Math.ceil(transactions.length / transactionsPerPage);

  const updatePagination = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(
        <button
          key={i}
          className={`px-4 py-2 mx-1 rounded-full transition ${i === currentPage ? 'bg-white text-sciFiBg' : 'bg-sciFiAccent text-sciFiBg hover:bg-white'}`}
          onClick={() => setCurrentPage(i)}
        >
          {i}
        </button>
      );
    }
    return pages;
  };

  return (
    <div className="bg-sciFiBg text-sciFiText font-sans">
      
      {/* Hero Section */}
      <section id="history" className="min-h-screen flex items-center justify-center text-center p-4 bg-gradient-to-b from-sciFiBg to-gray-900">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-6xl font-extrabold text-sciFiAccent mb-4">AngelSwap Transaction History</h1>
          <p className="text-lg text-sciFiText mb-8">
            Scroll to view the detailed history of your token swaps and transactions on AngelSwap.
          </p>
        </div>
      </section>

      {/* History Table Section */}
      <section className="py-16 bg-gray-800 text-gray-200">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8">Your Transaction History</h2>
          <p id="transaction-count" className="text-lg mb-6">
            {transactions.length === 0 ? 'No transactions available.' : `Total Transactions: ${transactions.length}`}
          </p>

          <div className="overflow-x-auto shadow-xl rounded-lg bg-gray-900">
            <table className="min-w-full text-left">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-6 py-4 text-lg font-semibold text-sciFiAccent">Transaction ID</th>
                  <th className="px-6 py-4 text-lg font-semibold text-sciFiAccent">From</th>
                  <th className="px-6 py-4 text-lg font-semibold text-sciFiAccent">To</th>
                  <th className="px-6 py-4 text-lg font-semibold text-sciFiAccent">Amount</th>
                  <th className="px-6 py-4 text-lg font-semibold text-sciFiAccent">Date</th>
                </tr>
              </thead>
              <tbody>
                {renderTransactions()}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="mt-6 text-center">
            {updatePagination()}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-gray-900 text-center">
        <p className="text-gray-400 text-sm">© 2024 AngelSwap. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default History;
