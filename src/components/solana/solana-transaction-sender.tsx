'use client'

import { useState } from 'react'
import { useWallet } from './privy-solana-adapter'
import { useSendTransaction } from '@privy-io/react-auth/solana'
import { useConnection } from '@solana/wallet-adapter-react'
import { 
  Connection, 
  PublicKey, 
  LAMPORTS_PER_SOL, 
  SystemProgram, 
  Transaction, 
  TransactionMessage, 
  VersionedTransaction 
} from '@solana/web3.js'
import { IconCheck, IconCopy, IconSend } from '@tabler/icons-react'
import toast from 'react-hot-toast'
import { useUsdcBalanceCheck } from '@/hooks/use-usdc-balance-check'

/**
 * Component for sending SOL to another wallet
 */
export function TransactionSender() {
  const [recipient, setRecipient] = useState('')
  const [amount, setAmount] = useState('')
  const [transactionSignature, setTransactionSignature] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  
  const wallet = useWallet()
  const { connection } = useConnection()
  const { sendTransaction } = useSendTransaction()
  const { checkBalanceForTransaction } = useUsdcBalanceCheck()
  
  // Validate recipient address
  const isValidRecipient = (() => {
    try {
      if (!recipient) return false
      new PublicKey(recipient)
      return true
    } catch {
      return false
    }
  })()
  
  // Validate amount
  const isValidAmount = (() => {
    const amountFloat = parseFloat(amount)
    return !isNaN(amountFloat) && amountFloat > 0 && amountFloat <= 100 // Set max limit to 100 SOL
  })()
  
  // Format amount as lamports
  const lamports = (() => {
    try {
      return Math.floor(parseFloat(amount) * LAMPORTS_PER_SOL)
    } catch {
      return 0
    }
  })()
  
  const createTransaction = async () => {
    if (!wallet.publicKey) {
      throw new Error('Wallet not connected')
    }
    
    const recipientPublicKey = new PublicKey(recipient)
    
    // Get latest blockhash
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash()
    
    // Create a new versioned transaction (recommended for Solana)
    const instructions = [
      SystemProgram.transfer({
        fromPubkey: wallet.publicKey,
        toPubkey: recipientPublicKey,
        lamports
      })
    ]
    
    // Create transaction message
    const messageV0 = new TransactionMessage({
      payerKey: wallet.publicKey,
      recentBlockhash: blockhash,
      instructions
    }).compileToV0Message()
    
    // Create versioned transaction
    return new VersionedTransaction(messageV0)
  }
  
  const handleSendTransaction = async () => {
    if (!wallet.publicKey) {
      toast.error('Please connect your wallet first')
      return
    }
    
    if (!isValidRecipient) {
      toast.error('Please enter a valid recipient address')
      return
    }
    
    if (!isValidAmount) {
      toast.error('Please enter a valid amount')
      return
    }
    
    try {
      setLoading(true)
      
      // Check USDC balance using enhanced hook - require minimum 1 USDC for transaction fees
      const hasEnoughBalance = await checkBalanceForTransaction(1)
      
      if (!hasEnoughBalance) {
        // The popup will be shown automatically by the LowBalanceDetector
        setLoading(false)
        return
      }
      
      // Create the transaction
      const transaction = await createTransaction()
      
      // Send the transaction
      const receipt = await sendTransaction({
        transaction,
        connection
      })
      
      // Set transaction signature
      const signature = receipt.signature
      setTransactionSignature(signature)
      
      // Reset form
      setRecipient('')
      setAmount('')
      
      // Show success toast
      toast.success('Transaction sent successfully!')
    } catch (error: any) {
      console.error('Transaction error:', error)
      toast.error(`Transaction failed: ${error.message || 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }
  
  const copyToClipboard = () => {
    if (!transactionSignature) return
    
    navigator.clipboard.writeText(transactionSignature)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast.success('Transaction signature copied to clipboard')
  }
  
  const viewExplorer = () => {
    if (!transactionSignature) return
    
    // Determine network for explorer URL
    const network = connection.rpcEndpoint.includes('devnet') 
      ? 'devnet' 
      : connection.rpcEndpoint.includes('testnet')
      ? 'testnet'
      : ''
    
    const explorerUrl = `https://explorer.solana.com/tx/${transactionSignature}${network ? `?cluster=${network}` : ''}`
    window.open(explorerUrl, '_blank')
  }
  
  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">Send SOL</h2>
        
        <div className="form-control">
          <label className="label">
            <span className="label-text">Recipient Address</span>
          </label>
          <input 
            className={`input input-bordered ${!recipient ? '' : isValidRecipient ? 'input-success' : 'input-error'}`}
            placeholder="Enter Solana address"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            disabled={loading}
          />
          {recipient && !isValidRecipient && (
            <label className="label">
              <span className="label-text-alt text-error">Invalid Solana address</span>
            </label>
          )}
        </div>
        
        <div className="form-control mt-4">
          <label className="label">
            <span className="label-text">Amount (SOL)</span>
          </label>
          <input 
            type="number"
            className={`input input-bordered ${!amount ? '' : isValidAmount ? 'input-success' : 'input-error'}`}
            placeholder="0.01"
            min="0.000001"
            max="100"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={loading}
          />
          {amount && !isValidAmount && (
            <label className="label">
              <span className="label-text-alt text-error">Amount must be between 0.000001 and 100 SOL</span>
            </label>
          )}
        </div>
        
        <button 
          className="btn btn-primary mt-6"
          onClick={handleSendTransaction}
          disabled={!wallet.connected || loading || !isValidRecipient || !isValidAmount}
        >
          {loading ? (
            <>
              <span className="loading loading-spinner loading-xs"></span>
              Sending...
            </>
          ) : (
            <>
              <IconSend size={18} />
              Send Transaction
            </>
          )}
        </button>
        
        {transactionSignature && (
          <div className="mt-6">
            <div className="alert alert-success">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <div>
                <h3 className="font-bold">Transaction Sent!</h3>
                <div className="text-xs mt-2">Signature: {transactionSignature.slice(0, 10)}...{transactionSignature.slice(-6)}</div>
              </div>
            </div>
            
            <div className="flex justify-center gap-2 mt-4">
              <button
                className="btn btn-sm btn-outline"
                onClick={copyToClipboard}
              >
                {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                Copy Signature
              </button>
              
              <button
                className="btn btn-sm btn-outline"
                onClick={viewExplorer}
              >
                View in Explorer
              </button>
            </div>
          </div>
        )}
        
        {!wallet.connected && (
          <div className="alert alert-warning mt-4">
            Please connect your wallet to send transactions.
          </div>
        )}
      </div>
    </div>
  )
} 