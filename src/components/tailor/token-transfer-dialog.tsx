'use client';

import React, { useState, useEffect } from 'react';
import { useWallet } from '@/components/solana/privy-solana-adapter';
import { useConnection } from '@solana/wallet-adapter-react';
import { useCluster } from '@/components/cluster/cluster-data-access';
import { PublicKey } from '@solana/web3.js';
import { api } from '@/trpc/react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import {
  Send,
  Loader2,
  AlertCircle,
  Check,
  X,
  Info,
  Link
} from 'lucide-react';
import toast from 'react-hot-toast';
import { transferCompressedTokens } from '@/utils/transfer-token';

interface Customer {
  id: number;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
}

interface TokenTransferDialogProps {
  open: boolean;
  onClose: () => void;
  selectedCustomers: Customer[];
}

interface CustomerWalletInfo {
  id: number;
  walletAddress: string | null;
  status: 'pending' | 'success' | 'error';
  message?: string;
}

export const TokenTransferDialog = ({ 
  open, 
  onClose, 
  selectedCustomers 
}: TokenTransferDialogProps) => {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const { cluster } = useCluster();
  
  // Token state
  const [tokenMint, setTokenMint] = useState('');
  const [amount, setAmount] = useState('1');
  const [isTransferring, setIsTransferring] = useState(false);
  const [fetchingWallets, setFetchingWallets] = useState(false);
  const [transferResults, setTransferResults] = useState<{
    customer: Customer;
    success: boolean;
    message: string;
  }[]>([]);
  
  // Customer wallet cache
  const [customerWallets, setCustomerWallets] = useState<CustomerWalletInfo[]>([]);

  // Fetch tokens owned by the tailor
  const { data: tokensData, isLoading: isLoadingTokens } = api.tokens.getTokensByOwner.useQuery(
    { owner: publicKey?.toString() || '' },
    { enabled: !!publicKey }
  );

  // Fetch customer wallet addresses when dialog opens
  useEffect(() => {
    const fetchCustomerWallets = async () => {
      if (!open || selectedCustomers.length === 0) return;
      
      setFetchingWallets(true);
      const walletInfoPromises = selectedCustomers.map(async (customer) => {
        try {
          const identifier = customer.email || customer.id.toString();
          const response = await fetch(`/api/user/by-identifier?identifier=${identifier}`);
          const data = await response.json();
          
          return {
            id: customer.id,
            walletAddress: data.walletAddress || null,
            status: data.walletAddress ? 'success' : 'error',
            message: data.walletAddress ? undefined : 'No wallet found'
          } as CustomerWalletInfo;
        } catch (error) {
          return {
            id: customer.id,
            walletAddress: null,
            status: 'error',
            message: 'Failed to fetch wallet info'
          } as CustomerWalletInfo;
        }
      });
      
      const walletInfos = await Promise.all(walletInfoPromises);
      setCustomerWallets(walletInfos);
      setFetchingWallets(false);
    };
    
    fetchCustomerWallets();
  }, [open, selectedCustomers]);

  // Get customer full name
  const getCustomerName = (customer: Customer) => {
    return `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || 'Anonymous';
  };
  
  // Get customer wallet address
  const getCustomerWallet = (customerId: number): string | null => {
    const walletInfo = customerWallets.find(w => w.id === customerId);
    return walletInfo?.walletAddress || null;
  };

  // Handle token transfer
  const handleTokenTransfer = async () => {
    if (!publicKey || !tokenMint) {
      toast.error('Connect your wallet and select a token first');
      return;
    }

    try {
      setIsTransferring(true);
      setTransferResults([]);
      
      // Filter out customers without wallet addresses
      const eligibleCustomers = selectedCustomers.filter(customer => 
        getCustomerWallet(customer.id) !== null
      );
      
      if (eligibleCustomers.length === 0) {
        toast.error('None of the selected customers have a linked wallet address');
        setIsTransferring(false);
        return;
      }
      
      // For each customer, send tokens to their wallet address
      for (const customer of eligibleCustomers) {
        try {
          const walletAddress = getCustomerWallet(customer.id);
          
          if (!walletAddress) {
            setTransferResults(prev => [
              ...prev,
              {
                customer,
                success: false,
                message: 'No wallet address associated with this customer'
              }
            ]);
            continue;
          }
          
          const recipientPublicKey = new PublicKey(walletAddress);
          const mintPublicKey = new PublicKey(tokenMint);
          
          // Prepare the token transfer transaction
          const rpcEndpoint = process.env.NEXT_PUBLIC_RPC_ENDPOINT || cluster.endpoint;
          console.log(`Using RPC endpoint: ${rpcEndpoint}`);
          
          // Get a transaction object configured for token transfer
          const transaction = await transferCompressedTokens(
            mintPublicKey,
            publicKey,
            recipientPublicKey,
            Number(amount) * 1e5, // Convert to token units (assuming 5 decimals)
            rpcEndpoint
          );
          
          // Send the transaction through the wallet adapter
          console.log("Sending transaction via wallet adapter...");
          const txSignature = await sendTransaction(transaction, connection);
          console.log("Transaction sent! Signature:", txSignature);
          
          // Record successful transfer
          setTransferResults(prev => [
            ...prev,
            {
              customer,
              success: true,
              message: `Transfer successful: ${txSignature}`
            }
          ]);
          
          toast.success(`Tokens sent to ${getCustomerName(customer)}`);
        } catch (error: any) {
          console.error(`Token transfer failed for customer ${customer.id}:`, error);
          
          setTransferResults(prev => [
            ...prev,
            {
              customer,
              success: false,
              message: error.message || 'Transfer failed'
            }
          ]);
          
          toast.error(`Failed to send tokens to ${getCustomerName(customer)}`);
        }
      }
    } catch (error: any) {
      console.error('Token transfer failed:', error);
      toast.error(error.message || 'Failed to send tokens');
    } finally {
      setIsTransferring(false);
    }
  };
  
  // Get explorer URL for a transaction signature
  const getExplorerUrl = (signature: string) => {
    const network = cluster.network?.includes('devnet') 
      ? 'devnet' 
      : cluster.network?.includes('testnet')
      ? 'testnet'
      : '';
    
    return `https://explorer.solana.com/tx/${signature}${network ? `?cluster=${network}` : ''}`;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Send Tokens to Customers</DialogTitle>
          <DialogDescription>
            Send your tokens to {selectedCustomers.length} selected {selectedCustomers.length === 1 ? 'customer' : 'customers'}.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Token selection */}
          <div className="space-y-2">
            <Label htmlFor="token">Select Token</Label>
            <Select
              value={tokenMint}
              onValueChange={setTokenMint}
            >
              <SelectTrigger id="token" className="w-full">
                <SelectValue placeholder="Select a token to send" />
              </SelectTrigger>
              <SelectContent>
                {isLoadingTokens ? (
                  <div className="flex items-center justify-center p-2">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span>Loading tokens...</span>
                  </div>
                ) : !tokensData?.tokens?.length ? (
                  <div className="flex items-center justify-center p-2 text-gray-400">
                    <Info className="h-4 w-4 mr-2" />
                    <span>No tokens found in your wallet</span>
                  </div>
                ) : (
                  tokensData.tokens.map((token) => (
                    <SelectItem key={token.mint} value={token.mint}>
                      {token.name || token.mint.slice(0, 4) + '...' + token.mint.slice(-4)}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          
          {/* Amount input */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              min="0.00001"
              step="0.00001"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          
          {/* Recipients list with wallet status */}
          <div className="space-y-2">
            <Label>Recipients ({selectedCustomers.length})</Label>
            <div className="max-h-32 overflow-y-auto rounded-md border border-gray-800 bg-gray-900/50 p-2">
              {fetchingWallets ? (
                <div className="flex items-center justify-center py-2">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span className="text-sm">Checking wallet addresses...</span>
                </div>
              ) : (
                <ul className="space-y-1">
                  {selectedCustomers.map((customer) => {
                    const walletInfo = customerWallets.find(w => w.id === customer.id);
                    const hasWallet = !!walletInfo?.walletAddress;
                    
                    return (
                      <li key={customer.id} className="text-sm flex justify-between items-center">
                        <span>{getCustomerName(customer)}</span>
                        {!walletInfo ? (
                          <span className="text-gray-400 text-xs">Loading...</span>
                        ) : hasWallet ? (
                          <span className="text-xs flex items-center text-green-400">
                            <Check className="h-3 w-3 mr-1" />
                            Wallet linked
                          </span>
                        ) : (
                          <span className="text-xs flex items-center text-red-400">
                            <X className="h-3 w-3 mr-1" />
                            No wallet
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
          
          {/* Warning about customers without wallets */}
          {!fetchingWallets && customerWallets.some(w => !w.walletAddress) && (
            <div className="bg-amber-900/20 border border-amber-800 text-amber-500 px-3 py-2 rounded-lg flex items-start text-sm">
              <AlertCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <p>Some customers don't have a linked wallet address and won't receive tokens.</p>
              </div>
            </div>
          )}
          
          {/* Transfer results */}
          {transferResults.length > 0 && (
            <div className="space-y-2">
              <Label>Results</Label>
              <div className="max-h-40 overflow-y-auto rounded-md border border-gray-800 bg-gray-900/50 p-2">
                <ul className="space-y-2">
                  {transferResults.map((result, index) => {
                    // Extract transaction signature from successful results
                    const txSignature = result.success ? 
                      result.message.split(': ')[1] : '';
                    
                    return (
                      <li key={index} className="text-sm flex items-start gap-2">
                        {result.success ? (
                          <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        ) : (
                          <X className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                        )}
                        <div>
                          <div className="font-medium">{getCustomerName(result.customer)}</div>
                          <div className={`text-xs ${result.success ? 'text-green-400' : 'text-red-400'}`}>
                            {result.message}
                            {result.success && txSignature && (
                              <a 
                                href={getExplorerUrl(txSignature)} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-flex items-center text-cyan-400 hover:text-cyan-300 ml-1"
                              >
                                <Link className="h-3 w-3 ml-1" />
                              </a>
                            )}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isTransferring}>
            Cancel
          </Button>
          <Button 
            onClick={handleTokenTransfer}
            disabled={
              isTransferring || 
              !tokenMint || 
              !amount || 
              Number(amount) <= 0 ||
              fetchingWallets ||
              (customerWallets.length > 0 && !customerWallets.some(w => !!w.walletAddress))
            }
            className="bg-cyan-600 hover:bg-cyan-700"
          >
            {isTransferring ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Send Tokens
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 