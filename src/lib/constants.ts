export const chains = [
  {
    id: 'Solana',
    name: 'Solana',
    rpcUrl: process.env.SOLANA_RPC_URL,
    chainId: 'mainnet-beta', // Solana uses string identifiers for networks
  },
  {
    id: 'Ethereum',
    name: 'Ethereum',
    rpcUrl: process.env.ETH_RPC_URL,
    chainId: 1,
  },
  {
    id: 'BSC',
    name: 'Binance Smart Chain',
    rpcUrl: process.env.BSC_RPC_URL,
    chainId: 56,
  },
];

export const supportedTokens = {
  Solana: {
    // Native SOL
    SOL: 'native',
    // Solana USDC (Native USDC on Solana)
    USDC: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    // Solana USDT
    USDT: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
    // Wrapped SOL
    WSOL: 'So11111111111111111111111111111111111111112',
    // Wormhole-wrapped tokens
    WETH: '7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs',
    WBNB: '9gP2kCy3wA1ctvYWQk75guqXuHfrEomqydHLtcTCqiLa',
  },
  Ethereum: {
    // Native ETH
    ETH: 'native',
    // ERC20 tokens
    USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    // Wormhole-wrapped tokens
    WSOL: '0xD31a59c85aE9D8edEFeC411D448f90841571b89c',
  },
  BSC: {
    // Native BNB
    BNB: 'native',
    // BEP20 tokens
    USDC: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
    BUSD: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56',
    // Wormhole-wrapped tokens
    WSOL: '0x570A5D26f7765Ecb712C0924E4De545B89fD43dF',
  },
};

// Network configurations
export const networkConfig = {
  Solana: {
    name: 'Solana',
    currency: 'SOL',
    explorer: 'https://explorer.solana.com',
    decimals: 9,
    wormholeChainId: 1, // Solana's Wormhole Chain ID
  },
  Ethereum: {
    name: 'Ethereum',
    currency: 'ETH',
    explorer: 'https://etherscan.io',
    decimals: 18,
    wormholeChainId: 2, // Ethereum's Wormhole Chain ID
  },
  BSC: {
    name: 'Binance Smart Chain',
    currency: 'BNB',
    explorer: 'https://bscscan.com',
    decimals: 18,
    wormholeChainId: 4, // BSC's Wormhole Chain ID
  },
};

// Token metadata for better UX
export const tokenMetadata = {
  Solana: {
    SOL: {
      name: 'Solana',
      symbol: 'SOL',
      decimals: 9,
      logo: '/images/tokens/sol.png',
    },
    USDC: {
      name: 'USD Coin',
      symbol: 'USDC',
      decimals: 6,
      logo: '/images/tokens/usdc.png',
    },
    USDT: {
      name: 'Tether USD',
      symbol: 'USDT',
      decimals: 6,
      logo: '/images/tokens/usdt.png',
    },
    WSOL: {
      name: 'Wrapped SOL',
      symbol: 'WSOL',
      decimals: 9,
      logo: '/images/tokens/wsol.png',
    },
  },
  Ethereum: {
    ETH: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
      logo: '/images/tokens/eth.png',
    },
    USDC: {
      name: 'USD Coin',
      symbol: 'USDC',
      decimals: 6,
      logo: '/images/tokens/usdc.png',
    },
    USDT: {
      name: 'Tether USD',
      symbol: 'USDT',
      decimals: 6,
      logo: '/images/tokens/usdt.png',
    },
  },
  BSC: {
    BNB: {
      name: 'Binance Coin',
      symbol: 'BNB',
      decimals: 18,
      logo: '/images/tokens/bnb.png',
    },
    USDC: {
      name: 'USD Coin',
      symbol: 'USDC',
      decimals: 6,
      logo: '/images/tokens/usdc.png',
    },
    BUSD: {
      name: 'Binance USD',
      symbol: 'BUSD',
      decimals: 18,
      logo: '/images/tokens/busd.png',
    },
  },
};

// Helper functions
export const getTokenDecimals = (
  chainId: string,
  tokenSymbol: string
): number => {
  return (
    tokenMetadata[chainId]?.[tokenSymbol]?.decimals ||
    networkConfig[chainId]?.decimals ||
    18
  ); // default to 18 if not found
};

