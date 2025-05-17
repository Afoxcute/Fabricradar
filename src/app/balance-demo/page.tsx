'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { useWallet } from '@/components/solana/privy-solana-adapter'
import { WalletButton } from '@/components/solana/solana-provider'
import { AppHero } from '@/components/ui/ui-layout'
import { useUsdcBalanceCheck } from '@/hooks/use-usdc-balance-check'
import { Wallet, DollarSign, CreditCard, AlertCircle, Loader2, RefreshCw, ArrowRight, Banknote } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function BalanceDemo() {
  const { publicKey, connected } = useWallet()
  const [requiredAmount, setRequiredAmount] = useState(10)
  const [isSimulating, setIsSimulating] = useState(false)
  const [isDirectFunding, setIsDirectFunding] = useState(false)
  
  const { 
    checkBalanceForTransaction, 
    showFundingPopup,
    fundWalletDirectly,
    refreshBalance,
    currentUsdcBalance, 
    isLoading 
  } = useUsdcBalanceCheck()

  // Set up auto-refresh every 15 seconds
  useEffect(() => {
    if (connected && publicKey) {
      const intervalId = setInterval(() => {
        refreshBalance()
      }, 15000)
      
      return () => clearInterval(intervalId)
    }
  }, [connected, publicKey, refreshBalance])

  const handleSimulateTransaction = async () => {
    if (!connected || !publicKey) {
      toast.error('Please connect your wallet first')
      return
    }
    
    setIsSimulating(true)
    try {
      // Check if user has enough USDC balance
      const hasEnoughBalance = await checkBalanceForTransaction(requiredAmount)
      
      if (hasEnoughBalance) {
        toast.success(`Success! You have enough USDC (${currentUsdcBalance?.toFixed(2)} USDC) for this transaction.`)
      }
      // If they don't have enough, the popup is automatically shown
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsSimulating(false)
    }
  }
  
  const handleShowFundingPopup = () => {
    showFundingPopup(requiredAmount)
  }
  
  const handleDirectFunding = async () => {
    if (!connected || !publicKey) {
      toast.error('Please connect your wallet first')
      return
    }
    
    setIsDirectFunding(true)
    try {
      // Use Privy's direct funding method
      await fundWalletDirectly(requiredAmount)
      // No need for success toast as it's handled in the hook callback
    } catch (error) {
      console.error('Error with direct funding:', error)
    } finally {
      setIsDirectFunding(false)
    }
  }
  
  const handleRefreshBalance = () => {
    refreshBalance()
    toast.success('Refreshing balance...')
  }

  return (
    <div>
      <AppHero
        title="USDC Balance Check Demo"
        subtitle="Test automatic USDC balance checking and funding mechanisms"
      >
        {!connected && (
          <div className="mt-6">
            <WalletButton />
          </div>
        )}
      </AppHero>

      <div className="max-w-lg mx-auto py-8">
        {connected ? (
          <>
            <div className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <div className="badge badge-success">Connected</div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleRefreshBalance}
                  className="flex items-center gap-1"
                >
                  <RefreshCw className="h-3 w-3" />
                  Refresh
                </Button>
              </div>
              
              <p className="text-sm text-center mb-4 text-gray-400 break-all">
                {publicKey?.toString()}
              </p>
              
              <div className="flex justify-center gap-4">
                <div className="bg-blue-900/30 px-4 py-2 rounded-lg border border-blue-800">
                  <p className="text-sm text-blue-400">USDC Balance</p>
                  <p className="font-bold text-blue-300">
                    {isLoading ? (
                      <span className="loading loading-spinner loading-xs"></span>
                    ) : (
                      `${currentUsdcBalance?.toFixed(2) || '0.00'} USDC`
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title">Test USDC Balance Check</h2>
                <p className="text-sm text-gray-400 mb-4">
                  Simulate a transaction that requires a specific amount of USDC
                </p>

                <div className="mb-4">
                  <label className="label">
                    <span className="label-text">Required USDC Amount</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={requiredAmount}
                      onChange={(e) => setRequiredAmount(Number(e.target.value))}
                      step="1"
                      min="1"
                      max="1000"
                      className="input input-bordered w-full"
                      placeholder="10"
                      disabled={isSimulating || isDirectFunding}
                    />
                    <span className="font-medium text-blue-300">USDC</span>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <Button
                    onClick={handleSimulateTransaction}
                    disabled={isSimulating || isDirectFunding || isLoading || !connected}
                    className="w-full flex items-center justify-center gap-2 py-5 bg-blue-600 hover:bg-blue-700"
                  >
                    {isSimulating ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <CreditCard className="h-4 w-4" />
                        Simulate Transaction
                      </>
                    )}
                  </Button>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                    <Button
                      onClick={handleShowFundingPopup}
                      variant="outline"
                      className="w-full flex items-center justify-center gap-2 py-5"
                      disabled={isSimulating || isDirectFunding}
                    >
                      <Wallet className="h-4 w-4" />
                      Show Balance Popup
                    </Button>
                    
                    <Button
                      onClick={handleDirectFunding}
                      className="w-full flex items-center justify-center gap-2 py-5 bg-green-600 hover:bg-green-700"
                      disabled={isSimulating || isDirectFunding}
                    >
                      {isDirectFunding ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Banknote className="h-4 w-4" />
                          Direct Privy Funding
                        </>
                      )}
                    </Button>
                  </div>
                  
                  <div className="mt-4">
                    <Link href="/fund-wallet" className="text-blue-400 hover:text-blue-300 flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      Go to Fund Wallet Page
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Link>
                  </div>
                </div>

                <div className="bg-gray-800/50 border border-gray-700 rounded-md p-3 mt-6">
                  <h3 className="text-sm font-semibold text-gray-200 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Comparison of Funding Methods
                  </h3>
                  <ul className="list-disc list-inside text-xs text-gray-300 mt-2 space-y-1">
                    <li><span className="text-blue-400">Simulate Transaction</span>: Checks USDC balance and shows popup if insufficient</li>
                    <li><span className="text-blue-400">Show Balance Popup</span>: Shows the custom balance alert dialog</li>
                    <li><span className="text-green-400">Direct Privy Funding</span>: Directly opens Privy&apos;s built-in funding UI</li>
                  </ul>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body items-center text-center">
              <h2 className="card-title">Connect Your Wallet</h2>
              <p>Please connect your Solana wallet to test the USDC balance check.</p>
              <div className="card-actions mt-4">
                <WalletButton />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 