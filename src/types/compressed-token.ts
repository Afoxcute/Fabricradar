import { PublicKey, VersionedTransaction } from '@solana/web3.js';

/**
 * Interface for compressed token mint information
 */
export interface CompressedTokenMint {
  address: string;
  decimals: number;
  symbol?: string;
  name?: string;
  icon?: string;
}

/**
 * Interface for compressed token account
 */
export interface CompressedTokenAccount {
  mint: string;
  owner: string;
  amount: number;
  decimals: number;
  address: string;
}

/**
 * Interface for a transaction signer function
 */
export type TransactionSigner = (transaction: VersionedTransaction) => Promise<VersionedTransaction>;

/**
 * Interface for mint result
 */
export interface MintTokenResult {
  signature: string;
  amount: number;
  recipient: string;
}

/**
 * Interface for token balance information
 */
export interface TokenBalanceInfo {
  mint: string;
  balance: number;
  decimals: number;
  uiAmount: number;
} 