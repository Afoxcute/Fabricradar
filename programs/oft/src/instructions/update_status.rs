use crate::*;

#[derive(Accounts)]
#[instruction(params: UpdateStatusParams)]
pub struct UpdateStatus<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    #[account(
        seeds = [ONFT_SEED, onft_store.token_escrow.as_ref()],
        bump = onft_store.bump
    )]
    pub onft_store: Account<'info, ONFTStore>,
    #[account(
        mut,
        seeds = [NFT_SEED, onft_store.key().as_ref(), &params.token_id.to_le_bytes()],
        bump = nft_item.bump,
    )]
    pub nft_item: Account<'info, NFTItem>,
}

impl UpdateStatus<'_> {
    pub fn apply(ctx: &mut Context<UpdateStatus>, params: &UpdateStatusParams) -> Result<()> {
        require!(!ctx.accounts.onft_store.paused, ONFTError::Paused);
        
        // Check if the signer is authorized to update the status
        let signer_key = ctx.accounts.signer.key();
        let mut signer_found = false;
        
        // For changing to Processing, owner or any approved signer can initiate
        if params.new_status == OrderStatus::Processing {
            if signer_key == ctx.accounts.nft_item.owner {
                signer_found = true;
            } else {
                // Check if signer is one of the approved signers
                for (i, potential_signer) in ctx.accounts.nft_item.signers.iter().enumerate() {
                    if let Some(pubkey) = potential_signer {
                        if *pubkey == signer_key && ctx.accounts.nft_item.signer_approvals[i] {
                            signer_found = true;
                            break;
                        }
                    }
                }
            }
        }
        // For changing to Completed, must be an approved signer (typically user_2)
        else if params.new_status == OrderStatus::Completed {
            // Check if signer is one of the approved signers
            for (i, potential_signer) in ctx.accounts.nft_item.signers.iter().enumerate() {
                if let Some(pubkey) = potential_signer {
                    if *pubkey == signer_key && ctx.accounts.nft_item.signer_approvals[i] {
                        signer_found = true;
                        break;
                    }
                }
            }
        }
        
        require!(signer_found, ONFTError::SignerNotAuthorized);
        
        // Make sure all required approvals are in place for changing to Processing
        if params.new_status == OrderStatus::Processing {
            let all_approved = ctx.accounts.nft_item.signer_approvals.iter().all(|&approved| approved);
            require!(all_approved, ONFTError::InsufficientApprovals);
        }
        
        // Save previous status for the event
        let previous_status = ctx.accounts.nft_item.status.clone();
        
        // Update the status
        ctx.accounts.nft_item.change_status(params.new_status.clone())?;
        
        // Emit an event for the status change
        emit!(ONFTStatusChanged {
            token_id: params.token_id,
            previous_status,
            new_status: params.new_status.clone(),
            changed_by: signer_key,
            timestamp: Clock::get()?.unix_timestamp,
        });
        
        Ok(())
    }
}

#[derive(Clone, AnchorSerialize, AnchorDeserialize)]
pub struct UpdateStatusParams {
    pub token_id: u64,
    pub new_status: OrderStatus,
} 