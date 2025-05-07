'use client'

import React, { useState, useEffect } from 'react'
import { useWallet } from '../solana/privy-solana-adapter'
import { WalletButton } from '../solana/solana-provider'
import { AppHero } from '../ui/ui-layout'
import { useConnection } from '@solana/wallet-adapter-react'
import { LAMPORTS_PER_SOL } from '@solana/web3.js'
import { useFundWallet } from '@privy-io/react-auth/solana'
import { Button } from '../ui/button'
import { Loader2, CreditCard, Coins, Wallet, DollarSign, ArrowRight, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import { useCluster } from '../cluster/cluster-data-access'
import { useGetUSDCBalance } from '../account/account-data-access'
import { USDC_MINT_ADDRESS } from '../account/account-data-access'
import { useRouter } from 'next/navigation'

export default function WalletFundFeature() {
  const { publicKey, connected } = useWallet()
  const { connection } = useConnection()
  const { cluster } = useCluster()
  const router = useRouter()
  const [balance, setBalance] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [fundingLoading, setFundingLoading] = useState(false)
  const [fundingAmount, setFundingAmount] = useState('10')
  const [preferredProvider, setPreferredProvider] = useState<'coinbase' | 'moonpay'>('moonpay')
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  // Handle user exiting funding flow
  const handleUserExitedFunding = (params: { 
    address: string; 
    cluster: { name: string }; 
    fundingMethod: string | null; 
    balance: bigint | undefined 
  }) => {
    // Refresh balances
    setRefreshTrigger(prev => prev + 1)
    
    // Show appropriate toast message
    if (params.balance && params.balance > BigInt(0)) {
      toast.success('Funding completed successfully!')
    } else {
      toast('Funding flow exited. You can try again anytime.')
    }
  }

  // Enhanced useFundWallet hook with callback
  const { fundWallet } = useFundWallet({
    onUserExited: handleUserExitedFunding
  })

  // Fetch SOL balance
  useEffect(() => {
    async function fetchBalance() {
      if (connected && publicKey) {
        try {
          setLoading(true)
          const balance = await connection.getBalance(publicKey)
          setBalance(balance / LAMPORTS_PER_SOL)
        } catch (error) {
          console.error('Error fetching balance:', error)
          setBalance(null)
        } finally {
          setLoading(false)
        }
      } else {
        setBalance(null)
      }
    }

    fetchBalance()
    
    // Set up balance refresh interval when connected
    let intervalId: NodeJS.Timeout | undefined
    if (connected && publicKey) {
      intervalId = setInterval(fetchBalance, 15000) // Refresh every 15 seconds
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId)
    }
  }, [connected, publicKey, connection, refreshTrigger])

  // Get USDC balance
  const { data: usdcBalance, isLoading: isLoadingUsdc, refetch: refetchUsdcBalance } = useGetUSDCBalance({
    address: publicKey!
  });

  // Ensure USDC balances are refreshed when the refresh trigger changes
  useEffect(() => {
    if (connected && publicKey) {
      refetchUsdcBalance()
    }
  }, [refreshTrigger, connected, publicKey, refetchUsdcBalance])

  const handleFundWithUSDC = async () => {
    if (!publicKey) {
      toast.error('Please connect your wallet first')
      return
    }

    try {
      setFundingLoading(true)
      
      // Determine cluster for funding
      const clusterName = cluster.network?.includes('mainnet') ? 'mainnet-beta' : 'devnet'
      
      // Call fundWallet with enhanced options
      await fundWallet(publicKey.toString(), {
        cluster: { name: clusterName },
        amount: fundingAmount,
        asset: 'USDC', // Specify USDC asset
        card: {
          preferredProvider: preferredProvider
        },
        defaultFundingMethod: 'card', // Direct to card funding immediately
        uiConfig: {
          receiveFundsTitle: "Add USDC to Your Wallet",
          receiveFundsSubtitle: "Fund your wallet with USDC to use on our platform"
        }
      })
      
      toast.success(`Funding initiated for ${fundingAmount} USDC`)
    } catch (error) {
      console.error('Error funding wallet with USDC:', error)
      toast.error('Failed to fund wallet with USDC. Please try again.')
    } finally {
      setFundingLoading(false)
    }
  }

  const handleRefreshBalances = () => {
    setRefreshTrigger(prev => prev + 1)
    toast.success('Refreshing balances...')
  }

  return (
    <div>
      <AppHero
        title="Fund Your Wallet with USDC"
        subtitle="Add USDC to your Solana wallet to get started with the platform"
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
                  onClick={handleRefreshBalances}
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
                <div className="bg-gray-800/50 px-4 py-2 rounded-lg">
                  <p className="text-sm text-gray-400">SOL Balance</p>
                  <p className="font-bold">
                    {loading ? (
                      <span className="loading loading-spinner loading-xs"></span>
                    ) : balance !== null ? (
                      `${balance.toFixed(5)} SOL`
                    ) : (
                      'Unable to fetch'
                    )}
                  </p>
                </div>
                <div className="bg-blue-900/30 px-4 py-2 rounded-lg border border-blue-800">
                  <p className="text-sm text-blue-400">USDC Balance</p>
                  <p className="font-bold text-blue-300">
                    {isLoadingUsdc ? (
                      <span className="loading loading-spinner loading-xs"></span>
                    ) : usdcBalance !== undefined ? (
                      `${usdcBalance.toFixed(2)} USDC`
                    ) : (
                      '0.00 USDC'
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <div className="flex items-center mb-4">
                  <DollarSign className="h-6 w-6 text-blue-500 mr-2" />
                  <h2 className="card-title m-0">Fund Your Wallet with USDC</h2>
                </div>
                <p className="text-sm text-gray-400 mb-4">
                  Add USDC to your Solana wallet to make transactions on our platform.
                </p>

                <div className="mb-4">
                  <label className="label">
                    <span className="label-text">Amount (USDC)</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={fundingAmount}
                      onChange={(e) => setFundingAmount(e.target.value)}
                      step="1"
                      min="1"
                      max="1000"
                      className="input input-bordered w-full"
                      placeholder="10"
                      disabled={fundingLoading}
                    />
                    <span className="font-medium text-blue-300">USDC</span>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    Min: 1 USDC, Max: 1000 USDC
                  </div>
                </div>

                <div className="mb-4">
                  <label className="label">
                    <span className="label-text">Preferred Provider</span>
                  </label>
                  <div className="flex gap-3">
                    <button
                      className={`px-4 py-2 rounded-md flex items-center gap-2 flex-1 ${
                        preferredProvider === 'moonpay' 
                          ? 'bg-blue-800/50 border border-blue-600' 
                          : 'bg-gray-800 border border-gray-700'
                      }`}
                      onClick={() => setPreferredProvider('moonpay')}
                      disabled={fundingLoading}
                    >
                      <CreditCard className="h-4 w-4" />
                      <span>MoonPay</span>
                    </button>
                    <button
                      className={`px-4 py-2 rounded-md flex items-center gap-2 flex-1 ${
                        preferredProvider === 'coinbase' 
                          ? 'bg-blue-800/50 border border-blue-600' 
                          : 'bg-gray-800 border border-gray-700'
                      }`}
                      onClick={() => setPreferredProvider('coinbase')}
                      disabled={fundingLoading}
                    >
                      <CreditCard className="h-4 w-4" />
                      <span>Coinbase</span>
                    </button>
                  </div>
                </div>

                <Button
                  onClick={handleFundWithUSDC}
                  disabled={fundingLoading || !connected}
                  className="w-full flex items-center justify-center gap-2 py-5 bg-blue-600 hover:bg-blue-700"
                >
                  {fundingLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <DollarSign className="h-4 w-4" />
                      Fund with USDC
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </>
                  )}
                </Button>

                <div className="bg-blue-900/20 border border-blue-800 rounded-md p-3 mt-4">
                  <h3 className="text-sm font-semibold text-blue-400 flex items-center gap-2">
                    <Wallet className="h-4 w-4" />
                    Important Information
                  </h3>
                  <ul className="list-disc list-inside text-xs text-gray-300 mt-2 space-y-1">
                    <li>You can only fund your wallet with USDC on Solana</li>
                    <li>You need USDC for all transactions on our platform</li>
                    <li>Processing can take a few moments to complete</li>
                    <li>On testnet/devnet, funds are for testing purposes only</li>
                  </ul>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body items-center text-center">
              <h2 className="card-title">Connect Your Wallet</h2>
              <p>Please connect your Solana wallet to add USDC funds.</p>
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