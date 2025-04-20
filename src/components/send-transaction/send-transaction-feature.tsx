'use client'

import { useWallet } from '../solana/privy-solana-adapter'
import { WalletButton } from '../solana/solana-provider'
import { TransactionSender } from '../solana/solana-transaction-sender'
import { AppHero } from '../ui/ui-layout'
import { useConnection } from '@solana/wallet-adapter-react'
import { LAMPORTS_PER_SOL } from '@solana/web3.js'
import { useState, useEffect } from 'react'

export default function SendTransactionFeature() {
  const { publicKey, connected } = useWallet()
  const { connection } = useConnection()
  const [balance, setBalance] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)

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

  return (
    <div>
      <AppHero
        title="Send Transaction"
        subtitle="Send SOL to any Solana wallet address using Privy"
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
            <TransactionSender />
          </>
        ) : (
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body items-center text-center">
              <h2 className="card-title">Connect Your Wallet</h2>
              <p>Please connect your Solana wallet to send transactions.</p>
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