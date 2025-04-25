use crate::*;
use anchor_lang::solana_program::system_program;
use anchor_spl::token::{Mint, Token, TokenAccount, Transfer};
use anchor_spl::associated_token::AssociatedToken;

#[derive(Accounts)]
#[instruction(params: CreateONFTParams)]
pub struct CreateONFT<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,
    #[account(mut)]
    pub user_1: Signer<'info>,
    #[account(mut)]
    pub user_2: UncheckedAccount<'info>,
    #[account(
        init,
        payer = admin,
        space = 8 + ONFTData::INIT_SPACE,
        seeds = [b"onft-data", admin.key().as_ref(), user_1.key().as_ref(), user_2.key().as_ref()],
        bump
    )]
    pub onft_data: Account<'info, ONFTData>,
    #[account(
        address = onft_store.usdc_mint
    )]
    pub usdc_mint: Account<'info, Mint>,
    #[account(
        init, 
        payer = admin,
        token::mint = usdc_mint,
        token::authority = onft_data,
        seeds = [b"usdc-vault", onft_data.key().as_ref()],
        bump
    )]
    pub usdc_vault: Account<'info, TokenAccount>,
    #[account(
        mut,
        constraint = user_1_usdc_account.mint == usdc_mint.key(),
        constraint = user_1_usdc_account.owner == user_1.key()
    )]
    pub user_1_usdc_account: Account<'info, TokenAccount>,
    #[account(
        seeds = [ONFT_SEED],
        bump = onft_store.bump
    )]
    pub onft_store: Account<'info, ONFTStore>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

impl CreateONFT<'_> {
    pub fn apply(ctx: &mut Context<CreateONFT>, params: &CreateONFTParams, onft_data_bump: u8, usdc_vault_bump: u8) -> Result<()> {
        require!(!ctx.accounts.onft_store.paused, OFTError::Paused);
        require!(params.amount > 0, OFTError::InsufficientFunds);
        
        // Transfer USDC from user_1 to the vault
        let transfer_ix = Transfer {
            from: ctx.accounts.user_1_usdc_account.to_account_info(),
            to: ctx.accounts.usdc_vault.to_account_info(),
            authority: ctx.accounts.user_1.to_account_info(),
        };

        let cpi_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            transfer_ix,
        );

        anchor_spl::token::transfer(cpi_ctx, params.amount)?;

        // Initialize the ONFT data
        let onft_data = &mut ctx.accounts.onft_data;
        onft_data.admin = ctx.accounts.admin.key();
        onft_data.user_1 = ctx.accounts.user_1.key();
        onft_data.user_2 = ctx.accounts.user_2.key();
        onft_data.usdc_mint = ctx.accounts.usdc_mint.key();
        onft_data.usdc_vault = ctx.accounts.usdc_vault.key();
        onft_data.amount = params.amount;
        onft_data.status = OrderStatus::Created;
        onft_data.agreement_days = params.agreement_days;
        onft_data.created_at = Clock::get()?.unix_timestamp;
        onft_data.admin_signed = false;
        onft_data.user_1_signed = false;
        onft_data.user_2_signed = false;
        onft_data.bump = onft_data_bump;
        onft_data.vault_bump = usdc_vault_bump;
        
        emit!(ONFTCreated {
            admin: ctx.accounts.admin.key(),
            user_1: ctx.accounts.user_1.key(),
            user_2: ctx.accounts.user_2.key(),
            amount: params.amount,
            agreement_days: params.agreement_days,
        });

        Ok(())
    }
}

#[derive(Clone, AnchorSerialize, AnchorDeserialize)]
pub struct CreateONFTParams {
    pub amount: u64,
    pub agreement_days: u64,
} 