use crate::*;

#[derive(Accounts)]
pub struct AutoComplete<'info> {
    pub signer: Signer<'info>,
    #[account(
        mut,
        constraint = onft_data.status == OrderStatus::Processing @OFTError::InvalidStatus,
        constraint = 
            Clock::get()?.unix_timestamp >= 
            onft_data.created_at + (onft_data.agreement_days as i64 * 24 * 60 * 60) 
            @OFTError::DeadlineNotPassed
    )]
    pub onft_data: Account<'info, ONFTData>,
}

impl AutoComplete<'_> {
    pub fn apply(ctx: &mut Context<AutoComplete>) -> Result<()> {
        let onft_data = &mut ctx.accounts.onft_data;
        
        // Verify that all parties have signed the agreement
        if !onft_data.admin_signed || !onft_data.user_1_signed || !onft_data.user_2_signed {
            return Err(OFTError::MissingSignatures.into());
        }
        
        let old_status = onft_data.status.clone();
        onft_data.status = OrderStatus::Completed;
        
        emit!(ONFTStatusChanged {
            nft_data: onft_data.key(),
            old_status,
            new_status: OrderStatus::Completed,
        });
        
        Ok(())
    }
} 