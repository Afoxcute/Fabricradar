import { useState } from 'react';
import { useWallet } from '@/components/solana/privy-solana-adapter';
import { 
  mintCompressedTokens, 
  getCompressedTokenBalance, 
  CTOKEN_MINT_ADDRESS,
  createConnection
} from '@/utils/compressed-token';
import { PublicKey, Transaction, Connection } from '@solana/web3.js';
import toast from 'react-hot-toast';
import { useCluster } from '@/components/cluster/cluster-data-access';
import { useTransactionToast } from '@/components/ui/ui-layout';

export function useCompressedToken() {
  const [isLoading, setIsLoading] = useState(false);
  const [tokenBalance, setTokenBalance] = useState<number | null>(null);
  const [isBalanceLoading, setIsBalanceLoading] = useState(false);
  const { publicKey, sendTransaction } = useWallet();
  const { cluster } = useCluster();
  const transactionToast = useTransactionToast();

  /**
   * Mints compressed tokens to the connected wallet
   */
  const mintTokens = async (amount: number): Promise<string | null> => {
    if (!publicKey) {
      toast.error('Wallet not connected');
      return null;
    }

    try {
      setIsLoading(true);
      
      // The mintCompressedTokens function will create its own connection internally,
      // but we need to pass sendTransaction directly without any wrapper
      const signature = await mintCompressedTokens(
        publicKey,
        amount,
        sendTransaction
      );
      
      // Show success message with transaction ID
      transactionToast(signature);
      toast.success(`Successfully minted ${amount} tokens`);
      
      // Refresh the balance
      await fetchTokenBalance();
      
      return signature;
    } catch (error) {
      console.error('Error minting tokens:', error);
      toast.error(`Failed to mint tokens: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Fetches the current token balance
   */
  const fetchTokenBalance = async (): Promise<number> => {
    if (!publicKey) {
      setTokenBalance(null);
      return 0;
    }

    try {
      setIsBalanceLoading(true);
      const balance = await getCompressedTokenBalance(publicKey);
      setTokenBalance(balance);
      return balance;
    } catch (error) {
      console.error('Error fetching token balance:', error);
      return 0;
    } finally {
      setIsBalanceLoading(false);
    }
  };

  return {
    mintTokens,
    fetchTokenBalance,
    tokenBalance,
    isLoading,
    isBalanceLoading,
    mintAddress: CTOKEN_MINT_ADDRESS
  };
} 