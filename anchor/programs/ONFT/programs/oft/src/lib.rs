use anchor_lang::prelude::*;

pub mod compose_msg_codec;
pub mod errors;
pub mod events;
pub mod instructions;
pub mod msg_codec;
pub mod state;

use errors::*;
use events::*;
use instructions::*;
use oapp::{
    endpoint::{MessagingFee, MessagingReceipt},
    LzReceiveParams,
};
use solana_helper::program_id_from_env;
use state::*;

declare_id!(Pubkey::new_from_array(program_id_from_env!(
    "OFT_ID",
    "9UovNrJD8pQyBLheeHNayuG1wJSEAoxkmM14vw5gcsTT"
)));

pub const OFT_SEED: &[u8] = b"OFT";
pub const PEER_SEED: &[u8] = b"Peer";
pub const ENFORCED_OPTIONS_SEED: &[u8] = b"EnforcedOptions";
pub const LZ_RECEIVE_TYPES_SEED: &[u8] = oapp::LZ_RECEIVE_TYPES_SEED;
pub const ONFT_SEED: &[u8] = b"ONFT";

#[program]
pub mod oft {
    use super::*;

    pub fn oft_version(_ctx: Context<OFTVersion>) -> Result<Version> {
        Ok(Version { interface: 2, message: 1 })
    }

    pub fn init_oft(mut ctx: Context<InitOFT>, params: InitOFTParams) -> Result<()> {
        InitOFT::apply(&mut ctx, &params)
    }

    // ============================== Admin ==============================
    pub fn set_oft_config(
        mut ctx: Context<SetOFTConfig>,
        params: SetOFTConfigParams,
    ) -> Result<()> {
        SetOFTConfig::apply(&mut ctx, &params)
    }

    pub fn set_peer_config(
        mut ctx: Context<SetPeerConfig>,
        params: SetPeerConfigParams,
    ) -> Result<()> {
        SetPeerConfig::apply(&mut ctx, &params)
    }

    pub fn set_pause(mut ctx: Context<SetPause>, params: SetPauseParams) -> Result<()> {
        SetPause::apply(&mut ctx, &params)
    }

    pub fn withdraw_fee(mut ctx: Context<WithdrawFee>, params: WithdrawFeeParams) -> Result<()> {
        WithdrawFee::apply(&mut ctx, &params)
    }

    // ============================== Public ==============================

    pub fn quote_oft(ctx: Context<QuoteOFT>, params: QuoteOFTParams) -> Result<QuoteOFTResult> {
        QuoteOFT::apply(&ctx, &params)
    }

    pub fn quote_send(ctx: Context<QuoteSend>, params: QuoteSendParams) -> Result<MessagingFee> {
        QuoteSend::apply(&ctx, &params)
    }

    pub fn send(
        mut ctx: Context<Send>,
        params: SendParams,
    ) -> Result<(MessagingReceipt, OFTReceipt)> {
        Send::apply(&mut ctx, &params)
    }

    pub fn lz_receive(mut ctx: Context<LzReceive>, params: LzReceiveParams) -> Result<()> {
        LzReceive::apply(&mut ctx, &params)
    }

    pub fn lz_receive_types(
        ctx: Context<LzReceiveTypes>,
        params: LzReceiveParams,
    ) -> Result<Vec<oapp::endpoint_cpi::LzAccount>> {
        LzReceiveTypes::apply(&ctx, &params)
    }

    // ============================== ONFT Instructions ==============================

    pub fn init_onft(mut ctx: Context<InitONFT>, params: InitONFTParams) -> Result<()> {
        // Access the bump directly as a field of ctx.bumps
        let onft_store_bump = ctx.bumps.onft_store;
        
        // Pass the bump to the apply function
        InitONFT::apply(&mut ctx, &params, onft_store_bump)
    }

    pub fn create_onft(mut ctx: Context<CreateONFT>, params: CreateONFTParams) -> Result<()> {
        // Access the bumps directly as fields of ctx.bumps
        let onft_data_bump = ctx.bumps.onft_data;
        let usdc_vault_bump = ctx.bumps.usdc_vault;
        
        // Pass the bumps to the apply function
        CreateONFT::apply(&mut ctx, &params, onft_data_bump, usdc_vault_bump)
    }

    pub fn sign_agreement(mut ctx: Context<SignAgreement>) -> Result<()> {
        SignAgreement::apply(&mut ctx)
    }

    pub fn update_status(mut ctx: Context<UpdateStatus>, params: UpdateStatusParams) -> Result<()> {
        UpdateStatus::apply(&mut ctx, &params)
    }

    pub fn auto_complete(mut ctx: Context<AutoComplete>) -> Result<()> {
        AutoComplete::apply(&mut ctx)
    }

    pub fn transfer_funds(mut ctx: Context<TransferFunds>) -> Result<()> {
        TransferFunds::apply(&mut ctx)
    }
    
    pub fn onft_lz_receive_types(
        ctx: Context<ONFTLzReceiveTypes>,
        params: LzReceiveParams,
    ) -> Result<Vec<oapp::endpoint_cpi::LzAccount>> {
        ONFTLzReceiveTypes::apply(&ctx, &params)
    }
}

#[derive(Accounts)]
pub struct OFTVersion {}

#[derive(Clone, AnchorSerialize, AnchorDeserialize)]
pub struct Version {
    pub interface: u64,
    pub message: u64,
}
