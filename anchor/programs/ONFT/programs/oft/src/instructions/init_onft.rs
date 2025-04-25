use crate::*;
use anchor_lang::solana_program::system_program;
use anchor_spl::token::{Mint, Token};
use oapp::endpoint::{instructions::RegisterOAppParams, ID as ENDPOINT_ID};

#[derive(Accounts)]
pub struct InitONFT<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,
    #[account(
        init,
        payer = admin,
        space = 8 + ONFTStore::INIT_SPACE,
        seeds = [ONFT_SEED],
        bump
    )]
    pub onft_store: Account<'info, ONFTStore>,
    #[account(
        init,
        payer = admin,
        space = 8 + ONFTLzReceiveTypesAccounts::INIT_SPACE
    )]
    pub lz_receive_types_accounts: Account<'info, ONFTLzReceiveTypesAccounts>,
    pub nft_mint: Account<'info, Mint>,
    pub usdc_mint: Account<'info, Mint>,
    pub system_program: Program<'info, System>,
}

impl InitONFT<'_> {
    pub fn apply(ctx: &mut Context<InitONFT>, params: &InitONFTParams, onft_store_bump: u8) -> Result<()> {
        // Initialize the ONFT store
        ctx.accounts.onft_store.nft_mint = ctx.accounts.nft_mint.key();
        ctx.accounts.onft_store.usdc_mint = ctx.accounts.usdc_mint.key();
        ctx.accounts.onft_store.endpoint_program =
            if let Some(endpoint_program) = params.endpoint_program {
                endpoint_program
            } else {
                ENDPOINT_ID
            };
        ctx.accounts.onft_store.admin = ctx.accounts.admin.key();
        ctx.accounts.onft_store.default_fee_bps = 0;
        ctx.accounts.onft_store.paused = false;
        ctx.accounts.onft_store.pauser = None;
        ctx.accounts.onft_store.unpauser = None;
        ctx.accounts.onft_store.bump = onft_store_bump;

        // Initialize the lz_receive_types_accounts
        ctx.accounts.lz_receive_types_accounts.onft_store = ctx.accounts.onft_store.key();
        ctx.accounts.lz_receive_types_accounts.nft_mint = ctx.accounts.nft_mint.key();

        // Create the seeds array
        let bump_arr = [onft_store_bump];
        let seeds: &[&[u8]] = &[ONFT_SEED, &bump_arr];

        // Register the oapp
        oapp::endpoint_cpi::register_oapp(
            ctx.accounts.onft_store.endpoint_program,
            ctx.accounts.onft_store.key(),
            ctx.remaining_accounts,
            seeds,
            RegisterOAppParams { delegate: ctx.accounts.admin.key() },
        )
    }
}

#[derive(Clone, AnchorSerialize, AnchorDeserialize)]
pub struct InitONFTParams {
    pub endpoint_program: Option<Pubkey>,
} 