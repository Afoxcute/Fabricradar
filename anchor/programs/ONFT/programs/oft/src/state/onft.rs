use crate::*;
use anchor_lang::prelude::*;

// Order status for the NFT
#[derive(Clone, AnchorSerialize, AnchorDeserialize, PartialEq, Eq, InitSpace)]
pub enum OrderStatus {
    Created,
    Processing,
    Completed,
}

// NFT account structure
#[account]
#[derive(InitSpace)]
pub struct ONFTData {
    pub admin: Pubkey,        // Admin who created the NFT
    pub user_1: Pubkey,       // First signer (payer)
    pub user_2: Pubkey,       // Second signer (receiver)
    pub usdc_mint: Pubkey,    // USDC token mint
    pub usdc_vault: Pubkey,   // Vault to store USDC
    pub amount: u64,          // Amount of USDC paid
    pub status: OrderStatus,  // Current status of the order
    pub agreement_days: u64,  // Days agreed for completion
    pub created_at: i64,      // Creation timestamp
    pub admin_signed: bool,   // Whether admin signed the agreement
    pub user_1_signed: bool,  // Whether user_1 signed the agreement
    pub user_2_signed: bool,  // Whether user_2 signed the agreement
    pub bump: u8,             // Bump seed for PDA
    pub vault_bump: u8,       // Bump seed for USDC vault
}

// ONFT store for omnichain functionality
#[account]
#[derive(InitSpace)]
pub struct ONFTStore {
    // Immutable
    pub nft_mint: Pubkey,         // NFT token mint
    pub usdc_mint: Pubkey,        // USDC token mint
    pub endpoint_program: Pubkey, // LayerZero endpoint
    pub bump: u8,
    // Configurable
    pub admin: Pubkey,
    pub default_fee_bps: u16,
    pub paused: bool,
    pub pauser: Option<Pubkey>,
    pub unpauser: Option<Pubkey>,
}

/// LzReceiveTypesAccounts includes accounts that are used in the LzReceiveTypes
/// instruction.
#[account]
#[derive(InitSpace)]
pub struct ONFTLzReceiveTypesAccounts {
    pub onft_store: Pubkey,
    pub nft_mint: Pubkey,
} 