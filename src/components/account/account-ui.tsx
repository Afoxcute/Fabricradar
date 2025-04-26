'use client'

import { useWallet } from '@/components/solana/privy-solana-adapter'
import { LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js'
import { IconRefresh } from '@tabler/icons-react'
import { useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { AppModal, ellipsify } from '../ui/ui-layout'
import { useCluster } from '../cluster/cluster-data-access'
import { ExplorerLink } from '../cluster/cluster-ui'
import {
  useGetBalance,
  useGetSignatures,
  useGetTokenAccounts,
  useRequestAirdrop,
  useTransferSol,
  useGetAllBalances,
} from './account-data-access'
import { Skeleton } from '../ui/skeleton'
import { USDC_MINT_ADDRESS } from './account-data-access'
import Link from 'next/link'

export function AccountBalance({ address }: { address: PublicKey }) {
  const query = useGetBalance({ address })

  return (
    <div>
      <h1 className="text-5xl font-bold cursor-pointer" onClick={() => query.refetch()}>
        {query.data ? <BalanceSol balance={query.data} /> : '...'} SOL
      </h1>
    </div>
  )
}
export function AccountChecker() {
  const { publicKey } = useWallet()
  if (!publicKey) {
    return null
  }
  return <AccountBalanceCheck address={publicKey} />
}
export function AccountBalanceCheck({ address }: { address: PublicKey }) {
  const { cluster } = useCluster()
  const mutation = useRequestAirdrop({ address })
  const query = useGetBalance({ address })

  if (query.isLoading) {
    return null
  }
  if (query.isError || !query.data) {
    return (
      <div className="alert alert-warning text-warning-content/80 rounded-none flex justify-center">
        <span>
          You are connected to <strong>{cluster.name}</strong> but your account is not found on this cluster.
        </span>
        <button
          className="btn btn-xs btn-neutral"
          onClick={() => mutation.mutateAsync(1).catch((err) => console.log(err))}
        >
          Request Airdrop
        </button>
      </div>
    )
  }
  return null
}

export function AccountButtons({ address }: { address: PublicKey }) {
  const wallet = useWallet()
  const { cluster } = useCluster()
  const [showAirdropModal, setShowAirdropModal] = useState(false)
  const [showReceiveModal, setShowReceiveModal] = useState(false)
  const [showSendModal, setShowSendModal] = useState(false)

  return (
    <div>
      <ModalAirdrop hide={() => setShowAirdropModal(false)} address={address} show={showAirdropModal} />
      <ModalReceive address={address} show={showReceiveModal} hide={() => setShowReceiveModal(false)} />
      <ModalSend address={address} show={showSendModal} hide={() => setShowSendModal(false)} />
      <div className="space-x-2">
        <button
          disabled={cluster.network?.includes('mainnet')}
          className="btn btn-xs lg:btn-md btn-outline"
          onClick={() => setShowAirdropModal(true)}
        >
          Airdrop
        </button>
        <button
          disabled={wallet.publicKey?.toString() !== address.toString()}
          className="btn btn-xs lg:btn-md btn-outline"
          onClick={() => setShowSendModal(true)}
        >
          Send
        </button>
        <button className="btn btn-xs lg:btn-md btn-outline" onClick={() => setShowReceiveModal(true)}>
          Receive
        </button>
      </div>
    </div>
  )
}

export function AccountTokens({ address }: { address: PublicKey }) {
  const { cluster } = useCluster()
  const { data, isLoading } = useGetTokenAccounts({ address })
  
  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center gap-4">
          <div className="flex gap-2 items-center">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
    )
  }
  
  if (!data?.length) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        <p>No tokens found.</p>
        {cluster.network === 'devnet' && (
          <p className="text-sm mt-2">
            This wallet has no SPL tokens yet. You can get USDC on devnet by using the airdrop button.
          </p>
        )}
      </div>
    )
  }
  
  return (
    <div className="flex flex-col gap-4">
      {data.map((account, i) => {
        const mintAddress = account.mint;
        const isUSDC = mintAddress?.toLowerCase() === USDC_MINT_ADDRESS.toLowerCase();
        
        return (
          <div key={i} className="flex justify-between items-center gap-4">
            <div className="flex gap-2 items-center">
              <div className={`flex h-10 w-10 items-center justify-center rounded-full ${isUSDC ? 'bg-blue-500' : 'bg-gray-500'}`}>
                <span className="text-lg font-bold">{isUSDC ? '$' : 'T'}</span>
              </div>
              <div>
                <div className="font-semibold">
                  {isUSDC ? 'USDC' : `Token ${i + 1}`}
                </div>
                <div className="text-xs text-muted-foreground">
                  {ellipsify(mintAddress || 'Unknown')}
                </div>
              </div>
            </div>
            <div className="font-semibold text-right">
              {account.uiAmount.toLocaleString(undefined, {
                minimumFractionDigits: 0,
                maximumFractionDigits: account.decimals || 9,
              })}
            </div>
          </div>
        )
      })}
      <div className="text-center py-2">
        <ExplorerLink
          path={`account/${address.toString()}/tokens`}
          label="View all tokens in Explorer"
          className="text-xs text-muted-foreground hover:underline"
        />
      </div>
    </div>
  )
}

