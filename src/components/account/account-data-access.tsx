'use client'

import { TOKEN_2022_PROGRAM_ID, TOKEN_PROGRAM_ID } from '@solana/spl-token'
import { useConnection } from '@solana/wallet-adapter-react'
import { useWallet } from '@/components/solana/privy-solana-adapter'
import {
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  TransactionMessage,
  TransactionSignature,
  VersionedTransaction,
} from '@solana/web3.js'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { useTransactionToast } from '../ui/ui-layout'
import { useCluster } from '../cluster/cluster-data-access'
import { getAssociatedTokenAddress } from '@solana/spl-token'
import { AccountLayout } from '@solana/spl-token'

// USDC token mint address for devnet
export const USDC_MINT_ADDRESS = '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU';

// Helper function to format balances with proper decimals
export function formatBalance(lamports: number, decimals: number = 9): number {
  return lamports / Math.pow(10, decimals);
}

// New hook to fetch both SOL and USDC balances in parallel
export function useGetAllBalances({ address }: { address: PublicKey | null }) {
  const { connection } = useConnection()
  const { cluster } = useCluster()

  return useQuery({
    queryKey: ['get-all-balances', { endpoint: connection.rpcEndpoint, address: address?.toString() }],
    queryFn: async () => {
      // If no address is provided, return zero balances
      if (!address) {
        return { sol: 0, usdc: 0 };
      }

      try {
        // Fetch SOL balance and USDC token account in parallel
        const [solBalance, tokenAccounts] = await Promise.all([
          connection.getBalance(address),
          connection.getParsedTokenAccountsByOwner(address, {
            programId: TOKEN_PROGRAM_ID,
          }),
        ]);

        // Format SOL balance
        const formattedSolBalance = formatBalance(solBalance);

        // Only look for USDC on devnet
        let usdcBalance = 0;
        if (cluster.network?.includes('devnet')) {
          // Find USDC token account in the list of token accounts
          const usdcAccount = tokenAccounts.value.find(
            account => 
              account.account.data.parsed?.info?.mint?.toLowerCase() === 
              USDC_MINT_ADDRESS.toLowerCase()
          );

          if (usdcAccount) {
            const tokenAmount = usdcAccount.account.data.parsed?.info?.tokenAmount;
            if (tokenAmount) {
              // USDC has 6 decimals
              usdcBalance = formatBalance(Number(tokenAmount.amount), 6);
            }
          }
        }

        return {
          sol: formattedSolBalance,
          usdc: usdcBalance,
          loading: false
        };
      } catch (error) {
        console.error('Error fetching balances:', error);
        throw error;
      }
    },
    // Enable the query only if we have an address
    enabled: !!address,
    // Refetch automatically every 15 seconds and when window regains focus
    refetchInterval: 15000,
    refetchOnWindowFocus: true,
    // Cache the result for 10 seconds
    staleTime: 10000,
  });
}

export function useGetBalance({ address }: { address: PublicKey }) {
  const { connection } = useConnection()

  return useQuery({
    queryKey: ['get-balance', { endpoint: connection.rpcEndpoint, address }],
    queryFn: () => connection.getBalance(address),
  })
}

export function useGetSignatures({ address }: { address: PublicKey }) {
  const { connection } = useConnection()

  return useQuery({
    queryKey: ['get-signatures', { endpoint: connection.rpcEndpoint, address }],
    queryFn: () => connection.getSignaturesForAddress(address),
  })
}

