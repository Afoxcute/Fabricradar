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

// ONFT Events
#[event]
pub struct ONFTCreated {
    pub token_id: u64,
    pub owner: Pubkey,
    pub signers: [Pubkey; 2],
    pub days_to_complete: u8,
    pub timestamp: i64,
}

#[event]
pub struct ONFTStatusChanged {
    pub token_id: u64,
    pub previous_status: OrderStatus,
    pub new_status: OrderStatus,
    pub changed_by: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct ONFTSignerApproved {
    pub token_id: u64,
    pub signer_index: u8,
    pub signer: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct ONFTAutoCompleted {
    pub token_id: u64,
    pub completion_due_time: i64,
    pub actual_completion_time: i64,
}

#[event]
pub struct ONFTSent {
    pub guid: [u8; 32],
    pub dst_eid: u32,
    pub token_id: u64,
    pub from: Pubkey,
    pub to: [u8; 32],
}

#[event]
pub struct ONFTReceived {
    pub guid: [u8; 32],
    pub src_eid: u32,
    pub token_id: u64,
    pub to: Pubkey,
}
