use anchor_lang::prelude::*;

declare_id!("9TRhu4fGB2nPXFGWQUj9sLZdte5bpPucNVcAgLeKXE96");

#[program]
pub mod policy_engine {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let allow_list = &mut ctx.accounts.allow_list;
        allow_list.allowed_receivers = Vec::new();
        Ok(())
    }

    pub fn add_to_allow_list(ctx: Context<ModifyAllowList>, new_receiver: Pubkey) -> Result<()> {
        let allow_list = &mut ctx.accounts.allow_list;
        if !allow_list.allowed_receivers.contains(&new_receiver) {
            allow_list.allowed_receivers.push(new_receiver);
        }
        Ok(())
    }

    pub fn remove_from_allow_list(ctx: Context<ModifyAllowList>, to_remove: Pubkey) -> Result<()> {
        let allow_list = &mut ctx.accounts.allow_list;
        allow_list.allowed_receivers.retain(|&x| x != to_remove);
        Ok(())
    }

    pub fn is_allowed(ctx: Context<CheckAllowList>, receiver: Pubkey) -> Result<bool> {
        let allow_list = &ctx.accounts.allow_list;
        Ok(allow_list.allowed_receivers.contains(&receiver))
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(init, payer = payer, space = 8 + 32 * 10)]
    pub allow_list: Account<'info, AllowList>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ModifyAllowList<'info> {
    #[account(mut)]
    pub allow_list: Account<'info, AllowList>,
    /// CHECK: This is a user-provided account, safe to use.
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CheckAllowList<'info> {
    pub allow_list: Account<'info, AllowList>,
}

#[account]
#[derive(Default)]
pub struct AllowList {
    pub allowed_receivers: Vec<Pubkey>,
}

impl AllowList {
    const LEN: usize = 8 + 32 * 10; // Adjust size as needed
}
