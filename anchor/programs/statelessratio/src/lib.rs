use anchor_lang::prelude::*;

declare_id!("2uVqRzV8VRhiVcmxa9icADma7Zg5r2S56JFD7thy9f13");

#[program]
pub mod anchor {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
