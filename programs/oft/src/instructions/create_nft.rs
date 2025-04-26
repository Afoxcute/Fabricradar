use crate::*;

#[derive(Accounts)]
#[instruction(params: CreateNFTParams)]
pub struct CreateNFT<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    // Admin must sign
    pub admin: Signer<'info>,
    #[account(
        seeds = [ONFT_SEED, onft_store.token_escrow.as_ref()],
        bump = onft_store.bump,
        has_one = admin @ONFTError::Unauthorized
    )]
    pub onft_store: Account<'info, ONFTStore>,
    
    // Verify users are real addresses and not empty or the same
    #[account(
        constraint = user_1.key() != user_2.key() @ONFTError::InvalidSigner
    )]
    /// CHECK: Just used to verify the address exists
    pub user_1: AccountInfo<'info>,
    /// CHECK: Just used to verify the address exists 
    pub user_2: AccountInfo<'info>,
    
    // Account for the NFT itself
    #[account(
        init,
        payer = payer,
        space = 8 + NFTItem::INIT_SPACE,
        seeds = [NFT_SEED, onft_store.key().as_ref(), &params.token_id.to_le_bytes()],
        bump
    )]
    pub nft_item: Account<'info, NFTItem>,
    
    pub system_program: Program<'info, System>,
}

impl CreateNFT<'_> {
    pub fn apply(ctx: &mut Context<CreateNFT>, params: &CreateNFTParams) -> Result<()> {
        require!(!ctx.accounts.onft_store.paused, ONFTError::Paused);
        
        if let Some(metadata) = &params.metadata {
            require!(metadata.len() <= 200, ONFTError::MetadataTooLong);
        }
        
        let current_time = Clock::get()?.unix_timestamp;
        
        // Initialize the NFT Item
        let nft_item = &mut ctx.accounts.nft_item;
        nft_item.token_id = params.token_id;
        nft_item.owner = ctx.accounts.payer.key();
        nft_item.status = OrderStatus::Created;
        nft_item.signers = [
            Some(ctx.accounts.user_1.key()), 
            Some(ctx.accounts.user_2.key())
        ];
        nft_item.signer_approvals = [false, false];
        nft_item.created_at = current_time;
        nft_item.processing_at = None;
        nft_item.completion_due_at = None;
        nft_item.completed_at = None;
        nft_item.days_to_complete = params.days_to_complete;
        nft_item.metadata = params.metadata.clone();
        nft_item.bump = ctx.bumps.nft_item;

        emit!(ONFTCreated {
            token_id: params.token_id,
            owner: ctx.accounts.payer.key(),
            signers: [ctx.accounts.user_1.key(), ctx.accounts.user_2.key()], 
            days_to_complete: params.days_to_complete,
            timestamp: current_time,
        });
        
        Ok(())
    }
}

#[derive(Clone, AnchorSerialize, AnchorDeserialize)]
pub struct CreateNFTParams {
    pub token_id: u64,
    pub days_to_complete: u8,
    pub metadata: Option<String>,
} 