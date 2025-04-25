use crate::*;

#[derive(Accounts)]
pub struct SignAgreement<'info> {
    pub signer: Signer<'info>,
    #[account(
        mut,
        constraint = 
            signer.key() == onft_data.admin || 
            signer.key() == onft_data.user_1 || 
            signer.key() == onft_data.user_2 @OFTError::Unauthorized
    )]
    pub onft_data: Account<'info, ONFTData>,
}

impl SignAgreement<'_> {
    pub fn apply(ctx: &mut Context<SignAgreement>) -> Result<()> {
        let signer_key = ctx.accounts.signer.key();
        let onft_data = &mut ctx.accounts.onft_data;
        
        // Update the appropriate signature based on the signer
        let role = if signer_key == onft_data.admin {
            onft_data.admin_signed = true;
            "admin"
        } else if signer_key == onft_data.user_1 {
            onft_data.user_1_signed = true;
            "user_1"
        } else if signer_key == onft_data.user_2 {
            onft_data.user_2_signed = true;
            "user_2"
        } else {
            return Err(OFTError::Unauthorized.into());
        };
        
        emit!(ONFTAgreementSigned {
            nft_data: onft_data.key(),
            signer: signer_key,
            role: role.to_string(),
        });
        
        // If all parties have signed and the status is Created, move to Processing
        if onft_data.admin_signed && onft_data.user_1_signed && onft_data.user_2_signed {
            if onft_data.status == OrderStatus::Created {
                let old_status = onft_data.status.clone();
                onft_data.status = OrderStatus::Processing;
                
                emit!(ONFTStatusChanged {
                    nft_data: onft_data.key(),
                    old_status,
                    new_status: onft_data.status.clone(),
                });
            }
        }
        
        Ok(())
    }
} 