'use client'

import { useWallet } from './privy-solana-adapter'
import { useSolanaWallets } from '@privy-io/react-auth/solana'
import { useState } from 'react'
import { IconCheck, IconCopy } from '@tabler/icons-react'
import toast from 'react-hot-toast'

/**
 * Helper function to sign a message with a Solana wallet
 * @param message Message to be signed
 * @param wallet The Solana wallet instance to use for signing
 * @returns Signature as a base64 string
 */
export async function signMessageWithPrivy(message: string, wallet: any): Promise<string> {
  if (!wallet) {
    throw new Error('No Solana wallet provided')
  }
  
  // Convert string message to Uint8Array (UTF-8 encoded)
  const messageBytes = new TextEncoder().encode(message)
  
  // Sign the message with the wallet
  const signature = await wallet.signMessage(messageBytes)
  
  // Convert signature to base64 string for easy display/storage
  return Buffer.from(signature).toString('base64')
}

/**
 * Component for signing messages with a Solana wallet
 */
export function MessageSigner() {
  const [message, setMessage] = useState('')
  const [signature, setSignature] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const wallet = useWallet()
  const { wallets, ready } = useSolanaWallets()
  
  const handleSign = async () => {
    if (!message) {
      toast.error('Please enter a message to sign')
      return
    }
    
    if (!wallet.connected || !wallets.length) {
      toast.error('Please connect your wallet first')
      return
    }
    
    try {
      setLoading(true)
      // Pass the first wallet directly to the signing function
      const signature = await signMessageWithPrivy(message, wallets[0])
      setSignature(signature)
      toast.success('Message signed successfully')
    } catch (error: any) {
      toast.error(`Error signing message: ${error.message || 'Unknown error'}`)
      console.error('Signing error:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const copyToClipboard = () => {
    if (!signature) return
    
    navigator.clipboard.writeText(signature)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast.success('Signature copied to clipboard')
  }
  
  // Show loading indicator if Privy wallets are not ready
  if (!ready) {
    return (
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body items-center text-center">
          <span className="loading loading-spinner loading-lg"></span>
          <p className="mt-2">Loading wallet...</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">Sign Message with Solana</h2>
        
        <div className="form-control">
          <label className="label">
            <span className="label-text">Message to sign</span>
          </label>
          <textarea 
            className="textarea textarea-bordered h-24" 
            placeholder="Enter a message to sign..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={loading}
          />
        </div>
        
        <button 
          className={`btn btn-primary mt-4 ${loading ? 'loading' : ''}`}
          onClick={handleSign}
          disabled={!wallet.connected || loading || !message || !wallets.length}
        >
          {loading ? 'Signing...' : 'Sign Message'}
        </button>
        
        {signature && (
          <div className="mt-6">
            <div className="label">
              <span className="label-text font-semibold">Signature (Base64)</span>
            </div>
            <div className="bg-base-200 p-4 rounded-lg relative break-all">
              {signature}
              <button 
                className="absolute top-2 right-2 btn btn-sm btn-circle btn-ghost"
                onClick={copyToClipboard}
              >
                {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
              </button>
            </div>
            <p className="text-xs mt-2 text-base-content/70">
              This signature proves that you control the private key of your wallet address.
            </p>
          </div>
        )}
        
        {!wallet.connected && (
          <div className="alert alert-warning mt-4">
            Please connect your wallet to sign messages.
          </div>
        )}
        
        {wallet.connected && !wallets.length && (
          <div className="alert alert-warning mt-4">
            No Solana wallets detected. Please connect a Solana wallet.
          </div>
        )}
      </div>
    </div>
  )
} 