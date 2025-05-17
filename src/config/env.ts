/**
 * Environment variables and configuration
 * Using this approach since .env files are blocked by globalIgnore
 */

const env = {
  /** Solana payment wallet address for receiving USDC payments */
  PAYMENT_WALLET_ADDRESS: 'FrmRwmWnHHmce9HyfamcP6dc13nzWsFjANjoUTtptezx',
  
  /** Environment type (development, production) */
  NODE_ENV: process.env.NODE_ENV || 'development',
}

export default env; 