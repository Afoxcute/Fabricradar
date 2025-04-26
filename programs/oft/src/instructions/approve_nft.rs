use crate::*;

#[derive(Accounts)]
pub struct ApproveNFT<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    #[account(
        seeds = [ONFT_SEED, onft_store.token_escrow.as_ref()],
        bump = onft_store.bump
    )]
    pub onft_store: Account<'info, ONFTStore>,
    #[account(
        mut,
        seeds = [NFT_SEED, onft_store.key().as_ref(), &nft_item.token_id.to_le_bytes()],
        bump = nft_item.bump,
    )]
    pub nft_item: Account<'info, NFTItem>,
}

impl ApproveNFT<'_> {
    pub fn apply(ctx: &mut Context<ApproveNFT>) -> Result<()> {
        require!(!ctx.accounts.onft_store.paused, ONFTError::Paused);
        
        // Check if the NFT is already completed
        if ctx.accounts.nft_item.status == OrderStatus::Completed {
            return Err(error!(ONFTError::OrderAlreadyCompleted));
        }
        
        // Find which signer index the current signer corresponds to
        let signer_key = ctx.accounts.signer.key();
        let mut signer_found = false;
        let mut signer_index = 0;
        
        for (i, potential_signer) in ctx.accounts.nft_item.signers.iter().enumerate() {
            if let Some(pubkey) = potential_signer {
                if *pubkey == signer_key {
                    signer_found = true;
                    signer_index = i;
                    break;
                }
            }
        }
        
        require!(signer_found, ONFTError::SignerNotAuthorized);
        
        // Mark the signer as approved
        ctx.accounts.nft_item.signer_approvals[signer_index] = true;
        
        // Emit an event for the approval
        emit!(ONFTSignerApproved {
            token_id: ctx.accounts.nft_item.token_id,
            signer_index: signer_index as u8,
            signer: signer_key,
            timestamp: Clock::get()?.unix_timestamp,
        });
        
        Ok(())
    }
} 