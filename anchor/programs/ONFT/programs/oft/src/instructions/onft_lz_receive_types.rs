use crate::*;
use anchor_lang::solana_program;
use anchor_spl::token::Mint;
use oapp::endpoint_cpi::LzAccount;

#[derive(Accounts)]
pub struct ONFTLzReceiveTypes<'info> {
    #[account(
        seeds = [ONFT_SEED],
        bump = onft_store.bump
    )]
    pub onft_store: Account<'info, ONFTStore>,
    #[account(address = onft_store.nft_mint)]
    pub nft_mint: Account<'info, Mint>,
}

impl ONFTLzReceiveTypes<'_> {
    pub fn apply(
        ctx: &Context<ONFTLzReceiveTypes>,
        params: &LzReceiveParams,
    ) -> Result<Vec<LzAccount>> {
        // Convert src_eid to bytes for use in the seed
        let eid_bytes = params.src_eid.to_be_bytes();
        
        let (peer, _) = Pubkey::find_program_address(
            &[PEER_SEED, ctx.accounts.onft_store.key().as_ref(), &eid_bytes],
            ctx.program_id,
        );

        // Setup basic accounts
        let mut accounts = vec![
            LzAccount { pubkey: Pubkey::default(), is_signer: true, is_writable: true }, // 0 - executor
            LzAccount { pubkey: peer, is_signer: false, is_writable: true },             // 1 - peer
            LzAccount { pubkey: ctx.accounts.onft_store.key(), is_signer: false, is_writable: true }, // 2 - onft store
        ];

        // Add NFT mint
        accounts.push(
            LzAccount {
                pubkey: ctx.accounts.nft_mint.key(),
                is_signer: false,
                is_writable: true,
            }, // 3 - nft mint
        );

        // Add system accounts
        let (event_authority_account, _) =
            Pubkey::find_program_address(&[oapp::endpoint_cpi::EVENT_SEED], &ctx.program_id);
        accounts.extend_from_slice(&[
            LzAccount {
                pubkey: solana_program::system_program::ID,
                is_signer: false,
                is_writable: false,
            }, // 4 - system program
            LzAccount { pubkey: event_authority_account, is_signer: false, is_writable: false }, // 5 - event authority
            LzAccount { pubkey: ctx.program_id.key(), is_signer: false, is_writable: false }, // 6 - this program
        ]);

        // Add accounts for clear
        let endpoint_program = ctx.accounts.onft_store.endpoint_program;
        let onft_store_key = ctx.accounts.onft_store.key();
        let accounts_for_clear = oapp::endpoint_cpi::get_accounts_for_clear(
            endpoint_program,
            &onft_store_key,
            params.src_eid,
            &params.sender,
            params.nonce,
        );
        accounts.extend(accounts_for_clear);

        Ok(accounts)
    }
} 