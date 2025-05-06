'use client'

import { createContext, ReactNode, useContext, useEffect, useState } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import { useSolanaWallets } from '@privy-io/react-auth/solana'
import { Connection, PublicKey, Transaction, VersionedTransaction } from '@solana/web3.js'

// Create an interface that mimics the Solana wallet adapter's useWallet hook
interface SolanaWallet {
  publicKey: PublicKey | null
  connected: boolean
  connecting: boolean
  disconnect: () => Promise<void>
  sendTransaction: (
    transaction: Transaction | VersionedTransaction,
    connection: Connection,
    options?: any
  ) => Promise<string>
  signTransaction: <T extends Transaction | VersionedTransaction>(tx: T) => Promise<T>
  signAllTransactions: <T extends Transaction | VersionedTransaction>(txs: T[]) => Promise<T[]>
  signMessage: (message: Uint8Array) => Promise<Uint8Array>
}

const PrivySolanaContext = createContext<{
  wallet: SolanaWallet | null
  ready: boolean
}>({
  wallet: null,
  ready: false,
})

export function PrivySolanaAdapter({ children }: { children: ReactNode }) {
  const { wallets, ready: solanaWalletsReady } = useSolanaWallets()
  const { ready: privyReady, authenticated, logout } = usePrivy()
  const [wallet, setWallet] = useState<SolanaWallet | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!privyReady || !solanaWalletsReady) {
      setReady(false)
      return
    }

    const solanaWallet = wallets.length > 0 ? wallets[0] : null
    
    if (authenticated && solanaWallet) {
      setWallet({
        publicKey: new PublicKey(solanaWallet.address),
        connected: true,
        connecting: false,
        disconnect: async () => {
          // Clear localStorage before disconnecting to prevent profile mixing
          const storedUser = localStorage.getItem("auth_user");
          if (storedUser) {
            try {
              const parsedUser = JSON.parse(storedUser);
              if (parsedUser.walletAddress) {
                console.log("Wallet disconnecting, clearing localStorage to prevent profile mixing");
                localStorage.removeItem("auth_user");
                // Set flag for wallet disconnection
                sessionStorage.setItem("just_wallet_disconnected", "true");
              }
            } catch (error) {
              console.error("Error parsing user data during wallet disconnect", error);
            }
          }
          await logout();
        },
        sendTransaction: async (transaction, connection, options = {}) => {
          // Use Privy's wallet to sign and send the transaction
          if ('message' in transaction) {
            // Handle VersionedTransaction
            const signedTx = await solanaWallet.signTransaction(transaction)
            const txid = await connection.sendRawTransaction(
              (signedTx as VersionedTransaction).serialize(),
              options
            )
            return txid
          } else {
            // Handle Legacy Transaction
            const signedTx = await solanaWallet.signTransaction(transaction)
            const txid = await connection.sendRawTransaction(
              (signedTx as Transaction).serialize(),
              options
            )
            return txid
          }
        },
        signTransaction: async <T extends Transaction | VersionedTransaction>(tx: T): Promise<T> => {
          return await solanaWallet.signTransaction(tx) as T
        },
        signAllTransactions: async <T extends Transaction | VersionedTransaction>(txs: T[]): Promise<T[]> => {
          return await Promise.all(
            txs.map(tx => solanaWallet.signTransaction(tx))
          ) as T[]
        },
        signMessage: async (message) => {
          const signature = await solanaWallet.signMessage(message)
          return signature
        }
      })
    } else {
      setWallet({
        publicKey: null,
        connected: false,
        connecting: false,
        disconnect: async () => {
          // Clear localStorage even in disconnected state for consistency
          localStorage.removeItem("auth_user");
          // Set flag for wallet disconnection
          sessionStorage.setItem("just_wallet_disconnected", "true");
          await logout();
        },
        sendTransaction: async () => {
          throw new Error('Wallet not connected')
        },
        signTransaction: async <T extends Transaction | VersionedTransaction>(tx: T): Promise<T> => {
          throw new Error('Wallet not connected')
        },
        signAllTransactions: async <T extends Transaction | VersionedTransaction>(txs: T[]): Promise<T[]> => {
          throw new Error('Wallet not connected')
        },
        signMessage: async () => {
          throw new Error('Wallet not connected')
        }
      })
    }
    
    setReady(true)
  }, [privyReady, solanaWalletsReady, authenticated, wallets, logout])

  return (
    <PrivySolanaContext.Provider value={{ wallet, ready }}>
      {children}
    </PrivySolanaContext.Provider>
  )
}

export function useWallet(): SolanaWallet {
  const context = useContext(PrivySolanaContext)
  
  if (!context) {
    throw new Error('useWallet must be used within a PrivySolanaAdapter')
  }
  
  // If the wallet is not ready yet, return a wallet with empty functions
  if (!context.ready || !context.wallet) {
    return {
      publicKey: null,
      connected: false,
      connecting: true,
      disconnect: async () => {},
      sendTransaction: async () => { throw new Error('Wallet not ready') },
      signTransaction: async <T extends Transaction | VersionedTransaction>(tx: T): Promise<T> => { 
        throw new Error('Wallet not ready') 
      },
      signAllTransactions: async <T extends Transaction | VersionedTransaction>(txs: T[]): Promise<T[]> => { 
        throw new Error('Wallet not ready') 
      },
      signMessage: async () => { throw new Error('Wallet not ready') }
    }
  }
  
  return context.wallet
} 