// transfer-test.ts

import { wormhole, ChainAddress, TokenId } from '@wormhole-foundation/sdk';
import solana from '@wormhole-foundation/sdk/solana';
import {
  Keypair,
  Connection,
  clusterApiUrl,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';
// import dotenv from 'dotenv';

// Load environment variables (optional for private keys etc)
// dotenv.config();

// Define available Solana tokens
const SOLANA_TOKENS = {
  SOL: 'native',
  USDC: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  USDT: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
} as const;

type TokenSymbol = keyof typeof SOLANA_TOKENS;

// ------------ CONFIGURATION --------------
const PRIVATE_KEY = ''; // from environment variable
const AMOUNT = '0.1'; // Example: transfer 0.1 SOL
const SELECTED_TOKEN: TokenSymbol = 'SOL'; // 'SOL', 'USDC' or 'USDT'
const RECIPIENT_ADDRESS = '23wRQUTNurqBjnRYpwiSGKaUUAZTzi5so5mmhTgaJbWf'; // <-- Put recipient address here
const NETWORK = 'Testnet'; // Wormhole expects 'Testnet'
// -----------------------------------------

async function main() {
  console.log('Starting transfer...');

  if (!PRIVATE_KEY) {
    throw new Error('Private key not provided!');
  }

  const keypair = Keypair.fromSecretKey(
    Uint8Array.from(JSON.parse(PRIVATE_KEY))
  );

  const senderAddress = keypair.publicKey.toBase58();
  console.log('Sender address:', senderAddress);

  // Connect to Solana
  const connection = new Connection(clusterApiUrl('testnet'), 'confirmed');

  // Initialize Wormhole SDK
  const wh = await wormhole(NETWORK, [solana]);

  // Determine decimals
  const getTokenDecimals = (token: TokenSymbol) => {
    switch (token) {
      case 'SOL':
        return 9;
      case 'USDC':
      case 'USDT':
        return 6;
      default:
        return 9;
    }
  };

  const decimals = getTokenDecimals(SELECTED_TOKEN);
  const tokenAddress = SOLANA_TOKENS[SELECTED_TOKEN];

  const formattedAmount = BigInt(Math.floor(Number(AMOUNT) * 10 ** decimals));

  console.log(`Preparing to transfer ${AMOUNT} ${SELECTED_TOKEN}...`);

  try {
    // Create transfer
    const transfer = await wh.tokenTransfer(
      tokenAddress as unknown as TokenId,
      formattedAmount,
      senderAddress as unknown as ChainAddress,
      RECIPIENT_ADDRESS as unknown as ChainAddress,
      true,
      undefined
    );

    console.log('Transfer object created', transfer);

    // Sign and send
    // const receipt = await transfer.initiate(async (transaction) => {
    //   const signed = await connection.sendTransaction(transaction, [keypair]);
    //   return {
    //     transactionHash: signed,
    //   };
    // });

    // console.log('Transfer successful!');
    // console.log('Transaction Hash:', receipt.transactionHash);
  } catch (error) {
    console.error('Error during transfer:', error);
  }
}

main().catch(console.error);
