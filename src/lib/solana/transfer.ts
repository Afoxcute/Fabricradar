import {
  TokenId,
  wormhole,
  amount,
  TokenAddress,
  ChainAddress,
  UniversalOrNative,
} from '@wormhole-foundation/sdk';
import solana from '@wormhole-foundation/sdk/solana';

// 1. Basic Configuration
const SOLANA_CONFIG = {
  network: 'Testnet' as const,
  tokens: {
    SOL: {
      address: 'native',
      decimals: 9,
    },
    USDC: {
      address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
      decimals: 6,
    },
    USDT: {
      address: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
      decimals: 6,
    },
  },
};

// 2. Transfer Parameters Interface
interface SolanaTransferParams {
  tokenSymbol: 'SOL' | 'USDC' | 'USDT';
  amount: string;
  sourceAddress: string;
  recipientAddress: string;
  signTransaction: (transaction: any) => Promise<any>;
}

// 3. Main Transfer Function
export async function createSolanaTransfer(params: SolanaTransferParams) {
  const {
    tokenSymbol,
    amount: amountStr,
    sourceAddress,
    recipientAddress,
    signTransaction,
  } = params;

  const sender: ChainAddress = {
    chain: 'Solana',
    address: sourceAddress as unknown as UniversalOrNative<'Solana'>,
  };

  const recipient: ChainAddress = {
    chain: 'Solana',
    address: recipientAddress as unknown as UniversalOrNative<'Solana'>,
  };

  try {
    // Initialize Wormhole
    const wh = await wormhole('Testnet', [solana]);

    // Get chain context
    const solanaChain = wh.getChain('Solana');

    const token: TokenId = {
      chain: 'Solana',
      address: SOLANA_CONFIG.tokens[tokenSymbol]
        .address as TokenAddress<'Solana'>,
    };

    // Format amount with proper decimals
    const decimals = SOLANA_CONFIG.tokens[tokenSymbol].decimals;
    const transferAmount = amount.units(amount.parse(amountStr, decimals));

    // Create the transfer
    const transfer = await wh.tokenTransfer(
      token,
      transferAmount,
      sender,
      recipient,
      false, // automatic
      undefined, // payload
      undefined // native gas
    );

    console.log(transfer);

    // Get quote
    // const quote = await transfer.getQuote();
    // console.log('Transfer quote:', quote);

    // // Initiate transfer
    // const receipt = await transfer.initiateTransfer(signTransaction);
    // console.log('Transfer initiated:', receipt);

    // return receipt;
  } catch (error) {
    console.error('Transfer failed:', error);
    throw error;
  }
}
