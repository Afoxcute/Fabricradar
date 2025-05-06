'use client'

import React, { useState, useEffect } from 'react'
import { useWallet } from '../solana/privy-solana-adapter'
import { WalletButton } from '../solana/solana-provider'
import { AppHero } from '../ui/ui-layout'
import { useConnection } from '@solana/wallet-adapter-react'
import { LAMPORTS_PER_SOL } from '@solana/web3.js'
import { useFundWallet } from '@privy-io/react-auth/solana'
import { Button } from '../ui/button'
import { Loader2, CreditCard, Coins, Wallet } from 'lucide-react'
import toast from 'react-hot-toast'
import { useCluster } from '../cluster/cluster-data-access'

export default function WalletFundFeature() {
  const { publicKey, connected } = useWallet()
  const { connection } = useConnection()
  const { cluster } = useCluster()
  const { fundWallet } = useFundWallet()
  const [balance, setBalance] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [fundingLoading, setFundingLoading] = useState(false)
  const [fundingAmount, setFundingAmount] = useState('0.1')

  // Fetch wallet balance when connected
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
  }, [connected, publicKey, connection])

  const handleFundWithSOL = async () => {
    if (!publicKey) {
      toast.error('Please connect your wallet first')
      return
    }

    try {
      setFundingLoading(true)
      await fundWallet(publicKey.toString(), {
        cluster: {
          name: cluster.network?.includes('mainnet') ? 'mainnet-beta' : 'devnet'
        },
        amount: fundingAmount
      })
      toast.success(`Successfully initiated funding of ${fundingAmount} SOL`)
    } catch (error) {
      console.error('Error funding wallet:', error)
      toast.error('Failed to fund wallet. Please try again.')
    } finally {
      setFundingLoading(false)
    }
  }

  const handleFundWithEVM = async () => {
    if (!publicKey) {
      toast.error('Please connect your wallet first')
      return
    }

    try {
      setFundingLoading(true)
      // We don't specify the asset, so it will default to ETH/USDC depending on Privy config
      await fundWallet(publicKey.toString(), {
        cluster: {
          name: cluster.network?.includes('mainnet') ? 'mainnet-beta' : 'devnet'
        }
      })
      toast.success('Successfully initiated EVM funding flow')
    } catch (error) {
      console.error('Error funding wallet with EVM:', error)
      toast.error('Failed to fund wallet. Please try again.')
    } finally {
      setFundingLoading(false)
    }
  }

  return (
    <div>
      <AppHero
        title="Fund Your Wallet"
        subtitle="Add SOL or other tokens to your wallet to get started with the platform"
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
            <div className="mb-6 text-center">
              <div className="badge badge-success">Connected</div>
              <p className="mt-2">Wallet: {publicKey?.toString()}</p>
              <p className="mt-1">
                Balance: {loading ? (
                  <span className="loading loading-spinner loading-xs"></span>
                ) : balance !== null ? (
                  `${balance.toFixed(5)} SOL`
                ) : (
                  'Unable to fetch balance'
                )}
              </p>
            </div>

            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title">Fund Your Wallet</h2>
                <p className="text-sm text-gray-400 mb-4">
                  Choose your preferred method to add funds to your wallet
                </p>

                <div className="mb-4">
                  <label className="label">
                    <span className="label-text">Amount (SOL)</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={fundingAmount}
                      onChange={(e) => setFundingAmount(e.target.value)}
                      step="0.01"
                      min="0.01"
                      max="10"
                      className="input input-bordered w-full"
                      placeholder="0.1"
                      disabled={fundingLoading}
                    />
                    <span className="font-medium">SOL</span>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    Min: 0.01 SOL, Max: 10 SOL
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-3">
                  <Button
                    onClick={handleFundWithSOL}
                    disabled={fundingLoading || !connected}
                    className="flex-1 flex items-center justify-center gap-2 py-5"
                  >
                    {fundingLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Coins className="h-4 w-4" />
                        Fund with SOL
                      </>
                    )}
                  </Button>
                  
                  <Button
                    onClick={handleFundWithEVM}
                    disabled={fundingLoading || !connected}
                    className="flex-1 flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 py-5"
                  >
                    {fundingLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <CreditCard className="h-4 w-4" />
                        Fund with EVM
                      </>
                    )}
                  </Button>
                </div>

                <div className="bg-blue-900/20 border border-blue-800 rounded-md p-3 mt-4">
                  <h3 className="text-sm font-semibold text-blue-400 flex items-center gap-2">
                    <Wallet className="h-4 w-4" />
                    How it works
                  </h3>
                  <ul className="list-disc list-inside text-xs text-gray-300 mt-2 space-y-1">
                    <li>SOL funding: Directly adds SOL to your wallet</li>
                    <li>EVM funding: Uses Ethereum or other EVM chains to fund your Solana wallet</li>
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
              <p>Please connect your Solana wallet to add funds.</p>
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