export function useGetUSDCBalance({ address }: { address: PublicKey }) {
  const { connection } = useConnection()
  const { cluster } = useCluster()
  
  return useQuery({
    queryKey: ['get-usdc-balance', { endpoint: connection.rpcEndpoint, address, tokenMint: USDC_MINT_ADDRESS }],
    queryFn: async () => {
      try {
        // Only proceed if we're on devnet
        if (!cluster.network?.includes('devnet')) {
          console.log('USDC balance is only available on devnet');
          return 0; // Return 0 balance for non-devnet clusters
        }
        
        // Create a token mint public key
        const mintPublicKey = new PublicKey(USDC_MINT_ADDRESS);
        
        // Find the associated token address
        const tokenAddress = await getAssociatedTokenAddress(
          mintPublicKey,
          address,
          false,   // allowOwnerOffCurve
          TOKEN_PROGRAM_ID, // programId
          TOKEN_PROGRAM_ID  // associatedTokenProgramId
        );
        
        try {
          // Get account info directly using getAccountInfo for better accuracy
          const accountInfo = await connection.getAccountInfo(tokenAddress);
          
          // If no account exists yet, return zero balance
          if (!accountInfo) {
            return 0;
          }
          
          // Parse account data using AccountLayout from spl-token
          const accountData = AccountLayout.decode(accountInfo.data);
          
          // USDC has 6 decimals, so we divide by 10^6
          return Number(accountData.amount) / 1_000_000;
        } catch (error) {
          // Try alternate method for TOKEN_2022_PROGRAM_ID if first approach fails
          try {
            const token2022Address = await getAssociatedTokenAddress(
              mintPublicKey,
              address,
              false,
              TOKEN_2022_PROGRAM_ID,
              TOKEN_2022_PROGRAM_ID
            );
            
            const accountInfo = await connection.getAccountInfo(token2022Address);
            if (!accountInfo) {
              return 0;
            }
            
            const accountData = AccountLayout.decode(accountInfo.data);
            return Number(accountData.amount) / 1_000_000;
          } catch (innerError) {
            console.error('Error fetching TOKEN_2022 USDC balance:', innerError);
            return 0;
          }
        }
      } catch (error) {
        console.error('Error fetching USDC balance:', error);
        return 0;
      }
    },
    // Re-fetch every 15 seconds
    refetchInterval: 15000,
  });
}

export function useGetTokenAccounts({ address }: { address: PublicKey }) {
  const { connection } = useConnection()

  return useQuery({
    queryKey: ['get-token-accounts', { endpoint: connection.rpcEndpoint, address: address?.toString() }],
    queryFn: async () => {
      try {
        // Fetch token accounts from both TOKEN_PROGRAM_ID and TOKEN_2022_PROGRAM_ID in parallel
      const [tokenAccounts, token2022Accounts] = await Promise.all([
        connection.getParsedTokenAccountsByOwner(address, {
          programId: TOKEN_PROGRAM_ID,
          }).catch(err => {
            console.error('Error fetching TOKEN_PROGRAM_ID accounts:', err);
            return { value: [] };
        }),
        connection.getParsedTokenAccountsByOwner(address, {
          programId: TOKEN_2022_PROGRAM_ID,
          }).catch(err => {
            console.error('Error fetching TOKEN_2022_PROGRAM_ID accounts:', err);
            return { value: [] };
          }),
        ]);

        // Combine and process accounts
        const allAccounts = [...tokenAccounts.value, ...token2022Accounts.value];
        
        // Filter out accounts with zero balance
        const nonEmptyAccounts = allAccounts.filter(account => {
          const info = account.account.data.parsed?.info;
          const tokenAmount = info?.tokenAmount;
          return tokenAmount?.uiAmount > 0;
        });
        
        // Map to a more usable format with token details
        return nonEmptyAccounts.map(account => {
          const info = account.account.data.parsed?.info;
          const tokenAmount = info?.tokenAmount;
          
          return {
            pubkey: account.pubkey,
            mint: info?.mint || '',
            owner: info?.owner || '',
            amount: tokenAmount?.amount || '0',
            decimals: tokenAmount?.decimals || 0,
            uiAmount: tokenAmount?.uiAmount || 0,
            programId: account.account.owner
          };
        });
      } catch (error) {
        console.error('Error in useGetTokenAccounts:', error);
        // Return empty array instead of throwing to prevent UI breakage
        return [];
      }
    },
    // Refetch every 15 seconds
    refetchInterval: 15000,
    // Use stale data while refetching
    staleTime: 10000,
    // Return empty array if error occurs
    retry: 3,
  });
}