export function AccountTransactions({ address }: { address: PublicKey }) {
  const query = useGetSignatures({ address })
  const [showAll, setShowAll] = useState(false)

  const items = useMemo(() => {
    if (showAll) return query.data
    return query.data?.slice(0, 5)
  }, [query.data, showAll])

  return (
    <div className="space-y-2">
      <div className="flex justify-between">
        <h2 className="text-2xl font-bold">Transaction History</h2>
        <div className="space-x-2">
          {query.isLoading ? (
            <span className="loading loading-spinner"></span>
          ) : (
            <button className="btn btn-sm btn-outline" onClick={() => query.refetch()}>
              <IconRefresh size={16} />
            </button>
          )}
        </div>
      </div>
      {query.isError && <pre className="alert alert-error">Error: {query.error?.message.toString()}</pre>}
      {query.isSuccess && (
        <div>
          {query.data.length === 0 ? (
            <div>No transactions found.</div>
          ) : (
            <table className="table border-4 rounded-lg border-separate border-base-300">
              <thead>
                <tr>
                  <th>Signature</th>
                  <th className="text-right">Slot</th>
                  <th>Block Time</th>
                  <th className="text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {items?.map((item) => (
                  <tr key={item.signature}>
                    <th className="font-mono">
                      <ExplorerLink path={`tx/${item.signature}`} label={ellipsify(item.signature, 8)} />
                    </th>
                    <td className="font-mono text-right">
                      <ExplorerLink path={`block/${item.slot}`} label={item.slot.toString()} />
                    </td>
                    <td>{new Date((item.blockTime ?? 0) * 1000).toISOString()}</td>
                    <td className="text-right">
                      {item.err ? (
                        <div className="badge badge-error" title={JSON.stringify(item.err)}>
                          Failed
                        </div>
                      ) : (
                        <div className="badge badge-success">Success</div>
                      )}
                    </td>
                  </tr>
                ))}
                {(query.data?.length ?? 0) > 5 && (
                  <tr>
                    <td colSpan={4} className="text-center">
                      <button className="btn btn-xs btn-outline" onClick={() => setShowAll(!showAll)}>
                        {showAll ? 'Show Less' : 'Show All'}
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  )
}

function BalanceSol({ balance }: { balance: number }) {
  return <span>{Math.round((balance / LAMPORTS_PER_SOL) * 100000) / 100000}</span>
}

function ModalReceive({ hide, show, address }: { hide: () => void; show: boolean; address: PublicKey }) {
  return (
    <AppModal title="Receive" hide={hide} show={show}>
      <p>Receive assets by sending them to your public key:</p>
      <code>{address.toString()}</code>
    </AppModal>
  )
}

function ModalAirdrop({ hide, show, address }: { hide: () => void; show: boolean; address: PublicKey }) {
  const mutation = useRequestAirdrop({ address })
  const [amount, setAmount] = useState('2')

  return (
    <AppModal
      hide={hide}
      show={show}
      title="Airdrop"
      submitDisabled={!amount || mutation.isPending}
      submitLabel="Request Airdrop"
      submit={() => mutation.mutateAsync(parseFloat(amount)).then(() => hide())}
    >
      <input
        disabled={mutation.isPending}
        type="number"
        step="any"
        min="1"
        placeholder="Amount"
        className="input input-bordered w-full"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
    </AppModal>
  )
}

function ModalSend({ hide, show, address }: { hide: () => void; show: boolean; address: PublicKey }) {
  const wallet = useWallet()
  const mutation = useTransferSol({ address })
  const [destination, setDestination] = useState('')
  const [amount, setAmount] = useState('1')

  if (!address || !wallet.sendTransaction) {
    return <div>Wallet not connected</div>
  }

  return (
    <AppModal
      hide={hide}
      show={show}
      title="Send"
      submitDisabled={!destination || !amount || mutation.isPending}
      submitLabel="Send"
      submit={() => {
        mutation
          .mutateAsync({
            destination: new PublicKey(destination),
            amount: parseFloat(amount),
          })
          .then(() => hide())
      }}
    >
      <input
        disabled={mutation.isPending}
        type="text"
        placeholder="Destination"
        className="input input-bordered w-full"
        value={destination}
        onChange={(e) => setDestination(e.target.value)}
      />
      <input
        disabled={mutation.isPending}
        type="number"
        step="any"
        min="1"
        placeholder="Amount"
        className="input input-bordered w-full"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
    </AppModal>
  )
}

export function TokenBalances({ address, showDetailed = false }: { address: PublicKey, showDetailed?: boolean }) {
  const { 
    data: balances = { sol: 0, usdc: 0 }, 
    isLoading: isLoadingBalances,
    isError: isBalancesError 
  } = useGetAllBalances({ address });
  
  const {
    data: tokenAccounts = [],
    isLoading: isLoadingTokens,
    isError: isTokensError
  } = useGetTokenAccounts({ address });
  
  const isLoading = isLoadingBalances || isLoadingTokens;
  const hasError = isBalancesError || isTokensError;
  
  if (hasError) {
    return <div className="text-xs text-red-400">Error loading balances</div>;
  }
  
  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-16" />
      </div>
    );
  }
  
  const hasBalances = balances.sol > 0 || balances.usdc > 0 || tokenAccounts.length > 0;
  
  if (!hasBalances) {
    return <div className="text-xs text-gray-400">No token balances found</div>;
  }
  
  return (
    <div className={`space-y-2 ${showDetailed ? 'px-4 py-3 bg-gray-900/50 rounded-lg' : ''}`}>
      {showDetailed && <h3 className="text-sm font-medium mb-2">Token Balances</h3>}
      
      {/* SOL Balance */}
      {balances.sol > 0 && (
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-5 h-5 rounded-full bg-purple-500 mr-2 flex items-center justify-center">
              <span className="text-xs font-bold">◎</span>
            </div>
            <span className="text-sm">SOL</span>
          </div>
          <span className="text-sm font-medium">
            {balances.sol.toFixed(showDetailed ? 6 : 2)}
          </span>
        </div>
      )}
      
      {/* USDC Balance */}
      {balances.usdc > 0 && (
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-5 h-5 rounded-full bg-blue-500 mr-2 flex items-center justify-center">
              <span className="text-xs font-bold">$</span>
            </div>
            <span className="text-sm">USDC</span>
          </div>
          <span className="text-sm font-medium">
            {balances.usdc.toFixed(2)}
          </span>
        </div>
      )}
      
      {/* Other SPL Tokens */}
      {showDetailed && tokenAccounts.length > 0 && (
        <>
          {tokenAccounts
            // Filter out USDC which we already displayed
            .filter(token => token.mint && token.mint.toLowerCase() !== USDC_MINT_ADDRESS.toLowerCase())
            .map((token, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-5 h-5 rounded-full bg-gray-500 mr-2 flex items-center justify-center">
                    <span className="text-xs font-bold">T</span>
                  </div>
                  <span className="text-sm">
                    {token.mint ? `${token.mint.slice(0, 4)}...${token.mint.slice(-4)}` : 'Unknown'}
                  </span>
                </div>
                <span className="text-sm font-medium">
                  {token.uiAmount.toFixed(token.decimals > 2 ? 2 : token.decimals)}
                </span>
              </div>
            ))
          }
        </>
      )}
    </div>
  );
}
