use crate::*;
use anchor_spl::token_interface::{Mint, TokenAccount, TokenInterface};
use oapp::endpoint::{instructions::RegisterOAppParams, ID as ENDPOINT_ID};

#[derive(Accounts)]
pub struct InitONFT<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(
        init,
        payer = payer,
        space = 8 + ONFTStore::INIT_SPACE,
        seeds = [ONFT_SEED, token_escrow.key().as_ref()],
        bump
    )]
    pub onft_store: Account<'info, ONFTStore>,
    #[account(
        init,
        payer = payer,
        space = 8 + LzReceiveTypesAccounts::INIT_SPACE,
        seeds = [LZ_RECEIVE_TYPES_SEED, onft_store.key().as_ref()],
        bump
    )]
    pub lz_receive_types_accounts: Account<'info, LzReceiveTypesAccounts>,
    #[account(mint::token_program = token_program)]
    pub token_mint: InterfaceAccount<'info, Mint>,
    #[account(
        init,
        payer = payer,
        token::authority = onft_store,
        token::mint = token_mint,
        token::token_program = token_program,
    )]
    pub token_escrow: InterfaceAccount<'info, TokenAccount>,
    pub token_program: Interface<'info, TokenInterface>,
    pub system_program: Program<'info, System>,
}

impl InitONFT<'_> {
    pub fn apply(ctx: &mut Context<InitONFT>, params: &InitONFTParams) -> Result<()> {
        // Initialize the onft_store
        ctx.accounts.onft_store.token_mint = ctx.accounts.token_mint.key();
        ctx.accounts.onft_store.token_escrow = ctx.accounts.token_escrow.key();
        ctx.accounts.onft_store.endpoint_program =
            if let Some(endpoint_program) = params.endpoint_program {
                endpoint_program
            } else {
                ENDPOINT_ID
            };
        ctx.accounts.onft_store.bump = ctx.bumps.onft_store;
        ctx.accounts.onft_store.admin = params.admin;
        ctx.accounts.onft_store.default_fee_bps = 0;
        ctx.accounts.onft_store.paused = false;
        ctx.accounts.onft_store.pauser = None;
        ctx.accounts.onft_store.unpauser = None;

        // Initialize the lz_receive_types_accounts
        ctx.accounts.lz_receive_types_accounts.oft_store = ctx.accounts.onft_store.key();
        ctx.accounts.lz_receive_types_accounts.token_mint = ctx.accounts.token_mint.key();

        // Register the oapp
        oapp::endpoint_cpi::register_oapp(
            ctx.accounts.onft_store.endpoint_program,
            ctx.accounts.onft_store.key(),
            ctx.remaining_accounts,
            &[ONFT_SEED, ctx.accounts.token_escrow.key().as_ref(), &[ctx.bumps.onft_store]],
            RegisterOAppParams { delegate: params.admin },
        )
    }
}

#[derive(Clone, AnchorSerialize, AnchorDeserialize)]
pub struct InitONFTParams {
    pub admin: Pubkey,
    pub endpoint_program: Option<Pubkey>,
} 