export function useTransferSol({ address }: { address: PublicKey }) {
  const { connection } = useConnection()
  const transactionToast = useTransactionToast()
  const wallet = useWallet()
  const client = useQueryClient()

  return useMutation({
    mutationKey: ['transfer-sol', { endpoint: connection.rpcEndpoint, address }],
    mutationFn: async (input: { destination: PublicKey; amount: number }) => {
      let signature: TransactionSignature = ''
      try {
        const { transaction, latestBlockhash } = await createTransaction({
          publicKey: address,
          destination: input.destination,
          amount: input.amount,
          connection,
        })

        // Send transaction and await for signature
        signature = await wallet.sendTransaction(transaction, connection)

        // Send transaction and await for signature
        await connection.confirmTransaction({ signature, ...latestBlockhash }, 'confirmed')

        console.log(signature)
        return signature
      } catch (error: unknown) {
        console.log('error', `Transaction failed! ${error}`, signature)

        return
      }
    },
    onSuccess: (signature) => {
      if (signature) {
        transactionToast(signature)
      }
      return Promise.all([
        client.invalidateQueries({
          queryKey: ['get-balance', { endpoint: connection.rpcEndpoint, address }],
        }),
        client.invalidateQueries({
          queryKey: ['get-signatures', { endpoint: connection.rpcEndpoint, address }],
        }),
      ])
    },
    onError: (error: unknown) => {
      toast.error(`Transaction failed! ${error}`)
    },
  })
}

export function useRequestAirdrop({ address }: { address: PublicKey }) {
  const { connection } = useConnection()
  const transactionToast = useTransactionToast()
  const client = useQueryClient()

  return useMutation({
    mutationKey: ['airdrop', { endpoint: connection.rpcEndpoint, address }],
    mutationFn: async (amount: number = 1) => {
      const [latestBlockhash, signature] = await Promise.all([
        connection.getLatestBlockhash(),
        connection.requestAirdrop(address, amount * LAMPORTS_PER_SOL),
      ])

      await connection.confirmTransaction({ signature, ...latestBlockhash }, 'confirmed')
      return signature
    },
    onSuccess: (signature) => {
      transactionToast(signature)
      return Promise.all([
        client.invalidateQueries({
          queryKey: ['get-balance', { endpoint: connection.rpcEndpoint, address }],
        }),
        client.invalidateQueries({
          queryKey: ['get-signatures', { endpoint: connection.rpcEndpoint, address }],
        }),
      ])
    },
  })
}

async function createTransaction({
  publicKey,
  destination,
  amount,
  connection,
}: {
  publicKey: PublicKey
  destination: PublicKey
  amount: number
  connection: Connection
}): Promise<{
  transaction: VersionedTransaction
  latestBlockhash: { blockhash: string; lastValidBlockHeight: number }
}> {
  // Get the latest blockhash to use in our transaction
  const latestBlockhash = await connection.getLatestBlockhash()

  // Create instructions to send, in this case a simple transfer
  const instructions = [
    SystemProgram.transfer({
      fromPubkey: publicKey,
      toPubkey: destination,
      lamports: amount * LAMPORTS_PER_SOL,
    }),
  ]

  // Create a new TransactionMessage with version and compile it to legacy
  const messageLegacy = new TransactionMessage({
    payerKey: publicKey,
    recentBlockhash: latestBlockhash.blockhash,
    instructions,
  }).compileToLegacyMessage()

  // Create a new VersionedTransaction which supports legacy and v0
  const transaction = new VersionedTransaction(messageLegacy)

  return {
    transaction,
    latestBlockhash,
  }
}
