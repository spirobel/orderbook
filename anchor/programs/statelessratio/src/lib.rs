use anchor_lang::prelude::*;
use anchor_spl::token::{Token, TokenAccount};

declare_id!("ERNmR8VbsNrrrJtpnuwaLtsd1hkZ9oAhi8XAZbqJtUZZ");

#[program]
pub mod statelessratio {
    use super::*;

    pub fn fill(
        ctx: Context<FillOrder>,
        ratio_numerator: u64,
        ratio_denominator: u64,
        amount: u64,
    ) -> Result<()> {
        //calculate price
        let price = amount
            .checked_mul(ratio_numerator)
            .and_then(|m| m.checked_div(ratio_denominator))
            .ok_or(StatelessRatioErrors::RatioWrong)?;
        //taker to maker
        anchor_spl::token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                anchor_spl::token::Transfer {
                    from: ctx.accounts.taker_src_account.to_account_info(),
                    to: ctx.accounts.maker_dst_account.to_account_info(),
                    authority: ctx.accounts.maker_authority.to_account_info(),
                },
                &[&[
                    "stateless_ratio".as_bytes(),
                    &ratio_numerator.to_le_bytes(),
                    &ratio_denominator.to_le_bytes(),
                    ctx.accounts.maker_src_account.key().as_ref(),
                    ctx.accounts.maker_dst_account.key().as_ref(),
                    &[ctx.bumps.maker_authority],
                ]],
            ),
            price,
        )?;
        // maker to taker
        anchor_spl::token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                anchor_spl::token::Transfer {
                    from: ctx.accounts.maker_src_account.to_account_info(),
                    to: ctx.accounts.taker_dst_account.to_account_info(),
                    authority: ctx.accounts.maker_authority.to_account_info(),
                },
                &[&[
                    "stateless_ratio".as_bytes(),
                    &ratio_numerator.to_le_bytes(),
                    &ratio_denominator.to_le_bytes(),
                    ctx.accounts.maker_src_account.key().as_ref(),
                    ctx.accounts.maker_dst_account.key().as_ref(),
                    &[ctx.bumps.maker_authority],
                ]],
            ),
            amount,
        )?;
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(ratio_numerator: u64,ratio_denominator: u64)]
pub struct FillOrder<'info> {
    /// CHECK: we encode the crucial information in the PDA seeds.
    /// Its very existence is proof we can transfer according to the information in the seeds
    #[account(
        seeds = ["stateless_ratio".as_bytes(),
        &ratio_numerator.to_le_bytes(),
        &ratio_denominator.to_le_bytes(),
        maker_src_account.key().as_ref(),
        maker_dst_account.key().as_ref(),
        ],
        bump,
    )]
    maker_authority: UncheckedAccount<'info>,
    #[account(mut)]
    maker_src_account: Account<'info, TokenAccount>,
    #[account(mut)]
    maker_dst_account: Account<'info, TokenAccount>,
    #[account(mut)]
    taker_src_account: Account<'info, TokenAccount>,
    #[account(mut)]
    taker_dst_account: Account<'info, TokenAccount>,
    token_program: Program<'info, Token>,
}

#[error_code]
pub enum StatelessRatioErrors {
    #[msg("ratio numerator or denominator wrong")]
    RatioWrong,
}
