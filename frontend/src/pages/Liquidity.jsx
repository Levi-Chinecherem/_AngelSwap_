import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchTokenBalances,
  provideLiquidity,
  removeLiquidity,
  fetchPoolDetails,
  fetchAllTokens
} from '../store/slices/liquidityPoolSlice';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';

export default function Liquidity() {
  const [activeTab, setActiveTab] = useState('addLiquidity');
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [removeLiquidityAmounts, setRemoveLiquidityAmounts] = useState({});

  const dispatch = useDispatch();
  const {
    token1,
    token2,
    totalLiquidity1,
    totalLiquidity2,
    userLiquidity1,
    userLiquidity2,
    token1Balance,
    token2Balance,
    poolDetails,
    loading,
    error
  } = useSelector((state) => state.liquidityPool);

  useEffect(() => {
    const initializePage = async () => {
      try {
        // Get user's address from connected wallet
        const userAddress = window.ethereum.selectedAddress;
        if (!userAddress) {
          toast({
            title: "Wallet Not Connected",
            description: "Please connect your wallet to continue",
            variant: "destructive"
          });
          return;
        }

        // Fetch initial data
        await Promise.all([
          dispatch(fetchAllTokens()),
          dispatch(fetchTokenBalances(userAddress)),
          dispatch(fetchPoolDetails(userAddress))
        ]);
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to load liquidity pool data",
          variant: "destructive"
        });
      }
    };

    initializePage();
  }, [dispatch]);

  // Watch for wallet changes
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts[0]) {
          dispatch(fetchTokenBalances(accounts[0]));
          dispatch(fetchPoolDetails(accounts[0]));
        }
      });
    }
  }, [dispatch]);

  const handleAddLiquidity = async () => {
    try {
      const fromAmountValue = parseFloat(fromAmount) || 0;
      const toAmountValue = parseFloat(toAmount) || 0;

      if (fromAmountValue <= 0 || toAmountValue <= 0) {
        toast({
          title: "Invalid Input",
          description: "Please enter valid amounts for both tokens",
          variant: "destructive"
        });
        return;
      }

      if (fromAmountValue > token1Balance || toAmountValue > token2Balance) {
        toast({
          title: "Insufficient Balance",
          description: "You don't have enough tokens for this transaction",
          variant: "destructive"
        });
        return;
      }

      const result = await dispatch(provideLiquidity({ 
        amount1: fromAmountValue, 
        amount2: toAmountValue 
      })).unwrap();

      toast({
        title: "Success",
        description: "Liquidity added successfully",
      });

      // Reset form and refresh data
      setFromAmount('');
      setToAmount('');
      const userAddress = window.ethereum.selectedAddress;
      dispatch(fetchTokenBalances(userAddress));
      dispatch(fetchPoolDetails(userAddress));

    } catch (err) {
      toast({
        title: "Transaction Failed",
        description: err.message || "Failed to add liquidity",
        variant: "destructive"
      });
    }
  };

  const handleRemoveLiquidity = async (liquidityId) => {
    try {
      const amount1 = parseFloat(removeLiquidityAmounts[liquidityId]) || 0;
      const amount2 = (amount1 / userLiquidity1) * userLiquidity2;

      if (amount1 <= 0 || amount2 <= 0) {
        toast({
          title: "Invalid Amount",
          description: "Please enter a valid amount to remove",
          variant: "destructive"
        });
        return;
      }

      if (amount1 > userLiquidity1 || amount2 > userLiquidity2) {
        toast({
          title: "Insufficient Liquidity",
          description: "You don't have enough liquidity to remove",
          variant: "destructive"
        });
        return;
      }

      await dispatch(removeLiquidity({ amount1, amount2 })).unwrap();

      toast({
        title: "Success",
        description: "Liquidity removed successfully",
      });

      // Reset form and refresh data
      setRemoveLiquidityAmounts({});
      const userAddress = window.ethereum.selectedAddress;
      dispatch(fetchTokenBalances(userAddress));
      dispatch(fetchPoolDetails(userAddress));

    } catch (err) {
      toast({
        title: "Transaction Failed",
        description: err.message || "Failed to remove liquidity",
        variant: "destructive"
      });
    }
  };

  const updateInputAmount = (percentage, liquidityId) => {
    const totalAmount = userLiquidity1;
    const amountToFill = (percentage / 100) * totalAmount;
    setRemoveLiquidityAmounts((prev) => ({
      ...prev,
      [liquidityId]: amountToFill.toFixed(2),
    }));
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (error) {
    return (
      <div className="text-red-500 text-center p-4">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="bg-sciFiBg text-sciFiText font-sans">
      <div className="container mx-auto px-4 py-8 pt-20">
        <div className="flex justify-center">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <div className="flex justify-between mb-4">
                <button
                  className={`btn-glow nav-button py-2 px-6 rounded-lg font-bold text-lg ${
                    activeTab === 'addLiquidity' ? 'tab-active' : ''
                  }`}
                  onClick={() => setActiveTab('addLiquidity')}
                >
                  Add
                </button>
                <button
                  className={`btn-glow nav-button py-2 px-6 rounded-lg font-bold text-lg ${
                    activeTab === 'removeLiquidity' ? 'tab-active' : ''
                  }`}
                  onClick={() => setActiveTab('removeLiquidity')}
                >
                  Remove
                </button>
              </div>
            </CardHeader>

            <CardContent>
              {activeTab === 'addLiquidity' ? (
                <div>
                  <p className="text-white font-semibold text-lg mb-4">Add Liquidity</p>

                  <div className="flex flex-col mb-4">
                    <div className="flex items-center mb-3">
                      <label className="text-white font-semibold text-lg">From</label>
                      <span className="text-white ml-2">Balance: {token1Balance} {token1?.symbol}</span>
                    </div>
                    <div className="flex items-center mb-4">
                      <input
                        type="number"
                        className="input-glow bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 w-full"
                        placeholder="0.0"
                        value={fromAmount}
                        onChange={(e) => setFromAmount(e.target.value)}
                      />
                      <span className="text-white ml-2">{token1?.symbol}</span>
                    </div>
                  </div>

                  <div className="flex justify-center items-center mb-4">
                    <span className="text-2xl text-white font-bold">+</span>
                  </div>

                  <div className="flex flex-col mb-4">
                    <div className="flex items-center mb-3">
                      <label className="text-white font-semibold text-lg">To</label>
                      <span className="text-white ml-2">Balance: {token2Balance} {token2?.symbol}</span>
                    </div>
                    <div className="flex items-center mb-4">
                      <input
                        type="number"
                        className="input-glow bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 w-full"
                        placeholder="0.0"
                        value={toAmount}
                        onChange={(e) => setToAmount(e.target.value)}
                      />
                      <span className="text-white ml-2">{token2?.symbol}</span>
                    </div>
                  </div>

                  {(parseFloat(fromAmount) > 0 && parseFloat(toAmount) > 0) && (
                    <div id="poolDetails">
                      <h3 className="text-cyan-500 font-bold text-lg mb-2 border-b border-cyan-500 pb-1">
                        Prices and Pool Share
                      </h3>
                      <div className="bg-card p-4 rounded-lg shadow-lg mb-4">
                        <p className="text-white text-sm flex items-center justify-between">
                          <span>{token1?.symbol} per {token2?.symbol}:</span>
                          <span className="text-cyan-500 font-semibold">{poolDetails.token1PerToken2}</span>
                        </p>
                        <p className="text-white text-sm flex items-center justify-between">
                          <span>{token2?.symbol} per {token1?.symbol}:</span>
                          <span className="text-cyan-500 font-semibold">{poolDetails.token2PerToken1}</span>
                        </p>
                        <p className="text-white text-sm flex items-center justify-between">
                          <span>Share of Pool:</span>
                          <span className="text-cyan-500 font-semibold">{poolDetails.poolShare}%</span>
                        </p>
                      </div>
                    </div>
                  )}
                  
                  <button
                    className="btn-glow nav-button py-3 px-6 rounded-lg w-full"
                    onClick={handleAddLiquidity}
                    disabled={loading}
                  >
                    {loading ? 'Processing...' : 'Add Liquidity'}
                  </button>
                </div>
              ) : (
                <div>
                  <p className="text-white font-semibold text-lg mb-4">Remove Liquidity</p>
                  <div id="liquidityList">
                    <div className="liquidity-item bg-card p-4 rounded-lg mb-4">
                      <h3 className="text-cyan-500 font-bold mb-2">
                        Liquidity Pair: {token1?.symbol}/{token2?.symbol}
                      </h3>
                      <p className="text-white text-sm">
                        Your Liquidity: {userLiquidity1} {token1?.symbol} and {userLiquidity2} {token2?.symbol}
                      </p>
                      <div className="mt-4">
                        <p className="text-white text-sm mb-2">Amount to Remove:</p>
                        <div className="flex items-center mb-2">
                          <input
                            type="number"
                            placeholder="Enter amount"
                            className="input-glow bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-2 w-full"
                            value={removeLiquidityAmounts[1] || ''}
                            onChange={(e) => setRemoveLiquidityAmounts((prev) => ({ 
                              ...prev, 
                              [1]: e.target.value 
                            }))}
                          />
                        </div>
                        <div className="flex space-x-4 mb-4">
                          {[25, 50, 75, 100].map((percentage) => (
                            <button
                              key={percentage}
                              className="bg-cyan-500 text-white px-4 py-2 rounded-lg"
                              onClick={() => updateInputAmount(percentage, 1)}
                            >
                              {percentage}%
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <button
                    className="btn-glow nav-button py-3 px-6 rounded-lg w-full"
                    onClick={() => handleRemoveLiquidity(1)}
                    disabled={loading}
                  >
                    {loading ? 'Processing...' : 'Remove Liquidity'}
                  </button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
