use crate::*;
use oapp::endpoint::{
    cpi::accounts::Clear,
    instructions::ClearParams,
    ConstructCPIContext
};

#[event_cpi]
#[derive(Accounts)]
#[instruction(params: LzReceiveParams)]
pub struct LzReceiveNFT<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(
        mut,
        seeds = [
            PEER_SEED,
            onft_store.key().as_ref(),
            &params.src_eid.to_be_bytes()
        ],
        bump = peer.bump,
        constraint = peer.peer_address == params.sender @ONFTError::InvalidSender
    )]
    pub peer: Account<'info, PeerConfig>,
    #[account(
        mut,
        seeds = [ONFT_SEED, onft_store.token_escrow.as_ref()],
        bump = onft_store.bump
    )]
    pub onft_store: Account<'info, ONFTStore>,
    
    /// CHECK: Verified by LayerZero endpoint
    #[account(
        mut,
        seeds = [NFT_SEED, onft_store.key().as_ref(), &parse_token_id(&params.message).to_le_bytes()],
        bump,
    )]
    pub nft_item: Account<'info, NFTItem>,
    
    /// CHECK: the wallet address to receive the NFT
    #[account(address = Pubkey::from(parse_receiver(&params.message)))]
    pub to_address: AccountInfo<'info>,
    
    pub system_program: Program<'info, System>,
}

impl LzReceiveNFT<'_> {
    pub fn apply(ctx: &mut Context<LzReceiveNFT>, params: &LzReceiveParams) -> Result<()> {
        require!(!ctx.accounts.onft_store.paused, ONFTError::Paused);

        let onft_store_seed = ctx.accounts.onft_store.token_escrow.key();
        let seeds: &[&[u8]] = &[ONFT_SEED, onft_store_seed.as_ref(), &[ctx.accounts.onft_store.bump]];

        // Use 9 as the minimum accounts length which is typical for Clear
        const CLEAR_MIN_ACCOUNTS: usize = 9;
        
        // Validate and clear the payload via endpoint CPI
        let accounts_for_clear = &ctx.remaining_accounts[0..CLEAR_MIN_ACCOUNTS];
        let _ = oapp::endpoint_cpi::clear(
            ctx.accounts.onft_store.endpoint_program,
            ctx.accounts.onft_store.key(),
            accounts_for_clear,
            seeds,
            ClearParams {
                receiver: ctx.accounts.onft_store.key(),
                src_eid: params.src_eid,
                sender: params.sender,
                nonce: params.nonce,
                guid: params.guid,
                message: params.message.clone(),
            },
        )?;

        // Extract token ID from the message
        let token_id = parse_token_id(&params.message);
        
        // Update the NFT ownership and status
        let nft_item = &mut ctx.accounts.nft_item;
        nft_item.owner = ctx.accounts.to_address.key();
        nft_item.status = OrderStatus::Created;
        nft_item.signer_approvals = [false, false];
        nft_item.created_at = Clock::get()?.unix_timestamp;
        nft_item.processing_at = None;
        nft_item.completion_due_at = None;
        nft_item.completed_at = None;
        
        // Emit event for NFT received
        emit_cpi!(ONFTReceived {
            guid: params.guid,
            src_eid: params.src_eid,
            token_id,
            to: ctx.accounts.to_address.key(),
        });
        
        Ok(())
    }
}

// Helper function to parse token ID from the message
fn parse_token_id(message: &[u8]) -> u64 {
    let mut token_id_bytes = [0u8; 8];
    token_id_bytes.copy_from_slice(&message[0..8]);
    u64::from_le_bytes(token_id_bytes)
}

// Helper function to parse receiver from the message
fn parse_receiver(message: &[u8]) -> [u8; 32] {
    let mut receiver = [0u8; 32];
    receiver.copy_from_slice(&message[8..40]);
    receiver
} 