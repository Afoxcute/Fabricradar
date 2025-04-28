import {
  Chain,
  Network,
  TokenId,
  TokenTransfer,
  Wormhole,
  amount,
  isTokenId,
  wormhole,
} from '@wormhole-foundation/sdk';
import evm from '@wormhole-foundation/sdk/evm';
import solana from '@wormhole-foundation/sdk/solana';

interface TransferParams {
  sourceChain: Chain;
  destinationChain: Chain;
  tokenAmount: string;
  sourceWallet: string;
  destinationWallet: string;
  isAutomatic?: boolean;
  nativeGasAmount?: string;
}

interface TransferResult {
  status: 'success' | 'failed';
  transactionIds: string[];
  timestamp: string;
  transferDetails: {
    sourceChain: string;
    destinationChain: string;
    amount: string;
    sender: string;
    receiver: string;
  };
  error?: string;
}

export async function processTokenTransfer(
  params: TransferParams
): Promise<TransferResult> {
  try {
    // Initialize Wormhole with testnet (change to 'Mainnet' for production)
    const wh = await wormhole('Testnet', [evm, solana]);

    // Get chain contexts
    const sendChain = wh.getChain(params.sourceChain);
    const rcvChain = wh.getChain(params.destinationChain);

    // Setup native token (you can modify this to use specific tokens)
    const token = Wormhole.tokenId(sendChain.chain, 'native');

    // Get token decimals
    const decimals = isTokenId(token)
      ? Number(await wh.getDecimals(token.chain, token.address))
      : sendChain.config.nativeTokenDecimals;

    // Configure transfer parameters
    const transferConfig = {
      token,
      amount: amount.units(amount.parse(params.tokenAmount, decimals)),
      source: {
        chain: sendChain,
        address: params.sourceWallet,
        // You'll need to implement proper signer handling here
        signer: await getSigner(sendChain),
      },
      destination: {
        chain: rcvChain,
        address: params.destinationWallet,
        // You'll need to implement proper signer handling here
        signer: await getSigner(rcvChain),
      },
      delivery: {
        automatic: params.isAutomatic || false,
        nativeGas: params.nativeGasAmount
          ? amount.units(amount.parse(params.nativeGasAmount, decimals))
          : undefined,
      },
    };

    // Create and execute transfer
    const transfer = await wh.tokenTransfer(
      transferConfig.token,
      transferConfig.amount,
      transferConfig.source.address,
      transferConfig.destination.address,
      transferConfig.delivery.automatic,
      undefined, // Optional payload
      transferConfig.delivery.nativeGas
    );

    // Get transfer quote
    const quote = await TokenTransfer.quoteTransfer(
      wh,
      transferConfig.source.chain,
      transferConfig.destination.chain,
      transfer.transfer
    );

    // Validate amount for automatic transfers
    if (transfer.transfer.automatic && quote.destinationToken.amount < 0) {
      throw new Error('Amount too low to cover fees and requested native gas');
    }

    // Initialize transfer
    console.log('Initiating transfer...');
    const sourceTxIds = await transfer.initiateTransfer(
      transferConfig.source.signer
    );

    let destinationTxIds: string[] = [];

    // Handle manual transfers
    if (!params.isAutomatic) {
      console.log('Waiting for attestation...');
      await transfer.fetchAttestation(60_000);

      console.log('Completing transfer...');
      destinationTxIds = await transfer.completeTransfer(
        transferConfig.destination.signer
      );
    }

    // Prepare result
    const result: TransferResult = {
      status: 'success',
      transactionIds: [...sourceTxIds, ...destinationTxIds],
      timestamp: new Date().toISOString(),
      transferDetails: {
        sourceChain: params.sourceChain.toString(),
        destinationChain: params.destinationChain.toString(),
        amount: params.tokenAmount,
        sender: params.sourceWallet,
        receiver: params.destinationWallet,
      },
    };

    return result;
  } catch (error) {
    console.error('Transfer failed:', error);
    return {
      status: 'failed',
      transactionIds: [],
      timestamp: new Date().toISOString(),
      transferDetails: {
        sourceChain: params.sourceChain.toString(),
        destinationChain: params.destinationChain.toString(),
        amount: params.tokenAmount,
        sender: params.sourceWallet,
        receiver: params.destinationWallet,
      },
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}
