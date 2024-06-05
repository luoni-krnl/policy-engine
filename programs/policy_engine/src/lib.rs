use anchor_lang::prelude::*;

declare_id!("9TRhu4fGB2nPXFGWQUj9sLZdte5bpPucNVcAgLeKXE96");

#[program]
pub mod policy_engine {
    use super::*;

    pub fn set_allow(ctx: Context<SetAllow>, is_allowed: bool) -> Result<()> {
        ctx.accounts.user.is_allowed = is_allowed;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct SetAllow<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(
        init, 
        payer = payer, 
        space=8 + AllowInfo::INIT_SPACE,
    )]
    pub user: Account<'info, AllowInfo>,
    pub system_program: Program<'info, System>,
}

#[account]
#[derive(InitSpace)]
pub struct AllowInfo {
    pub is_allowed: bool,
}
