import { getAssociatedTokenAddress } from '@solana/spl-token'
import { Connection, PublicKey } from '@solana/web3.js'
import { USDC_MINT_ADDRESS } from '@/components/account/account-data-access'

/**
 * Check if a user has enough USDC balance for a transaction
 * 
 * Note: When integrated with Privy, you can rely on Privy's automatic 
 * insufficient funds detection in most cases, which will show the funding UI 
 * automatically when needed. This function is useful for explicit checks
 * or for showing custom UI.
 * 
 * @param userWallet The user's wallet public key
 * @param requiredAmount The amount of USDC required for the transaction
 * @param connection The Solana connection instance
 * @returns Promise<boolean> - true if user has enough balance, false otherwise
 */
export async function checkUsdcBalance(
  userWallet: PublicKey,
  requiredAmount: number,
  connection: Connection
): Promise<boolean> {
  try {
    // Get the associated token account address for USDC
    const tokenAccount = await getAssociatedTokenAddress(
      new PublicKey(USDC_MINT_ADDRESS),
      userWallet
    )
    
    // Get account info to check if it exists
    const accountInfo = await connection.getAccountInfo(tokenAccount)
    
    if (!accountInfo) {
      // Token account doesn't exist, which means balance is 0
      return false
    }
    
    // Get token account balance
    const tokenBalance = await connection.getTokenAccountBalance(tokenAccount)
    const balance = tokenBalance.value.uiAmount || 0
    
    // Check if balance is sufficient
    return balance >= requiredAmount
  } catch (error) {
    console.error('Error checking USDC balance:', error)
    return false
  }
}

/**
 * Trigger a notification when USDC balance is too low
 * 
 * This is used with our custom LowBalanceDetector component. 
 * For direct integration with Privy, consider using Privy's 
 * fundWallet function instead, which provides a more seamless experience.
 * 
 * @param requiredAmount Amount of USDC required for the transaction
 */
export function notifyInsufficientBalance(requiredAmount: number = 5) {
  // Create a custom event to trigger the LowBalanceDetector
  const event = new CustomEvent('transaction-attempt', {
    detail: { requiredAmount }
  })
  
  // Dispatch the event
  window.dispatchEvent(event)
}

/**
 * Checks if a user has enough USDC balance and notifies if insufficient
 * 
 * This is a convenience wrapper that combines balance checking and notification.
 * Note that with Privy integration, you can also use Privy's automatic 
 * insufficient funds detection which will show the funding UI automatically.
 * 
 * @param userWallet The user's wallet public key
 * @param requiredAmount The amount of USDC required
 * @param connection The Solana connection
 * @returns Promise<boolean> - true if adequate balance, false if insufficient
 */
export async function verifyUsdcBalanceOrNotify(
  userWallet: PublicKey,
  requiredAmount: number,
  connection: Connection
): Promise<boolean> {
  const hasBalance = await checkUsdcBalance(userWallet, requiredAmount, connection)
  
  if (!hasBalance) {
    notifyInsufficientBalance(requiredAmount)
    return false
  }
  
  return true
} 