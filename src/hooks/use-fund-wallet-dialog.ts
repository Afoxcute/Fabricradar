'use client'

import { useCallback } from 'react'
import { useUsdcBalanceCheck } from './use-usdc-balance-check'
import { useCluster } from '@/components/cluster/cluster-data-access'
import { useWallet } from '@/components/solana/privy-solana-adapter'
import toast from 'react-hot-toast'

/**
 * Custom hook to easily trigger wallet funding from any component
 * Provides a simple function to handle wallet funding
 */
export function useFundWalletDialog() {
  const { fundWalletDirectly } = useUsdcBalanceCheck();
  const { publicKey, connected } = useWallet();
  const { cluster } = useCluster();
  
  /**
   * Trigger Privy's wallet funding dialog directly
   * 
   * @param amount The amount of USDC to fund (default: 10)
   * @param onSuccess Optional callback when funding is successful
   * @returns Promise<boolean> - true if funding process started
   */
  const triggerFunding = useCallback(async (amount: number = 10, onSuccess?: () => void) => {
    if (!connected || !publicKey) {
      toast.error('Please connect your wallet first');
      return false;
    }
    
    try {
      // Call the direct funding method with the specified amount
      await fundWalletDirectly(amount);
      
      // Success is handled by the hook's callbacks
      if (onSuccess) {
        onSuccess();
      }
      return true;
    } catch (error) {
      console.error('Error initiating wallet funding:', error);
      toast.error('Could not start funding process');
      return false;
    }
  }, [connected, publicKey, fundWalletDirectly]);
  
  /**
   * Show the low balance popup with specified required amount
   * 
   * @param amount The required USDC amount (default: 10)
   */
  const showFundingPopup = useCallback((amount: number = 10) => {
    // Create and dispatch the custom event to trigger LowBalanceDetector
    const event = new CustomEvent('transaction-attempt', {
      detail: { requiredAmount: amount }
    });
    window.dispatchEvent(event);
  }, []);
  
  // Return functions to trigger funding
  return {
    triggerFunding,
    showFundingPopup,
    isWalletConnected: connected && !!publicKey
  };
} 