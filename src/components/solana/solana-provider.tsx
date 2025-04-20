'use client'

import { AnchorProvider } from '@coral-xyz/anchor'
import { ConnectionProvider, useConnection } from '@solana/wallet-adapter-react'
import { PublicKey, Transaction, VersionedTransaction } from '@solana/web3.js'
import { PrivyProvider, usePrivy } from '@privy-io/react-auth'
import { toSolanaWalletConnectors } from '@privy-io/react-auth/solana'
import { ReactNode, useMemo } from 'react'
import { useCluster } from '../cluster/cluster-data-access'
import { PrivySolanaAdapter, useWallet } from './privy-solana-adapter'

export function SolanaProvider({ children }: { children: ReactNode }) {
  const { cluster } = useCluster()
  const endpoint = useMemo(() => cluster.endpoint, [cluster])

  return (
    <ConnectionProvider endpoint={endpoint}>
      <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ''}      // Replace with your Privy app ID
        config={{
          embeddedWallets: {
            createOnLogin: 'users-without-wallets'
          },
          appearance: {
            theme: 'dark',
            accentColor: '#512da8',
            logo: 'https://solana.com/src/img/branding/solanaLogoMark.svg',
            walletChainType: 'solana-only'
          },
          externalWallets: {
            solana: {
              connectors: toSolanaWalletConnectors()
            }
          }
        }}
      >
        <PrivyWalletProvider>
          <PrivySolanaAdapter>
            {children}
          </PrivySolanaAdapter>
        </PrivyWalletProvider>
      </PrivyProvider>
    </ConnectionProvider>
  )
}

function PrivyWalletProvider({ children }: { children: ReactNode }) {
  const { ready } = usePrivy()

  if (!ready) {
    return (
      <div className="flex justify-center items-center h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    )
  }

  return <>{children}</>
}

export function WalletButton() {
  const { login, authenticated, user, logout, ready } = usePrivy()
  const wallet = useWallet()

  if (!ready) {
    return <button className="btn btn-primary btn-sm">Loading...</button>
  }

  if (!authenticated || !wallet.connected) {
    return (
      <button className="btn btn-primary btn-sm" onClick={login}>
        Connect Wallet
      </button>
    )
  }

  return (
    <div className="dropdown dropdown-end">
      <button tabIndex={0} className="btn btn-primary btn-sm">
        {wallet.publicKey ? 
          `${wallet.publicKey.toString().slice(0, 4)}...${wallet.publicKey.toString().slice(-4)}` : 
          'Wallet Connected'
        }
      </button>
      <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
        <li>
          <button onClick={() => wallet.disconnect()}>Disconnect</button>
        </li>
      </ul>
    </div>
  )
}

export function useAnchorProvider() {
  const { connection } = useConnection()
  const wallet = useWallet()
  
  if (!wallet.publicKey) {
    // Return a dummy provider when there's no public key
    return new AnchorProvider(
      connection,
      {
        publicKey: new PublicKey('11111111111111111111111111111111'),
        signTransaction: async <T extends Transaction | VersionedTransaction>(tx: T): Promise<T> => { 
          throw new Error('Wallet not connected') 
        },
        signAllTransactions: async <T extends Transaction | VersionedTransaction>(txs: T[]): Promise<T[]> => { 
          throw new Error('Wallet not connected') 
        }
      },
      { commitment: 'confirmed' }
    )
  }

  return new AnchorProvider(
    connection, 
    {
      publicKey: wallet.publicKey,
      signTransaction: wallet.signTransaction,
      signAllTransactions: wallet.signAllTransactions
    }, 
    { commitment: 'confirmed' }
  )
}
