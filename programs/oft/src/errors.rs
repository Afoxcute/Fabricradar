use anchor_lang::prelude::error_code;

#[error_code]
pub enum OFTError {
    Unauthorized,
    InvalidSender,
    InvalidDecimals,
    SlippageExceeded,
    InvalidTokenDest,
    RateLimitExceeded,
    InvalidFee,
    InvalidMintAuthority,
    Paused,
}

#[error_code]
pub enum ONFTError {
    Unauthorized,
    InvalidSender,
    InvalidDecimals,
    SlippageExceeded,
    InvalidTokenDest,
    RateLimitExceeded,
    InvalidFee,
    InvalidMintAuthority,
    Paused,
    // ONFT specific errors
    MissingAdminSignature,
    MissingSignerApproval,
    InvalidStatusTransition,
    OrderAlreadyProcessing,
    OrderAlreadyCompleted,
    SignerNotAuthorized,
    InsufficientApprovals,
    MetadataTooLong,
    InvalidSigner,
}
