use crate::*;

#[derive(Accounts)]
#[instruction(params: UpdateStatusParams)]
pub struct UpdateStatus<'info> {
    pub user_2: Signer<'info>,
    #[account(
        mut,
        constraint = user_2.key() == onft_data.user_2 @OFTError::Unauthorized,
        constraint = onft_data.status != OrderStatus::Completed @OFTError::InvalidStatus
    )]
    pub onft_data: Account<'info, ONFTData>,
}

impl UpdateStatus<'_> {
    pub fn apply(ctx: &mut Context<UpdateStatus>, params: &UpdateStatusParams) -> Result<()> {
        let onft_data = &mut ctx.accounts.onft_data;
        
        // Validate the status transition
        match params.new_status {
            OrderStatus::Created => {
                return Err(OFTError::InvalidStatus.into());
            },
            OrderStatus::Processing => {
                // Only allow transition from Created to Processing
                if onft_data.status != OrderStatus::Created {
                    return Err(OFTError::InvalidStatus.into());
                }
            },
            OrderStatus::Completed => {
                // Only allow transition from Processing to Completed
                if onft_data.status != OrderStatus::Processing {
                    return Err(OFTError::InvalidStatus.into());
                }
                
                // Verify all parties have signed the agreement
                if !onft_data.admin_signed || !onft_data.user_1_signed || !onft_data.user_2_signed {
                    return Err(OFTError::MissingSignatures.into());
                }
            }
        }
        
        let old_status = onft_data.status.clone();
        onft_data.status = params.new_status.clone();
        
        emit!(ONFTStatusChanged {
            nft_data: onft_data.key(),
            old_status,
            new_status: params.new_status.clone(),
        });
        
        Ok(())
    }
}

#[derive(Clone, AnchorSerialize, AnchorDeserialize)]
pub struct UpdateStatusParams {
    pub new_status: OrderStatus,
} 