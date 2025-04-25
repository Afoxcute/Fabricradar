use crate::*;
use anchor_spl::token::{Mint, Token, TokenAccount, Transfer};
use anchor_spl::associated_token::AssociatedToken;

#[derive(Accounts)]
#[instruction()]
pub struct TransferFunds<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,
    #[account(
        mut,
        constraint = admin.key() == onft_data.admin @OFTError::Unauthorized,
        constraint = onft_data.status == OrderStatus::Completed @OFTError::AgreementNotComplete
    )]
    pub onft_data: Account<'info, ONFTData>,
    #[account(
        address = onft_data.usdc_mint
    )]
    pub usdc_mint: Account<'info, Mint>,
    #[account(
        mut,
        seeds = [b"usdc-vault", onft_data.key().as_ref()],
        bump = onft_data.vault_bump
    )]
    pub usdc_vault: Account<'info, TokenAccount>,
    #[account(
        init_if_needed,
        payer = admin,
        associated_token::mint = usdc_mint,
        associated_token::authority = user_2
    )]
    pub user_2_usdc_account: Account<'info, TokenAccount>,
    /// CHECK: This is the recipient verified in constraints
    #[account(
        constraint = user_2.key() == onft_data.user_2 @OFTError::Unauthorized
    )]
    pub user_2: UncheckedAccount<'info>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

impl TransferFunds<'_> {
    pub fn apply(ctx: &mut Context<TransferFunds>) -> Result<()> {
        let onft_data = &ctx.accounts.onft_data;
        
        // Verify all parties have signed
        if !onft_data.admin_signed || !onft_data.user_1_signed || !onft_data.user_2_signed {
            return Err(OFTError::MissingSignatures.into());
        }
        
        // Create the bump array
        let bump_arr = [onft_data.bump];
        
        // Get onft_data signer seeds for vault PDA
        let seed1 = b"onft-data" as &[u8];
        let seed2 = onft_data.admin.as_ref();
        let seed3 = onft_data.user_1.as_ref();
        let seed4 = onft_data.user_2.as_ref();
        
        // Create a seeds array that will live for the whole function
        let seeds = &[seed1, seed2, seed3, seed4, &bump_arr] as &[&[u8]];
        
        // Transfer funds from vault to user_2
        let amount = ctx.accounts.usdc_vault.amount;
        
        let transfer_ix = Transfer {
            from: ctx.accounts.usdc_vault.to_account_info(),
            to: ctx.accounts.user_2_usdc_account.to_account_info(),
            authority: ctx.accounts.onft_data.to_account_info(),
        };
        
        // Use the long-lived seeds array
        let signer_seeds = &[seeds] as &[&[&[u8]]];
        
        let cpi_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            transfer_ix,
        ).with_signer(signer_seeds);
        
        anchor_spl::token::transfer(cpi_ctx, amount)?;
        
        emit!(ONFTFundsTransferred {
            nft_data: onft_data.key(),
            from: ctx.accounts.usdc_vault.key(),
            to: ctx.accounts.user_2.key(),
            amount,
        });
        
        Ok(())
    }
} 