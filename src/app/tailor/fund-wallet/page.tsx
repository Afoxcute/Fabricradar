'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@/components/solana/privy-solana-adapter';
import { WalletButton } from '@/components/solana/solana-provider';
import { useConnection } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { useFundWallet } from '@privy-io/react-auth/solana';
import { Button } from '@/components/ui/button';
import { Loader2, CreditCard, Wallet, DollarSign, ArrowRight, RefreshCw } from 'lucide-react';
import { TailorNav } from '@/components/tailor/tailor-nav';
import BackgroundEffect from '@/components/background-effect/background-effect';
import Header from '@/components/header/header';
import toast from 'react-hot-toast';
import { useCluster } from '@/components/cluster/cluster-data-access';
import { useGetUSDCBalance } from '@/components/account/account-data-access';

export default function TailorFundWalletPage() {
  const { publicKey, connected } = useWallet();
  const { connection } = useConnection();
  const { cluster } = useCluster();
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [fundingLoading, setFundingLoading] = useState(false);
  const [fundingAmount, setFundingAmount] = useState('10');
  const [preferredProvider, setPreferredProvider] = useState<'coinbase' | 'moonpay'>('moonpay');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Handle user exiting funding flow
  const handleUserExitedFunding = (params: { 
    address: string; 
    cluster: { name: string }; 
    fundingMethod: string | null; 
    balance: bigint | undefined 
  }) => {
    // Refresh balances
    setRefreshTrigger(prev => prev + 1);
    
    // Show appropriate toast message
    if (params.balance && params.balance > BigInt(0)) {
      toast.success('Funding completed successfully!');
    } else {
      toast('Funding flow exited. You can try again anytime.');
    }
  };

  // Enhanced useFundWallet hook with callback
  const { fundWallet } = useFundWallet({
    onUserExited: handleUserExitedFunding
  });

  // Fetch SOL balance
  useEffect(() => {
    async function fetchBalance() {
      if (connected && publicKey) {
        try {
          setLoading(true);
          const balance = await connection.getBalance(publicKey);
          setBalance(balance / LAMPORTS_PER_SOL);
        } catch (error) {
          console.error('Error fetching balance:', error);
          setBalance(null);
        } finally {
          setLoading(false);
        }
      } else {
        setBalance(null);
      }
    }

    fetchBalance();
    
    // Set up balance refresh interval when connected
    let intervalId: NodeJS.Timeout | undefined;
    if (connected && publicKey) {
      intervalId = setInterval(fetchBalance, 15000); // Refresh every 15 seconds
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [connected, publicKey, connection, refreshTrigger]);

  // Get USDC balance
  const { data: usdcBalance, isLoading: isLoadingUsdc, refetch: refetchUsdcBalance } = useGetUSDCBalance({
    address: publicKey!
  });

  // Ensure USDC balances are refreshed when the refresh trigger changes
  useEffect(() => {
    if (connected && publicKey) {
      refetchUsdcBalance();
    }
  }, [refreshTrigger, connected, publicKey, refetchUsdcBalance]);

  const handleFundWithUSDC = async () => {
    if (!publicKey) {
      toast.error('Please connect your wallet first');
      return;
    }

    try {
      setFundingLoading(true);
      
      // Determine cluster for funding
      const clusterName = cluster.network?.includes('mainnet') ? 'mainnet-beta' : 'devnet';
      
      // Call fundWallet with enhanced options
      await fundWallet(publicKey.toString(), {
        cluster: { name: clusterName },
        amount: fundingAmount,
        asset: 'USDC', // Specify USDC asset
        card: {
          preferredProvider: preferredProvider
        },
        defaultFundingMethod: 'card', // Direct to card funding immediately
        uiConfig: {
          receiveFundsTitle: "Add USDC to Your Tailor Wallet",
          receiveFundsSubtitle: "Fund your wallet with USDC to manage orders on our platform"
        }
      });
      
      toast.success(`Funding initiated for ${fundingAmount} USDC`);
    } catch (error) {
      console.error('Error funding wallet with USDC:', error);
      toast.error('Failed to fund wallet with USDC. Please try again.');
    } finally {
      setFundingLoading(false);
    }
  };

  const handleRefreshBalances = () => {
    setRefreshTrigger(prev => prev + 1);
    toast.success('Refreshing balances...');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#050b18] to-[#0a1428] text-white relative">
      <BackgroundEffect />
      <Header />
      
      <div className="flex">
        <TailorNav />
        
        <div className="ml-64 flex-1 p-8 relative z-10">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white">Fund Your Wallet</h1>
            <p className="text-gray-400 mt-2">
              Add USDC to your Solana wallet to manage orders and receive payments
            </p>
          </div>
          
          <div className="max-w-3xl">
            {connected ? (
              <>
                <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-800 rounded-xl p-6 mb-6">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                    <div>
                      <h2 className="text-xl font-semibold text-white mb-1">Wallet Status</h2>
                      <p className="text-sm text-gray-400 break-all">{publicKey?.toString()}</p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleRefreshBalances}
                      className="flex items-center gap-1"
                    >
                      <RefreshCw className="h-3 w-3" />
                      Refresh Balances
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="bg-gray-800/50 px-4 py-3 rounded-lg border border-gray-700">
                      <p className="text-sm text-gray-400">SOL Balance</p>
                      <p className="font-bold text-lg">
                        {loading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : balance !== null ? (
                          `${balance.toFixed(5)} SOL`
                        ) : (
                          'Unable to fetch'
                        )}
                      </p>
                    </div>
                    <div className="bg-blue-900/30 px-4 py-3 rounded-lg border border-blue-800">
                      <p className="text-sm text-blue-400">USDC Balance</p>
                      <p className="font-bold text-lg text-blue-300">
                        {isLoadingUsdc ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : usdcBalance !== undefined ? (
                          `${usdcBalance.toFixed(2)} USDC`
                        ) : (
                          '0.00 USDC'
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
                  <div className="flex items-center mb-4">
                    <DollarSign className="h-6 w-6 text-cyan-500 mr-2" />
                    <h2 className="text-xl font-semibold">Add USDC to Your Wallet</h2>
                  </div>
                  
                  <p className="text-gray-400 mb-6">
                    Adding USDC to your wallet will allow you to manage orders, confirm garment deliveries, 
                    and handle refunds on the platform.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Amount (USDC)
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={fundingAmount}
                          onChange={(e) => setFundingAmount(e.target.value)}
                          step="1"
                          min="1"
                          max="1000"
                          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                          placeholder="10"
                          disabled={fundingLoading}
                        />
                        <span className="font-medium text-blue-300">USDC</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Min: 1 USDC, Max: 1000 USDC
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Payment Provider
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          className={`px-4 py-2 rounded-lg flex items-center justify-center gap-2 ${
                            preferredProvider === 'moonpay' 
                              ? 'bg-cyan-900/50 border border-cyan-700 text-cyan-500' 
                              : 'bg-gray-800 border border-gray-700 text-gray-400'
                          }`}
                          onClick={() => setPreferredProvider('moonpay')}
                          disabled={fundingLoading}
                        >
                          <CreditCard className="h-4 w-4" />
                          <span>MoonPay</span>
                        </button>
                        <button
                          className={`px-4 py-2 rounded-lg flex items-center justify-center gap-2 ${
                            preferredProvider === 'coinbase' 
                              ? 'bg-cyan-900/50 border border-cyan-700 text-cyan-500' 
                              : 'bg-gray-800 border border-gray-700 text-gray-400'
                          }`}
                          onClick={() => setPreferredProvider('coinbase')}
                          disabled={fundingLoading}
                        >
                          <CreditCard className="h-4 w-4" />
                          <span>Coinbase</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={handleFundWithUSDC}
                    disabled={fundingLoading || !connected}
                    className="w-full mt-6 flex items-center justify-center gap-2 py-5 bg-cyan-600 hover:bg-cyan-700"
                  >
                    {fundingLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Wallet className="h-4 w-4" />
                        Fund Tailor Wallet with USDC
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </>
                    )}
                  </Button>

                  <div className="bg-cyan-900/20 border border-cyan-800 rounded-lg p-4 mt-6">
                    <h3 className="text-sm font-semibold text-cyan-400 flex items-center gap-2 mb-2">
                      <Wallet className="h-4 w-4" />
                      Wallet Information for Tailors
                    </h3>
                    <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
                      <li>Your wallet is used for receiving payments from customers</li>
                      <li>USDC is required for transactions on the platform</li>
                      <li>Maintain a minimum balance to ensure smooth order processing</li>
                      <li>You&apos;ll receive payments directly to this wallet when orders are completed</li>
                    </ul>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-800 rounded-xl p-8 text-center">
                <Wallet className="h-16 w-16 text-cyan-600/50 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-white mb-4">Connect Your Wallet</h2>
                <p className="text-gray-400 mb-6 max-w-md mx-auto">
                  Please connect your Solana wallet to manage your tailor account and receive payments.
                </p>
                <div className="flex justify-center">
                  <WalletButton />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 