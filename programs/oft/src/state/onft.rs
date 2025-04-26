use crate::*;
use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct ONFTStore {
    // immutable
    pub token_mint: Pubkey,
    pub token_escrow: Pubkey,
    pub endpoint_program: Pubkey,
    pub bump: u8,
    // configurable
    pub admin: Pubkey,
    pub default_fee_bps: u16,
    pub paused: bool,
    pub pauser: Option<Pubkey>,
    pub unpauser: Option<Pubkey>,
}

#[account]
#[derive(InitSpace)]
pub struct NFTItem {
    pub token_id: u64,
    pub owner: Pubkey,
    pub status: OrderStatus,
    pub signers: [Option<Pubkey>; 2],  // user_1 and user_2
    pub signer_approvals: [bool; 2],   // approval status for each signer
    pub created_at: i64,               // timestamp when created
    pub processing_at: Option<i64>,    // timestamp when processing started
    pub completion_due_at: Option<i64>, // timestamp when order should auto-complete
    pub completed_at: Option<i64>,     // timestamp when completed
    pub days_to_complete: u8,          // days agreed for completion
    #[max_len(200)]
    pub metadata: Option<String>,      // optional metadata about the NFT
    pub bump: u8,
}

#[derive(InitSpace, Clone, AnchorSerialize, AnchorDeserialize, PartialEq, Eq)]
pub enum OrderStatus {
    Created,
    Processing,
    Completed,
}

pub const ONFT_SEED: &[u8] = b"ONFT";
pub const NFT_SEED: &[u8] = b"NFT";
pub const SECONDS_PER_DAY: i64 = 86400;

impl NFTItem {
    pub fn check_auto_completion(&mut self) -> Result<bool> {
        if self.status == OrderStatus::Processing && self.completion_due_at.is_some() {
            let current_time = Clock::get()?.unix_timestamp;
            
            if current_time >= self.completion_due_at.unwrap() {
                self.status = OrderStatus::Completed;
                self.completed_at = Some(current_time);
                return Ok(true);
            }
        }
        Ok(false)
    }
    
    pub fn change_status(&mut self, new_status: OrderStatus) -> Result<()> {
        let current_time = Clock::get()?.unix_timestamp;
        
        match new_status {
            OrderStatus::Created => {
                // Can't go back to created status
                return Err(error!(ONFTError::InvalidStatusTransition));
            },
            OrderStatus::Processing => {
                if self.status != OrderStatus::Created {
                    return Err(error!(ONFTError::InvalidStatusTransition));
                }
                
                self.status = OrderStatus::Processing;
                self.processing_at = Some(current_time);
                
                // Set completion due time based on days_to_complete
                self.completion_due_at = Some(current_time + (self.days_to_complete as i64 * SECONDS_PER_DAY));
            },
            OrderStatus::Completed => {
                if self.status == OrderStatus::Completed {
                    return Err(error!(ONFTError::InvalidStatusTransition));
                }
                
                self.status = OrderStatus::Completed;
                self.completed_at = Some(current_time);
            }
        }
        
        Ok(())
    }
}

/// LzReceiveTypesAccounts includes accounts that are used in the LzReceiveTypes
/// instruction.
#[account]
#[derive(InitSpace)]
pub struct LzReceiveTypesAccounts {
    pub onft_store: Pubkey,
    pub nft_collection: Pubkey,
}
