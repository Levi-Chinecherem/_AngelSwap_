import { useDispatch, useSelector } from 'react-redux';
import {
  toggleSecurity,
  revealTransaction,
  swapTokens,
  provideLiquidity,
  removeLiquidity,
  fetchPendingRewards,
  fetchAllTokens,
} from '../store/slices/liquidityPoolSlice';

const useLiquidityPool = () => {
  const dispatch = useDispatch();
  const liquidityPoolState = useSelector((state) => state.liquidityPool);

  return {
    ...liquidityPoolState,
    toggleSecurity: (enabled) => dispatch(toggleSecurity(enabled)),
    revealTransaction: (txHash) => dispatch(revealTransaction(txHash)),
    fetchAllTransactions: (userAddress) =>
      dispatch(fetchAllTransactions(userAddress)),
    swapTokens: (fromToken, amountIn, minAmountOut) =>
      dispatch(swapTokens({ fromToken, amountIn, minAmountOut })),
    provideLiquidity: (amount1, amount2) =>
      dispatch(provideLiquidity({ amount1, amount2 })),
    removeLiquidity: (amount1, amount2) =>
      dispatch(removeLiquidity({ amount1, amount2 })),
    fetchPendingRewards: (userAddress) =>
      dispatch(fetchPendingRewards(userAddress)),
    fetchAllTokens: () => dispatch(fetchAllTokens()),
  };
};

export default useLiquidityPool;
// Compare this snippet from frontend/src/components/LiquidityPool.js: