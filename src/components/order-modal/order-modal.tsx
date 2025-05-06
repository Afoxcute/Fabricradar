'use client'

import React, { useState, useEffect } from 'react'
import Modal from '../ui/modal'
import { Button } from '../ui/button'
import { ChevronsRight, ExternalLink, Loader2, Calendar, Clock } from 'lucide-react'
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
import env from '@/config/env'
import { api } from '@/trpc/react'
import { useAuth } from '@/providers/auth-provider'
import { verifyUsdcBalanceOrNotify } from '@/utils/balance-check'
import { useUsdcBalanceCheck } from '@/hooks/use-usdc-balance-check'

interface OrderModalProps {
  isOpen: boolean
  onClose: () => void
  productName: string
  designId?: number
  tailorId?: number
  price?: number
  designDescription?: string
}

const deliveryMethods = [
  { id: 'pickup', label: 'Pickup' },
  { id: 'shipping', label: 'Shipping' },
]

const paymentMethods = [
  { id: 'crypto', label: 'Cryptocurrency' },
]

const genderOptions = [
  { id: 'male', label: 'Male' },
  { id: 'female', label: 'Female' },
]

// Male-specific measurements
const maleMeasurements = [
  { id: 'height', label: 'Height (cm)', placeholder: 'e.g. 180' },
  { id: 'chest', label: 'Chest (cm)', placeholder: 'e.g. 100' },
  { id: 'waist', label: 'Waist (cm)', placeholder: 'e.g. 86' },
  { id: 'hips', label: 'Hips (cm)', placeholder: 'e.g. 100' },
  { id: 'shoulder', label: 'Shoulder Width (cm)', placeholder: 'e.g. 48' },
  { id: 'sleeve', label: 'Sleeve Length (cm)', placeholder: 'e.g. 66' },
  { id: 'neck', label: 'Neck (cm)', placeholder: 'e.g. 40' },
  { id: 'inseam', label: 'Inseam (cm)', placeholder: 'e.g. 82' },
]

// Female-specific measurements
const femaleMeasurements = [
  { id: 'height', label: 'Height (cm)', placeholder: 'e.g. 165' },
  { id: 'bust', label: 'Bust (cm)', placeholder: 'e.g. 92' },
  { id: 'waist', label: 'Waist (cm)', placeholder: 'e.g. 74' },
  { id: 'hips', label: 'Hips (cm)', placeholder: 'e.g. 98' },
  { id: 'shoulder', label: 'Shoulder Width (cm)', placeholder: 'e.g. 40' },
  { id: 'sleeve', label: 'Sleeve Length (cm)', placeholder: 'e.g. 60' },
  { id: 'upperArm', label: 'Upper Arm (cm)', placeholder: 'e.g. 30' },
  { id: 'inseam', label: 'Inseam (cm)', placeholder: 'e.g. 78' },
]

// Target wallet address to receive payments - imported from environment variables
const PAYMENT_WALLET_ADDRESS = env.PAYMENT_WALLET_ADDRESS;

export default function OrderModal({ 
  isOpen, 
  onClose, 
  productName,
  designId,
  tailorId,
  price = 10,
  designDescription
}: OrderModalProps) {
  const { user } = useAuth();
  const createOrderMutation = api.orders.createOrder.useMutation({
    onSuccess: (data) => {
      console.log('Order created:', data);
      // Show success message is handled by payment success logic
    },
    onError: (error) => {
      console.error('Failed to create order:', error);
      toast.error('Failed to create order in our system');
      setPaymentStatus({ loading: false, success: false, error: true, signature: '' });
    }
  });

  const [measurements, setMeasurements] = useState({
    height: '',
    chest: '',
    bust: '',
    waist: '',
    hips: '',
    shoulder: '',
    sleeve: '',
    neck: '',
    upperArm: '',
    inseam: '',
  })
  
  const [formData, setFormData] = useState({
    name: user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}`.trim() : '',
    phone: user?.phone || '',
    gender: 'male', // Default gender
    timelineStart: '', // Start date
    timelineStartTime: '', // Start time
    timelineEnd: '', // End date
    timelineEndTime: '', // End time
    deliveryMethod: 'shipping',
    address: '',
    paymentMethod: 'crypto',
    usdcAmount: price.toString(), // Use the price from the design if available
  })

  // Get current measurements list based on selected gender
  const currentMeasurements = formData.gender === 'male' ? maleMeasurements : femaleMeasurements;

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
    formData.timelineStart !== '' &&
    formData.timelineStartTime !== '' &&
    formData.timelineEnd !== '' &&
    formData.timelineEndTime !== '' &&
    (formData.deliveryMethod !== 'shipping' || formData.address.trim() !== '') &&
    parseFloat(formData.usdcAmount) > 0
  
  // Check if timeline is valid (end date is after start date)
  const isTimelineValid = () => {
    if (!formData.timelineStart || !formData.timelineEnd) return true;
    
    const startDateTime = new Date(
      `${formData.timelineStart}T${formData.timelineStartTime || '00:00'}`
    );
    const endDateTime = new Date(
      `${formData.timelineEnd}T${formData.timelineEndTime || '00:00'}`
    );
    
    return endDateTime > startDateTime;
  }

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
  
  const { checkBalanceForTransaction, fundWalletDirectly } = useUsdcBalanceCheck()

  const handlePaymentClick = async () => {
    if (!wallet.connected || !wallet.publicKey) {
      toast.error('Please connect your wallet first')
      return
    }

    if (!isFormComplete) {
      toast.error('Please fill in all required fields')
      return
    }

    if (!isTimelineValid()) {
      toast.error('End date must be after start date')
      return
    }

    if (!isUsdcAmountValid) {
      toast.error('Please enter a valid USDC amount')
      return
    }

    // Manually trigger the funding popup if needed with the exact amount required
    const requiredAmount = parseFloat(formData.usdcAmount)
    console.log('Attempting transaction with amount:', requiredAmount)
    
    // Manually dispatch transaction attempt event to ensure the LowBalanceDetector catches it
    const event = new CustomEvent('transaction-attempt', {
      detail: { requiredAmount }
    })
    window.dispatchEvent(event)
    console.log('Dispatched transaction-attempt event with amount:', requiredAmount)
    
    // Check USDC balance using our enhanced method
    const hasEnoughBalance = await checkBalanceForTransaction(requiredAmount)
    console.log('Has enough balance check result:', hasEnoughBalance)
    
    if (!hasEnoughBalance) {
      console.log('Insufficient balance detected. Popup should appear.')
      // No need to continue with the transaction
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

      // Create order in the database
      if (designId && tailorId) {
        createOrderMutation.mutate({
          productName,
          customerName: formData.name,
          userId: user?.id,
          tailorId,
          price: parseFloat(formData.usdcAmount),
          txHash: receipt.signature,
          description: designDescription,
          measurements,
          delivery: {
            method: formData.deliveryMethod,
            address: formData.address,
            customTimeline: {
              startDate: formData.timelineStart,
              startTime: formData.timelineStartTime,
              endDate: formData.timelineEnd,
              endTime: formData.timelineEndTime
            }
          },
          paymentMethod: formData.paymentMethod,
          designId,
        });
      }
      
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

  // Autofill user details when the modal opens
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.firstName && user.lastName 
          ? `${user.firstName} ${user.lastName}`.trim() 
          : prev.name,
        phone: user.phone || prev.phone,
      }));
    }
  }, [user, isOpen]);
  
  // Set default dates when the modal opens
  useEffect(() => {
    if (isOpen) {
      // Set default start date to today
      const today = new Date();
      const startDate = today.toISOString().split('T')[0];
      
      // Set default end date to 14 days from now
      const endDate = new Date();
      endDate.setDate(today.getDate() + 14);
      const endDateStr = endDate.toISOString().split('T')[0];
      
      // Set default times
      const nowHours = String(today.getHours()).padStart(2, '0');
      const nowMinutes = String(today.getMinutes()).padStart(2, '0');
      const defaultTime = `${nowHours}:${nowMinutes}`;
      
      setFormData(prev => ({
        ...prev,
        timelineStart: startDate,
        timelineStartTime: defaultTime,
        timelineEnd: endDateStr,
        timelineEndTime: defaultTime,
      }));
    }
  }, [isOpen]);
  
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={`Start order for ${productName}`}
    >
      <div className="space-y-6">
        {/* Info about 48-hour acceptance window */}
        <div className="p-3 rounded-md bg-blue-500/20 border border-blue-500 text-white text-sm">
          <p>Once your order is placed, the tailor has 48 hours to accept your order. If not accepted within this timeframe, your order will be automatically cancelled.</p>
        </div>

        {/* Gender Selection */}
        <div>
          <h3 className="text-lg font-medium text-white mb-4">Your Gender</h3>
          <div className="flex space-x-4">
            {genderOptions.map((gender) => (
              <label key={gender.id} className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="gender"
                  value={gender.id}
                  checked={formData.gender === gender.id}
                  onChange={handleFormChange}
                  className="text-cyan-500 focus:ring-cyan-500 h-4 w-4"
                />
                <span className="text-sm text-gray-300">{gender.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Measurements Section */}
        <div>
          <h3 className="text-lg font-medium text-white mb-4">Your Measurements ({formData.gender === 'male' ? 'Male' : 'Female'})</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {currentMeasurements.map((field) => (
              <div key={field.id}>
                <label htmlFor={field.id} className="block text-sm font-medium text-gray-300 mb-1">
                  {field.label}
                </label>
                <input
                  type="text"
                  id={field.id}
                  name={field.id}
                  value={measurements[field.id as keyof typeof measurements] || ''}
                  onChange={handleMeasurementChange}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder={field.placeholder}
                />
              </div>
            ))}
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
            
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Custom Timeline <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center mb-2">
                    <Calendar className="h-4 w-4 mr-1 text-cyan-500" />
                    <label htmlFor="timelineStart" className="text-sm text-gray-300">
                      Start Date
                    </label>
                  </div>
                  <input
                    type="date"
                    id="timelineStart"
                    name="timelineStart"
                    value={formData.timelineStart}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    required
                  />
                </div>
                <div>
                  <div className="flex items-center mb-2">
                    <Clock className="h-4 w-4 mr-1 text-cyan-500" />
                    <label htmlFor="timelineStartTime" className="text-sm text-gray-300">
                      Start Time
                    </label>
                  </div>
                  <input
                    type="time"
                    id="timelineStartTime"
                    name="timelineStartTime"
                    value={formData.timelineStartTime}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    required
                  />
                </div>
                <div>
                  <div className="flex items-center mb-2">
                    <Calendar className="h-4 w-4 mr-1 text-cyan-500" />
                    <label htmlFor="timelineEnd" className="text-sm text-gray-300">
                      End Date
                    </label>
                  </div>
                  <input
                    type="date"
                    id="timelineEnd"
                    name="timelineEnd"
                    value={formData.timelineEnd}
                    onChange={handleFormChange}
                    className={`w-full px-3 py-2 bg-gray-800 border ${
                      !isTimelineValid() && formData.timelineStart && formData.timelineEnd
                        ? 'border-red-500'
                        : 'border-gray-700'
                    } rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500`}
                    required
                  />
                </div>
                <div>
                  <div className="flex items-center mb-2">
                    <Clock className="h-4 w-4 mr-1 text-cyan-500" />
                    <label htmlFor="timelineEndTime" className="text-sm text-gray-300">
                      End Time
                    </label>
                  </div>
                  <input
                    type="time"
                    id="timelineEndTime"
                    name="timelineEndTime"
                    value={formData.timelineEndTime}
                    onChange={handleFormChange}
                    className={`w-full px-3 py-2 bg-gray-800 border ${
                      !isTimelineValid() && formData.timelineStart && formData.timelineEnd && 
                      formData.timelineStartTime && formData.timelineEndTime
                        ? 'border-red-500'
                        : 'border-gray-700'
                    } rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500`}
                    required
                  />
                </div>
              </div>
              {!isTimelineValid() && formData.timelineStart && formData.timelineEnd && (
                <p className="mt-1 text-sm text-red-500">
                  End date and time must be after start date and time
                </p>
              )}
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
                <p className="mt-1">The tailor will review your order within 48 hours.</p>
                <p className="mt-1">Transaction ID: {paymentStatus.signature.slice(0, 8)}...{paymentStatus.signature.slice(-8)}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  )
} 