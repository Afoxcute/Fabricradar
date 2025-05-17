'use client'

import { useWallet } from '../solana/privy-solana-adapter'
import { WalletButton } from '../solana/solana-provider'
import { MessageSigner } from '../solana/solana-message-signer'
import { AppHero } from '../ui/ui-layout'

export default function SignMessageFeature() {
  const { publicKey, connected } = useWallet()

  return (
    <div>
      <AppHero
        title="Message Signing"
        subtitle="Sign messages with your Solana wallet to prove ownership or for verification purposes."
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
            </div>
            <MessageSigner />
          </>
        ) : (
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body items-center text-center">
              <h2 className="card-title">Connect Your Wallet</h2>
              <p>Please connect your Solana wallet to sign messages.</p>
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