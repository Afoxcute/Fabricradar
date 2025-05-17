'use client'

import { useWallet } from '@/components/solana/privy-solana-adapter'
import { useConnection } from '@solana/wallet-adapter-react'
import { useGetUSDCBalance } from '@/components/account/account-data-access'
import { verifyUsdcBalanceOrNotify } from '@/utils/balance-check'
import { useState, useCallback } from 'react'
import { useFundWallet } from '@privy-io/react-auth/solana'
import { USDC_MINT_ADDRESS } from '@/components/account/account-data-access'
import { useCluster } from '@/components/cluster/cluster-data-access'
import toast from 'react-hot-toast'

/**
 * Custom hook to check if a user has enough USDC balance and show funding popup if needed
 * 
 * @returns An object with functions and state for USDC balance checking
 */
export function useUsdcBalanceCheck() {
  const { publicKey, connected } = useWallet()
  const { connection } = useConnection()
  const { cluster } = useCluster()
  const [isChecking, setIsChecking] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  
  // Handle when user exits funding flow
  const handleUserExitedFunding = (params: { 
    address: string; 
    cluster: { name: string }; 
    fundingMethod: string | null; 
    balance: bigint | undefined 
  }) => {
    // Refresh data after funding
    setRefreshTrigger(prev => prev + 1)
    
    // Show success message if funds were added
    if (params.balance && params.balance > BigInt(0)) {
      toast.success('Wallet funded successfully!')
    }
  }
  
  // Get current USDC balance
  const { data: usdcBalance, isLoading, refetch } = useGetUSDCBalance({
    address: publicKey!
  })
  
  // Enhanced useFundWallet hook with callback
  const { fundWallet } = useFundWallet({
    onUserExited: handleUserExitedFunding
  })
  
  // Refresh balance when trigger changes
  const refreshBalance = useCallback(() => {
    if (connected && publicKey) {
      refetch()
    }
  }, [connected, publicKey, refetch])
  
  /**
   * Checks if user has enough USDC balance for a transaction
   * Shows funding popup automatically if balance is insufficient
   * 
   * @param requiredAmount Amount of USDC required
   * @returns Promise<boolean> - true if user has enough balance
   */
  const checkBalanceForTransaction = async (requiredAmount: number): Promise<boolean> => {
    if (!connected || !publicKey) {
      return false
    }
    
    setIsChecking(true)
    try {
      // First check balance using our utility
      const hasEnough = await verifyUsdcBalanceOrNotify(
        publicKey,
        requiredAmount,
        connection
      )
      
      // If balance is sufficient, return true
      if (hasEnough) {
        return true
      }
      
      // Trigger the UI to update
      refreshBalance()
      return false
    } catch (error) {
      console.error('Error checking USDC balance:', error)
      return false
    } finally {
      setIsChecking(false)
    }
  }
  
  /**
   * Manually fund wallet with Privy
   * Direct integration with Privy's funding flow
   * 
   * @param requiredAmount Amount of USDC required
   */
  const fundWalletDirectly = async (requiredAmount: number = 5) => {
    if (!connected || !publicKey) {
      toast.error('Wallet not connected')
      return
    }
    
    try {
      setIsChecking(true)
      
      // Determine cluster for funding
      const clusterName = cluster.network?.includes('mainnet') ? 'mainnet-beta' : 'devnet'
      
      // Call Privy's fundWallet with appropriate options
      await fundWallet(publicKey.toString(), {
        cluster: { name: clusterName },
        amount: String(requiredAmount),
        asset: 'USDC',
        defaultFundingMethod: 'card', // Direct to card funding immediately
        uiConfig: {
          receiveFundsTitle: "Add USDC to Your Wallet",
          receiveFundsSubtitle: "Fund your wallet with USDC to use our platform"
        }
      })
    } catch (error) {
      console.error('Error funding wallet:', error)
      toast.error('Could not start funding process')
    } finally {
      setIsChecking(false)
    }
  }
  
  /**
   * Manually trigger the funding popup
   * 
   * @param requiredAmount Amount of USDC required (default: 5)
   */
  const showFundingPopup = (requiredAmount: number = 5) => {
    // Create and dispatch the custom event
    const event = new CustomEvent('transaction-attempt', {
      detail: { requiredAmount }
    })
    window.dispatchEvent(event)
  }
  
  return {
    checkBalanceForTransaction,
    showFundingPopup,
    fundWalletDirectly, // New direct method using Privy's fundWallet
    currentUsdcBalance: usdcBalance,
    refreshBalance, // Expose refresh function
    isLoading: isLoading || isChecking,
    isConnected: connected && !!publicKey
  }
} 