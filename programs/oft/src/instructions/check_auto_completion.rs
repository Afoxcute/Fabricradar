use crate::*;

#[derive(Accounts)]
#[instruction(params: CheckAutoCompletionParams)]
pub struct CheckAutoCompletion<'info> {
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

impl CheckAutoCompletion<'_> {
    pub fn apply(ctx: &mut Context<CheckAutoCompletion>, params: &CheckAutoCompletionParams) -> Result<()> {
        require!(!ctx.accounts.onft_store.paused, ONFTError::Paused);
        
        // Check if the NFT is in a Processing state and due date has passed
        let was_autocompleted = ctx.accounts.nft_item.check_auto_completion()?;
        
        if was_autocompleted {
            // Emit event to record the auto-completion
            let current_time = Clock::get()?.unix_timestamp;
            emit!(ONFTAutoCompleted {
                token_id: params.token_id,
                completion_due_time: ctx.accounts.nft_item.completion_due_at.unwrap(),
                actual_completion_time: current_time,
            });
        }
        
        Ok(())
    }
}

#[derive(Clone, AnchorSerialize, AnchorDeserialize)]
pub struct CheckAutoCompletionParams {
    pub token_id: u64,
} 