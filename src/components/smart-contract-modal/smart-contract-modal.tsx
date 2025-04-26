'use client'

import React, { useState, useEffect } from 'react'
import Modal from '../ui/modal'
import { Button } from '../ui/button'
import { ChevronsRight, ExternalLink, Loader2 } from 'lucide-react'
import { useWallet } from '../solana/privy-solana-adapter'
import { useConnection } from '@solana/wallet-adapter-react'
import { USDC_MINT_ADDRESS } from '../account/account-data-access'
import { useGetUSDCBalance } from '../account/account-data-access'
import { useGetAllBalances } from '../account/account-data-access'
import { 
  PublicKey, 
  Transaction, 
  TransactionMessage, 
  VersionedTransaction,
  LAMPORTS_PER_SOL
} from '@solana/web3.js'
import { 
  TOKEN_PROGRAM_ID, 
  createTransferInstruction, 
  getAssociatedTokenAddress,
  getAccount,
  createAssociatedTokenAccountInstruction 
} from '@solana/spl-token'
import toast from 'react-hot-toast'
import { useSendTransaction } from '@privy-io/react-auth/solana'
import { useCluster } from '../cluster/cluster-data-access'
import { useTransactionToast } from '../ui/ui-layout'

interface SmartContractModalProps {
  isOpen: boolean
  onClose: () => void
  productName: string
}

const deliveryMethods = [
  { id: 'pickup', label: 'Pickup' },
  { id: 'shipping', label: 'Shipping' },
]

const paymentMethods = [
  { id: 'crypto', label: 'Cryptocurrency' },
]

// Target wallet address to receive payments
const PAYMENT_WALLET_ADDRESS = 'FrmRwmWnHHmce9HyfamcP6dc13nzWsFjANjoUTtptezx';

