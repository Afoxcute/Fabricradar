use crate::*;
use oapp::endpoint::{instructions::SendParams as EndpointSendParams, MessagingReceipt};

#[event_cpi]
#[derive(Accounts)]
#[instruction(params: SendNFTParams)]
pub struct SendNFT<'info> {
    pub signer: Signer<'info>,
    #[account(
        mut,
        seeds = [
            PEER_SEED,
            onft_store.key().as_ref(),
            &params.dst_eid.to_be_bytes()
        ],
        bump = peer.bump
    )]
    pub peer: Account<'info, PeerConfig>,
    #[account(
        mut,
        seeds = [ONFT_SEED, onft_store.token_escrow.as_ref()],
        bump = onft_store.bump
    )]
    pub onft_store: Account<'info, ONFTStore>,
    #[account(
        mut,
        seeds = [NFT_SEED, onft_store.key().as_ref(), &params.token_id.to_le_bytes()],
        bump = nft_item.bump,
        constraint = nft_item.owner == signer.key() @ONFTError::Unauthorized,
        constraint = nft_item.status == OrderStatus::Completed @ONFTError::InvalidStatusTransition,
    )]
    pub nft_item: Account<'info, NFTItem>,
}

impl SendNFT<'_> {
    pub fn apply(
        ctx: &mut Context<SendNFT>,
        params: &SendNFTParams,
    ) -> Result<MessagingReceipt> {
        require!(!ctx.accounts.onft_store.paused, ONFTError::Paused);
        
        // Prepare to send the NFT across chains
        // We need to serialize the NFT data to send in the message
        let nft_data = vec![
            params.token_id.to_le_bytes().to_vec(),
            ctx.accounts.signer.key().to_bytes().to_vec(),
        ]
        .concat();
        
        // Send message to endpoint
        require!(
            ctx.accounts.onft_store.key() == ctx.remaining_accounts[1].key(),
            ONFTError::InvalidSender
        );
        
        let message = nft_data;
        
        let msg_receipt = oapp::endpoint_cpi::send(
            ctx.accounts.onft_store.endpoint_program,
            ctx.accounts.onft_store.key(),
            ctx.remaining_accounts,
            &[ONFT_SEED, ctx.accounts.onft_store.token_escrow.key().as_ref(), &[ctx.accounts.onft_store.bump]],
            EndpointSendParams {
                dst_eid: params.dst_eid,
                receiver: ctx.accounts.peer.peer_address,
                message,
                options: ctx
                    .accounts
                    .peer
                    .enforced_options
                    .combine_options(&None, &params.options)?,
                native_fee: params.native_fee,
                lz_token_fee: params.lz_token_fee,
            },
        )?;
        
        // Emit the NFT sent event
        emit_cpi!(ONFTSent {
            guid: msg_receipt.guid,
            dst_eid: params.dst_eid,
            token_id: params.token_id,
            from: ctx.accounts.signer.key(),
            to: params.to,
        });
        
        Ok(msg_receipt)
    }
}

#[derive(Clone, AnchorSerialize, AnchorDeserialize)]
pub struct SendNFTParams {
    pub dst_eid: u32,
    pub to: [u8; 32],
    pub token_id: u64,
    pub options: Vec<u8>,
    pub native_fee: u64,
    pub lz_token_fee: u64,
} 