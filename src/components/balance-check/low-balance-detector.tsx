'use client'

import { useState, useEffect } from 'react'
import { useWallet } from '../solana/privy-solana-adapter'
import { useGetUSDCBalance } from '../account/account-data-access'
import { useRouter } from 'next/navigation'
import { Wallet, AlertCircle } from 'lucide-react'
import { Button } from '../ui/button'
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog'
import { useFundWallet } from '@privy-io/react-auth/solana'
import { USDC_MINT_ADDRESS } from '../account/account-data-access'
import { useCluster } from '../cluster/cluster-data-access'
import toast from 'react-hot-toast'

interface LowBalanceDetectorProps {
  minimumUsdcRequired?: number;
  children: React.ReactNode;
}

export function LowBalanceDetector({ minimumUsdcRequired = 5, children }: LowBalanceDetectorProps) {
  const { publicKey, connected } = useWallet()
  const router = useRouter()
  const { cluster } = useCluster()
  const [showBalanceAlert, setShowBalanceAlert] = useState(false)
  const [transactionAttempted, setTransactionAttempted] = useState(false)
  const [requiredAmount, setRequiredAmount] = useState(minimumUsdcRequired)
  const [fundingLoading, setFundingLoading] = useState(false)
  
  // Get USDC balance
  const { data: usdcBalance, isLoading, refetch: refetchBalance } = useGetUSDCBalance({
    address: publicKey!
  })
  
  // Handle user exiting funding flow
  const handleUserExitedFunding = (params: { 
    address: string; 
    cluster: { name: string }; 
    fundingMethod: string | null; 
    balance: bigint | undefined 
  }) => {
    // Close the dialog
    setShowBalanceAlert(false)
    
    // Refresh balances
    refetchBalance()
    
    // Show toast
    toast.success('Balance updated')
  }
  
  // Enhanced useFundWallet hook with callback
  const { fundWallet } = useFundWallet({
    onUserExited: handleUserExitedFunding
  })

  // Listen for transaction attempts from window event
  useEffect(() => {
    const handleTransactionAttempt = (e: CustomEvent<{ requiredAmount: number }>) => {
      const requiredAmountValue = e.detail.requiredAmount || minimumUsdcRequired
      console.log('Transaction attempt event received:', e.detail)
      setRequiredAmount(requiredAmountValue)
      setTransactionAttempted(true)
      
      // Only show the alert if balance is too low and we're connected
      if (connected && publicKey && !isLoading && usdcBalance !== undefined) {
        console.log('Current USDC balance:', usdcBalance, 'Required:', requiredAmountValue)
        if (usdcBalance < requiredAmountValue) {
          console.log('Showing balance alert due to insufficient funds')
          setShowBalanceAlert(true)
        } else {
          console.log('Not showing balance alert - sufficient funds')
        }
      } else {
        console.log('Not checking balance - wallet not ready:', {
          connected,
          publicKey: publicKey?.toString(),
          isLoading,
          usdcBalance
        })
      }
    }

    // Add the event listener
    window.addEventListener('transaction-attempt' as any, handleTransactionAttempt as any)
    console.log('LowBalanceDetector: Added transaction-attempt event listener')
    
    // Cleanup
    return () => {
      window.removeEventListener('transaction-attempt' as any, handleTransactionAttempt as any)
    }
  }, [connected, publicKey, usdcBalance, isLoading, minimumUsdcRequired])

  // Check balance when it changes
  useEffect(() => {
    // Only show balance alert if we've attempted a transaction
    if (transactionAttempted && connected && publicKey && !isLoading && usdcBalance !== undefined) {
      if (usdcBalance < requiredAmount) {
        setShowBalanceAlert(true)
      } else {
        setShowBalanceAlert(false)
      }
    }
  }, [usdcBalance, isLoading, connected, publicKey, requiredAmount, transactionAttempted])

  const handleAddFunds = () => {
    if (!publicKey) {
      toast.error('Wallet not connected')
      return
    }
    
    try {
      setFundingLoading(true)
      
      // Determine cluster for funding
      const clusterName = cluster.network?.includes('mainnet') ? 'mainnet-beta' : 'devnet'
      
      // Use Privy's fundWallet with specialized options
      fundWallet(publicKey.toString(), {
        cluster: { name: clusterName },
        amount: String(requiredAmount), // Convert to string as required by Privy
        asset: 'USDC',
        defaultFundingMethod: 'card', // Direct to card funding immediately
        uiConfig: {
          receiveFundsTitle: "Add USDC to Your Wallet",
          receiveFundsSubtitle: "Fund your wallet with USDC to continue your transaction"
        }
      })
    } catch (error) {
      console.error('Error initiating funding:', error)
      toast.error('Failed to start funding process')
      // Fallback to redirect
      setShowBalanceAlert(false)
      router.push('/fund-wallet')
    } finally {
      setFundingLoading(false)
    }
  }

  const handleRedirectToFundingPage = () => {
    setShowBalanceAlert(false)
    router.push('/fund-wallet')
  }

  return (
    <>
      {children}
      
      {/* Debug indicator in development environment */}
      {process.env.NODE_ENV === 'development' && (
        <div style={{ 
          position: 'fixed', 
          bottom: '10px', 
          right: '10px', 
          background: 'rgba(0,0,0,0.7)', 
          color: 'lightgreen', 
          padding: '4px 8px', 
          borderRadius: '4px',
          fontSize: '10px',
          zIndex: 9999,
          pointerEvents: 'none'
        }}>
          Balance Detector Active
          {connected && <span> | {usdcBalance !== undefined ? `USDC: ${usdcBalance.toFixed(2)}` : 'Loading...'}</span>}
        </div>
      )}
      
      <Dialog open={showBalanceAlert} onOpenChange={setShowBalanceAlert}>
        <DialogContent className="sm:max-w-md">
          <DialogTitle className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            Insufficient USDC Balance
          </DialogTitle>
          <DialogDescription>
            <p className="mb-4">
              You need at least {requiredAmount} USDC to complete this transaction. 
              Your current balance is {isLoading ? '...' : usdcBalance?.toFixed(2) || '0'} USDC.
            </p>
            <div className="bg-blue-900/20 border border-blue-800 rounded-md p-3 mt-4">
              <h3 className="text-sm font-semibold text-blue-400 flex items-center gap-2">
                <Wallet className="h-4 w-4" />
                Why do I need USDC?
              </h3>
              <p className="text-xs text-gray-300 mt-2">
                USDC is required for all transactions on our platform. Adding funds to your wallet 
                will allow you to complete your transaction.
              </p>
            </div>
          </DialogDescription>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button 
              variant="outline"
              onClick={() => setShowBalanceAlert(false)}
              className="w-full sm:w-auto"
              disabled={fundingLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddFunds}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
              disabled={fundingLoading}
            >
              <Wallet className="h-4 w-4" />
              Add USDC with Privy
            </Button>
            <Button
              onClick={handleRedirectToFundingPage}
              variant="outline"
              className="w-full sm:w-auto border-blue-800 flex items-center gap-2"
              disabled={fundingLoading}
            >
              Go to Funding Page
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
} 