export default function SmartContractModal({ 
  isOpen, 
  onClose, 
  productName 
}: SmartContractModalProps) {
  const [measurements, setMeasurements] = useState({
    height: '',
    chest: '',
    waist: '',
    hips: '',
    shoulder: '',
    armLength: '',
    inseam: '',
  })
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    timeline: '14', // Default timeline (days)
    deliveryMethod: 'shipping',
    address: '',
    paymentMethod: 'crypto',
    usdcAmount: '10', // Default USDC amount
  })

  const [paymentStatus, setPaymentStatus] = useState({
    loading: false,
    success: false,
    error: false,
    signature: '',
  })

  // Get wallet and connection
  const wallet = useWallet()
  const { connection } = useConnection()
  const { cluster } = useCluster()
  const { sendTransaction } = useSendTransaction()
  const transactionToast = useTransactionToast()

  // Get USDC balance
  const { data: balances } = useGetAllBalances({ 
    address: wallet.publicKey 
  })

  // Check if the form is complete enough to proceed with payment
  const isFormComplete = 
    formData.name.trim() !== '' && 
    formData.phone.trim() !== '' && 
    (formData.deliveryMethod !== 'shipping' || formData.address.trim() !== '') &&
    parseFloat(formData.usdcAmount) > 0
  
  // Check if USDC amount is valid and enough balance is available
  const isUsdcAmountValid = (() => {
    const amount = parseFloat(formData.usdcAmount)
    return !isNaN(amount) && amount > 0 && amount <= 1000 // Max 1000 USDC
  })()

  const hasEnoughBalance = (() => {
    if (!balances || !isUsdcAmountValid) return false
    const amount = parseFloat(formData.usdcAmount)
    return amount <= balances.usdc
  })()
  
  const handleMeasurementChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setMeasurements(prev => ({ ...prev, [name]: value }))
  }
  
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }
  
  const handlePaymentClick = async () => {
    if (!wallet.connected || !wallet.publicKey) {
      toast.error('Please connect your wallet first')
      return
    }

    if (!isFormComplete) {
      toast.error('Please fill in all required fields')
      return
    }

    if (!isUsdcAmountValid) {
      toast.error('Please enter a valid USDC amount')
      return
    }

    if (!hasEnoughBalance) {
      toast.error('Insufficient USDC balance')
      return
    }

    try {
      setPaymentStatus({ loading: true, success: false, error: false, signature: '' })

      // Check if on devnet, which is required for USDC
      if (!cluster.network?.includes('devnet')) {
        toast.error('USDC transfers are only available on devnet')
        setPaymentStatus({ loading: false, success: false, error: true, signature: '' })
        return
      }

      // Create a transaction to send USDC
      const transaction = await createUsdcTransaction()
      
      // Send transaction
      const receipt = await sendTransaction({
        transaction,
        connection
      })

      // Handle success
      setPaymentStatus({ 
        loading: false, 
        success: true, 
        error: false, 
        signature: receipt.signature 
      })
      
      // Show success toast with transaction signature
      transactionToast(receipt.signature)
      
      // Close modal after a delay
      setTimeout(() => {
        onClose()
      }, 3000)
      
    } catch (error: any) {
      console.error('Payment error:', error)
      setPaymentStatus({ loading: false, success: false, error: true, signature: '' })
      toast.error(`Payment failed: ${error.message || 'Unknown error'}`)
    }
  }

  // Create a USDC token transfer transaction
  const createUsdcTransaction = async () => {
    if (!wallet.publicKey) {
      throw new Error('Wallet not connected')
    }

    // Convert USDC amount to token amount (USDC has 6 decimals)
    const amount = Math.floor(parseFloat(formData.usdcAmount) * 1_000_000)
    
    // Get the recipient's public key
    const recipientPublicKey = new PublicKey(PAYMENT_WALLET_ADDRESS)
    
    // Get the USDC token mint
    const usdcMint = new PublicKey(USDC_MINT_ADDRESS)
    
    // Get latest blockhash
    const { blockhash } = await connection.getLatestBlockhash()
    
    // Get sender's token account
    const senderTokenAccount = await getAssociatedTokenAddress(
      usdcMint,
      wallet.publicKey,
      false,
      TOKEN_PROGRAM_ID
    )
    
    // Get recipient's token account
    const recipientTokenAccount = await getAssociatedTokenAddress(
      usdcMint,
      recipientPublicKey,
      false,
      TOKEN_PROGRAM_ID
    )
    
    // Check if recipient token account exists
    const recipientTokenAccountExists = await connection.getAccountInfo(recipientTokenAccount)
    
    // Prepare instructions
    let instructions = []
    
    // If recipient token account doesn't exist, create it
    if (!recipientTokenAccountExists) {
      instructions.push(
        createAssociatedTokenAccountInstruction(
          wallet.publicKey, // payer
          recipientTokenAccount, // associated token account address
          recipientPublicKey, // owner
          usdcMint, // mint
          TOKEN_PROGRAM_ID
        )
      )
    }
    
    // Add transfer instruction
    instructions.push(
      createTransferInstruction(
        senderTokenAccount, // source
        recipientTokenAccount, // destination
        wallet.publicKey, // owner
        amount, // amount in token units
        [], // no multi-signers
        TOKEN_PROGRAM_ID // program ID
      )
    )
    
    // Create transaction message
    const messageV0 = new TransactionMessage({
      payerKey: wallet.publicKey,
      recentBlockhash: blockhash,
      instructions
    }).compileToV0Message()
    
    // Create versioned transaction
    return new VersionedTransaction(messageV0)
  }
  
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={`Initiate Smart Contract for ${productName}`}
    >
      <div className="space-y-6">
        {/* Measurements Section */}
        <div>
          <h3 className="text-lg font-medium text-white mb-4">Your Measurements</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="height" className="block text-sm font-medium text-gray-300 mb-1">
                Height (cm)
              </label>
              <input
                type="text"
                id="height"
                name="height"
                value={measurements.height}
                onChange={handleMeasurementChange}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="e.g. 175"
              />
            </div>
            
            <div>
              <label htmlFor="chest" className="block text-sm font-medium text-gray-300 mb-1">
                Chest (cm)
              </label>
              <input
                type="text"
                id="chest"
                name="chest"
                value={measurements.chest}
                onChange={handleMeasurementChange}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="e.g. 92"
              />
            </div>
            
            <div>
              <label htmlFor="waist" className="block text-sm font-medium text-gray-300 mb-1">
                Waist (cm)
              </label>
              <input
                type="text"
                id="waist"
                name="waist"
                value={measurements.waist}
                onChange={handleMeasurementChange}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="e.g. 84"
              />
            </div>
            
            <div>
              <label htmlFor="hips" className="block text-sm font-medium text-gray-300 mb-1">
                Hips (cm)
              </label>
              <input
                type="text"
                id="hips"
                name="hips"
                value={measurements.hips}
                onChange={handleMeasurementChange}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="e.g. 98"
              />
            </div>
            
            <div>
              <label htmlFor="shoulder" className="block text-sm font-medium text-gray-300 mb-1">
                Shoulder Width (cm)
              </label>
              <input
                type="text"
                id="shoulder"
                name="shoulder"
                value={measurements.shoulder}
                onChange={handleMeasurementChange}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="e.g. 45"
              />
            </div>
            
            <div>
              <label htmlFor="armLength" className="block text-sm font-medium text-gray-300 mb-1">
                Arm Length (cm)
              </label>
              <input
                type="text"
                id="armLength"
                name="armLength"
                value={measurements.armLength}
                onChange={handleMeasurementChange}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="e.g. 65"
              />
            </div>
            
            <div>
              <label htmlFor="inseam" className="block text-sm font-medium text-gray-300 mb-1">
                Inseam (cm)
              </label>
              <input
                type="text"
                id="inseam"
                name="inseam"
                value={measurements.inseam}
                onChange={handleMeasurementChange}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="e.g. 80"
              />
            </div>
          </div>
        </div>
        
        {/* Personal Details Section */}
        <div>
          <h3 className="text-lg font-medium text-white mb-4">Personal Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleFormChange}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="Enter your full name"
                required
              />
            </div>
            
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-1">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleFormChange}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="Enter your phone number"
                required
              />
            </div>
            
            <div>
              <label htmlFor="timeline" className="block text-sm font-medium text-gray-300 mb-1">
                Timeline (days)
              </label>
              <select
                id="timeline"
                name="timeline"
                value={formData.timeline}
                onChange={handleFormChange}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="7">7 days</option>
                <option value="14">14 days</option>
                <option value="21">21 days</option>
                <option value="30">30 days</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="deliveryMethod" className="block text-sm font-medium text-gray-300 mb-1">
                Delivery Method
              </label>
              <div className="flex space-x-4">
                {deliveryMethods.map((method) => (
                  <label key={method.id} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="deliveryMethod"
                      value={method.id}
                      checked={formData.deliveryMethod === method.id}
                      onChange={handleFormChange}
                      className="text-cyan-500 focus:ring-cyan-500 h-4 w-4"
                    />
                    <span className="text-sm text-gray-300">{method.label}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div className="sm:col-span-2">
              <label htmlFor="address" className="block text-sm font-medium text-gray-300 mb-1">
                Delivery Address {formData.deliveryMethod === 'shipping' && <span className="text-red-500">*</span>}
              </label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleFormChange}
                rows={3}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="Enter your delivery address"
                required={formData.deliveryMethod === 'shipping'}
              />
            </div>
          </div>
        </div>
        
        {/* Payment Method Section */}
        <div>
          <h3 className="text-lg font-medium text-white mb-4">Payment Method</h3>
          <div className="grid grid-cols-1 gap-4">
            <div className="flex space-x-4">
              {paymentMethods.map((method) => (
                <label key={method.id} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method.id}
                    checked={formData.paymentMethod === method.id}
                    onChange={handleFormChange}
                    className="text-cyan-500 focus:ring-cyan-500 h-4 w-4"
                  />
                  <span className="text-sm text-gray-300">{method.label}</span>
                </label>
              ))}
            </div>
            
            <div>
              <label htmlFor="usdcAmount" className="block text-sm font-medium text-gray-300 mb-1">
                USDC Amount <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center">
                <input
                  type="number"
                  id="usdcAmount"
                  name="usdcAmount"
                  value={formData.usdcAmount}
                  onChange={handleFormChange}
                  className={`w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                    !isUsdcAmountValid && formData.usdcAmount ? 'border-red-500' : ''
                  }`}
                  placeholder="Enter USDC amount"
                  min="0.1"
                  max="1000"
                  step="0.1"
                  required
                />
                <span className="ml-2 text-sm text-gray-300">USDC</span>
              </div>
              {formData.usdcAmount && !isUsdcAmountValid && (
                <p className="mt-1 text-sm text-red-500">
                  Amount must be between 0.1 and 1000 USDC
                </p>
              )}
              {isUsdcAmountValid && !hasEnoughBalance && wallet.connected && (
                <p className="mt-1 text-sm text-red-500">
                  Insufficient balance. You have {balances?.usdc.toFixed(2) || 0} USDC
                </p>
              )}
            </div>
            
            {wallet.connected ? (
              <div className="mt-2 text-sm text-gray-300 flex items-center">
                <span className="mr-2">Your balance:</span>
                {balances ? (
                  <span>
                    {balances.usdc.toFixed(2)} USDC / {balances.sol.toFixed(2)} SOL
                  </span>
                ) : (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
              </div>
            ) : (
              <p className="mt-2 text-sm text-amber-400">
                Please connect your wallet to proceed with payment
              </p>
            )}
            
            <Button 
              className={`w-full mt-2 text-white flex items-center justify-center gap-2 py-3 ${
                paymentStatus.loading ? 'bg-gray-600' : 
                paymentStatus.success ? 'bg-green-600 hover:bg-green-700' : 
                'bg-cyan-500 hover:bg-cyan-600'
              }`}
              onClick={handlePaymentClick}
              disabled={
                paymentStatus.loading || 
                !wallet.connected || 
                !isFormComplete || 
                !isUsdcAmountValid || 
                !hasEnoughBalance
              }
            >
              {paymentStatus.loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Processing Payment...</span>
                </>
              ) : paymentStatus.success ? (
                <>
                  <span>Payment Successful!</span>
                </>
              ) : (
                <>
                  <span>Proceed to Payment</span>
                  <ChevronsRight className="h-4 w-4" />
                </>
              )}
            </Button>
            
            {paymentStatus.error && (
              <div className="p-3 rounded-md bg-red-500/20 border border-red-500 text-white text-sm">
                Payment failed. Please try again or contact support.
              </div>
            )}
            
            {paymentStatus.success && (
              <div className="p-3 rounded-md bg-green-500/20 border border-green-500 text-white text-sm">
                <p>Payment successful! Your order has been placed.</p>
                <p className="mt-1">Transaction ID: {paymentStatus.signature.slice(0, 8)}...{paymentStatus.signature.slice(-8)}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  )
} 