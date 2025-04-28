'use client';
import React, { useState } from 'react';
import {
  ChainAddress,
  TokenId,
  TokenTransfer,
  wormhole,
} from '@wormhole-foundation/sdk';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { useWallet } from '../solana/privy-solana-adapter';
import solana from '@wormhole-foundation/sdk/solana';
import { supportedTokens } from '@/lib/constants';
import { processTokenTransfer } from '@/lib/solana/processTokenTransfer';

interface TransferFormProps {
  onSuccess?: (txHash: string) => void;
  onError?: (error: Error) => void;
}

// Define available Solana tokens
const SOLANA_TOKENS = {
  SOL: 'native',
  USDC: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  USDT: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
} as const;

type TokenSymbol = keyof typeof SOLANA_TOKENS;

export const TransferForm: React.FC<TransferFormProps> = ({
  onSuccess,
  onError,
}) => {
  const [amount, setAmount] = useState<string>('');
  const [selectedToken, setSelectedToken] = useState<TokenSymbol | ''>('');
  const [recipientAddress, setRecipientAddress] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const wallet = useWallet();

  const getTokenDecimals = (token: TokenSymbol): number => {
    switch (token) {
      case 'SOL':
        return 9; // SOL has 9 decimals
      case 'USDC':
      case 'USDT':
        return 6; // USDC and USDT have 6 decimals
      default:
        return 9;
    }
  };

  const handleTransfer = async () => {
    console.log('Initiating transfer...');
    if (!wallet.publicKey || !selectedToken || !amount || !recipientAddress) {
      console.error('Missing required fields');
      return;
    }

    try {
      setIsLoading(true);

      // Initialize Wormhole
      const wh = await wormhole('Testnet', [solana]);

      const decimals = getTokenDecimals(selectedToken);
      const tokenAddress = SOLANA_TOKENS[selectedToken];

      const publicKeyString = wallet.publicKey?.toString();

      if (!publicKeyString) {
        throw new Error('Wallet public key is missing.');
      }

      // Create the transfer

      // Create token transfer following the documentation approach
      const transfer = await wh.tokenTransfer(
        tokenAddress as unknown as TokenId,
        BigInt(parseFloat(amount) * Math.pow(10, decimals)),
        wallet.publicKey.toString() as unknown as ChainAddress,
        recipientAddress as unknown as ChainAddress,
        true,
        undefined
      );

      console.log('Transfer created:', transfer);
      // Get transfer quote
      //   const quote = await TokenTransfer.quoteTransfer(
      //     wh,
      //     route.source.chain,
      //     route.destination.chain,
      //     transfer.transfer
      //   );
      //   console.log('Transfer quote:', quote);

      //   // Initiate transfer
      //   const receipt = await transfer.initiate(wallet.signTransaction);
      //   console.log('Transfer initiated:', receipt);

      //   onSuccess?.(receipt.transactionHash);
    } catch (error) {
      console.error('Transfer failed:', error);
      onError?.(error as Error);
    } finally {
      setIsLoading(false);
    }
  };

  console.log({
    amount,
    selectedToken,
    recipientAddress,
    publicKey: wallet.publicKey,
  });

  async function executeTransfer() {
    const transferParams = {
      sourceChain: 'Solana' as const,
      destinationChain: 'Avalanche' as const,
      tokenAmount: '0.05',
      sourceWallet: '4njo25A51RgbnbAkhRpj9UVtdDb3kh9nMHHTKQcYLaLq', // Your source wallet address
      destinationWallet: '0x170F099BFE5D87946a8e94fAd1748a8A3E2bcd13', // Your destination wallet address
      isAutomatic: false,
      nativeGasAmount: '0.01',
    };

    try {
      const result = await processTokenTransfer(transferParams);
      if (result.status === 'success') {
        console.log('Transfer completed successfully!');
        console.log('Transaction IDs:', result.transactionIds);
        console.log('Transfer Details:', result.transferDetails);
      } else {
        console.error('Transfer failed:', result.error);
      }
    } catch (error) {
      console.error('Error executing transfer:', error);
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto rounded-lg shadow-lg overflow-hidden">
        <div className="px-6 py-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Solana Transfer
          </h2>
          <button onClick={executeTransfer}>executeTransfer</button>
          <div className="space-y-6">
            {/* Token Selection */}
            <div>
              <label
                htmlFor="token"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Token
              </label>
              <select
                id="token"
                value={selectedToken}
                onChange={(e) =>
                  setSelectedToken(e.target.value as TokenSymbol)
                }
                className="mt-1 block w-full py-3 px-4 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Select token</option>
                {Object.entries(SOLANA_TOKENS).map(([symbol]) => (
                  <option key={symbol} value={symbol}>
                    {symbol}
                  </option>
                ))}
              </select>
            </div>

            {/* Amount Input */}
            <div>
              <label
                htmlFor="amount"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Amount
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <input
                  type="text"
                  id="amount"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^\d*\.?\d*$/.test(value)) {
                      setAmount(value);
                    }
                  }}
                  className="block w-full py-3 px-4 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Recipient Address Input */}
            <div>
              <label
                htmlFor="recipient"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Recipient Address
              </label>
              <input
                type="text"
                id="recipient"
                placeholder="Solana address..."
                value={recipientAddress}
                onChange={(e) => setRecipientAddress(e.target.value)}
                className="block w-full py-3 px-4 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Transfer Button */}
            <button
              onClick={handleTransfer}
              disabled={
                isLoading ||
                !amount ||
                !selectedToken ||
                !recipientAddress ||
                !wallet.publicKey
              }
              className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
                ${
                  isLoading ||
                  !amount ||
                  !selectedToken ||
                  !recipientAddress ||
                  !wallet.publicKey
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                }`}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Processing...
                </div>
              ) : (
                'Transfer'
              )}
            </button>
          </div>
        </div>

        {/* Connected Wallet Info */}
        {wallet.publicKey && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Connected Wallet</span>
              <span className="text-sm font-medium text-gray-900">
                {wallet.publicKey.toString().slice(0, 4)}...
                {wallet.publicKey.toString().slice(-4)}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
