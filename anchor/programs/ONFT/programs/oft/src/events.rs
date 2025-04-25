use crate::*;

#[event]
pub struct OFTSent {
    pub guid: [u8; 32],
    pub dst_eid: u32,
    pub from: Pubkey,
    pub amount_sent_ld: u64,
    pub amount_received_ld: u64,
}

#[event]
pub struct OFTReceived {
    pub guid: [u8; 32],
    pub src_eid: u32,
    pub to: Pubkey,
    pub amount_received_ld: u64,
}

// ONFT specific events
#[event]
pub struct ONFTCreated {
    pub admin: Pubkey,
    pub user_1: Pubkey,
    pub user_2: Pubkey,
    pub amount: u64,
    pub agreement_days: u64,
}

#[event]
pub struct ONFTStatusChanged {
    pub nft_data: Pubkey,
    pub old_status: OrderStatus,
    pub new_status: OrderStatus,
}

#[event]
pub struct ONFTAgreementSigned {
    pub nft_data: Pubkey,
    pub signer: Pubkey,
    pub role: String,
}

#[event]
pub struct ONFTFundsTransferred {
    pub nft_data: Pubkey,
    pub from: Pubkey,
    pub to: Pubkey,
    pub amount: u64,
}
