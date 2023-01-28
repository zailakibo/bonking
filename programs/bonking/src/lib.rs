use anchor_lang::prelude::*;
use anchor_spl::{token::{Mint, Token, TokenAccount}, associated_token::AssociatedToken};
use std::mem::size_of;

declare_id!("Gx2UZFaDLEw3XQZdrdrTEEGfEBP9itEHuE4xpdGFJDUJ");

/// b"bonking" hash
static BONKING: [u8; 32] = [
    109, 146, 230, 240, 219, 18, 236, 38, 126, 73, 146, 5, 30, 240, 125, 127, 19, 146, 238, 226,
    45, 61, 159, 250, 130, 77, 124, 53, 210, 237, 120, 65,
];

#[program]
pub mod bonking {
    use anchor_spl::token::CloseAccount;

    use super::*;

    pub fn initialize(
        ctx: Context<Initialize>,
        hash: [u8; 32],
        bonk_timeout: i64,
        _slug: String,
        amount: u64,
        mint: Pubkey,
        announcement_timeout: i64,
    ) -> Result<()> {
        ctx.accounts.bonking.count = 0;
        ctx.accounts.bonking.hash1 = hash;
        ctx.accounts.bonking.hash2 = hash;
        ctx.accounts.bonking.timeout = bonk_timeout;
        ctx.accounts.bonking.status = 1;
        ctx.accounts.bonking.amount = amount;
        ctx.accounts.bonking.mint = mint;
        ctx.accounts.bonking.owner = ctx.accounts.payer.key.to_owned();
        ctx.accounts.bonking.announcement_timeout = announcement_timeout;

        // take the ownership of this TokenAccount
        let cpi_accounts = anchor_spl::token::SetAuthority {
            account_or_mint: ctx.accounts.escrow_wallet.to_account_info(),
            current_authority: ctx.accounts.payer.to_account_info(),
        };
        let cpi_context =
            CpiContext::new(ctx.accounts.token_program.to_account_info(), cpi_accounts);
        let (vault_authority, _bump) = Pubkey::find_program_address(
            &[
                b"wallet",
                ctx.accounts.bonking.to_account_info().key.as_ref(),
            ],
            ctx.program_id,
        );
        anchor_spl::token::set_authority(
            cpi_context,
            anchor_spl::token::spl_token::instruction::AuthorityType::AccountOwner,
            Some(vault_authority),
        )?;
        Ok(())
    }

    pub fn bonk(ctx: Context<BonkMe>) -> Result<()> {
        if ctx.accounts.bonking.status != 1 {
            panic!("Wrong status");
        }
        if ctx.accounts.bonking.amount != 0 {
            panic!("Wrong method, use payed_bonk");
        }
        ctx.accounts.bonk.owner = ctx.accounts.payer.key();
        ctx.accounts.bonk.num = ctx.accounts.bonking.count;
        ctx.accounts.bonk.announcement_timeout = ctx.accounts.bonking.announcement_timeout;
        let mut source = ctx.accounts.bonking.hash2.to_vec();
        let mut key = ctx.accounts.payer.key().to_bytes().to_vec().to_owned();
        source.append(&mut key);
        let clock = Clock::get()?;
        let mut time = clock.unix_timestamp.to_le_bytes().to_vec();
        source.append(&mut time);
        let res = anchor_lang::solana_program::keccak::hash(&source);
        ctx.accounts.bonking.hash2 = res.to_bytes();
        ctx.accounts.bonking.count += 1;
        Ok(())
    }

    pub fn payed_bonk(ctx: Context<PayedBonk>) -> Result<()> {
        if ctx.accounts.bonking.status != 1 {
            panic!("Wrong status");
        }
        ctx.accounts.bonk.owner = ctx.accounts.payer.key();
        ctx.accounts.bonk.num = ctx.accounts.bonking.count;
        let mut source = ctx.accounts.bonking.hash2.to_vec();
        let mut key = ctx.accounts.payer.key().to_bytes().to_vec().to_owned();
        source.append(&mut key);
        let clock = Clock::get()?;
        let mut time = clock.unix_timestamp.to_le_bytes().to_vec();
        source.append(&mut time);
        let res = anchor_lang::solana_program::keccak::hash(&source);
        ctx.accounts.bonking.hash2 = res.to_bytes();
        ctx.accounts.bonking.count += 1;

        let cpi_accounts = anchor_spl::token::Transfer {
            from: ctx.accounts.from_account.to_account_info(),
            to: ctx.accounts.to_account.to_account_info(),
            authority: ctx.accounts.payer.to_account_info(),
        };
        msg!(
            "transfer from {:?}; to {:?}",
            ctx.accounts.from_account.key(),
            ctx.accounts.to_account.key()
        );
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        anchor_spl::token::transfer(cpi_ctx, ctx.accounts.bonking.amount)?;
        Ok(())
    }

    pub fn finalize(ctx: Context<Finalize>, hash1_source: String) -> Result<()> {
        let clock = Clock::get()?;
        if clock.unix_timestamp < ctx.accounts.bonking.timeout {
            panic!("Still alive");
        }
        let res = anchor_lang::solana_program::keccak::hash(&hash1_source.as_bytes());
        if res.to_bytes() != ctx.accounts.bonking.hash1 {
            msg!("hash = {:?}", res.to_bytes());
            panic!("Fail the hash does not match");
        }
        let mut source = ctx.accounts.bonking.hash2.to_vec();
        let mut key = hash1_source.as_bytes().to_owned();
        source.append(&mut key);
        let res = anchor_lang::solana_program::keccak::hash(&source);
        let bytes = res.to_bytes();
        let most_recent = arrayref::array_ref![bytes, 12, 4];
        let number = u32::from_le_bytes(*most_recent);
        let index = number % ctx.accounts.bonking.count;

        let bonking = &mut ctx.accounts.bonking;
        bonking.winner = index;
        bonking.status = 2;
        msg!(
            "number = {:?}; count = {:?}; winner = {:?}; status = {:?}",
            number,
            ctx.accounts.bonking.count,
            index,
            ctx.accounts.bonking.status,
        );
        Ok(())
    }

    pub fn finalize_by_timeout(ctx: Context<Finalize>) -> Result<()> {
        let clock = Clock::get()?;
        let tolerance = 15 * 60;
        if clock.unix_timestamp > ctx.accounts.bonking.timeout + tolerance {
            let most_recent = arrayref::array_ref![ctx.accounts.bonking.hash2, 12, 4];
            let number = u32::from_le_bytes(*most_recent);
            let index = number % ctx.accounts.bonking.count;
            ctx.accounts.bonking.winner = index;
            ctx.accounts.bonking.status = 2;
        } else {
            panic!("Wait for a while");
        }
        Ok(())
    }

    pub fn withdraw_initializing_token_account(
        ctx: Context<WithdrawInitializingWinnerTokenAccount>,
    ) -> Result<()> {
        inner_withdraw(
            ctx.program_id,
            &mut ctx.accounts.bonking,
            &ctx.accounts.winner_bonk,
            &ctx.accounts.escrow_wallet.to_account_info(),
            &ctx.accounts.to.to_account_info(),
            &ctx.accounts.token_program.to_account_info(),
            ctx.accounts.escrow_wallet.amount,
        )?;
        Ok(())
    }

    pub fn withdraw(ctx: Context<Withdraw>) -> Result<()> {
        inner_withdraw(
            ctx.program_id,
            &mut ctx.accounts.bonking,
            &ctx.accounts.winner_bonk,
            &ctx.accounts.escrow_wallet.to_account_info(),
            &ctx.accounts.to.to_account_info(),
            &ctx.accounts.token_program.to_account_info(),
            ctx.accounts.escrow_wallet.amount,
        )?;
        Ok(())
    }

    pub fn close_bonking(ctx: Context<CloseBonking>) -> Result<()> {
        if ctx.accounts.bonking.status != 3 {
            panic!("Bonk is not ended");
        }
        let clock = Clock::get()?;
        if clock.unix_timestamp < ctx.accounts.bonking.announcement_timeout {
            panic!("Wait for a while to close the bonking");
        }
        let cpi_accounts = CloseAccount {
            account: ctx.accounts.escrow_wallet.to_account_info(),
            destination: ctx.accounts.payer.to_account_info(),
            authority: ctx.accounts.escrow_wallet.to_account_info(),
        };

        // Close the wallet
        let (_vault_authority, vault_authority_bump) = Pubkey::find_program_address(
            &[
                b"wallet",
                ctx.accounts.bonking.to_account_info().key.as_ref(),
            ],
            ctx.program_id,
        );
        let authority_seeds = &[
            b"wallet",
            ctx.accounts.bonking.to_account_info().key.as_ref(),
            &[vault_authority_bump],
        ];
        let signer = &[&authority_seeds[..]];

        let cpi_context = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            cpi_accounts,
            signer,
        );
        anchor_spl::token::close_account(cpi_context)?;
        Ok(())
    }

    pub fn close_bonk(_ctx: Context<CloseBonk>) -> Result<()> {
        Ok(())
    }
}

fn inner_withdraw<'a>(
    program_id: &Pubkey,
    bonking: &mut Account<Bonking>,
    bonk: &Account<Bonk>,
    escrow_wallet: &AccountInfo<'a>,
    to: &AccountInfo<'a>,
    token_program: &AccountInfo<'a>,
    amount: u64,
) -> Result<()> {
    msg!("winner = {}; status = {:?}", bonking.winner, bonking.status);
    if bonking.status != 2 {
        panic!("Wrong status");
    }
    // check if bonk belongs to bonking
    let seeds = &[
        b"bonk",
        bonking.to_account_info().key.as_ref(),
        &bonk.num.to_le_bytes(),
    ];
    let (expected_key, _) = Pubkey::find_program_address(seeds, &ID);
    if bonk.key() != expected_key {
        panic!("Wrong bonk {:?} vs {:?}", bonk.key(), expected_key);
    }

    if bonk.num != bonking.winner {
        panic!("Wrong winner");
    }

    let (_vault_authority, vault_authority_bump) = Pubkey::find_program_address(
        &[b"wallet", bonking.to_account_info().key.as_ref()],
        program_id,
    );
    let authority_seeds = &[
        b"wallet",
        bonking.to_account_info().key.as_ref(),
        &[vault_authority_bump],
    ];
    let signer = &[&authority_seeds[..]];
    let cpi_accounts = anchor_spl::token::Transfer {
        from: escrow_wallet.to_account_info(),
        to: to.to_account_info(),
        authority: escrow_wallet.to_account_info(),
    };
    let cpi_program = token_program.to_account_info();
    let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);
    anchor_spl::token::transfer(cpi_ctx, amount)?;
    bonking.status = 3;
    Ok(())
}

#[derive(Accounts)]
pub struct CloseBonk<'info> {
    /// will be closed
    #[account(
        mut, close = payer,
        constraint = bonk.owner == payer.key()
    )]
    bonk: Account<'info, Bonk>,

    #[account(mut)]
    payer: Signer<'info>,
}

#[derive(Accounts)]
pub struct CloseBonking<'info> {
    /// will be closed
    #[account(mut, close = payer)]
    bonking: Account<'info, Bonking>,

    /// will be closed
    #[account(mut)]
    escrow_wallet: Account<'info, TokenAccount>,

    #[account(mut)]
    payer: Signer<'info>,

    token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(mut)]
    pub bonking: Account<'info, Bonking>,

    #[account(
        mut,
        constraint = bonking.winner == winner_bonk.num,
        constraint = payer.key() == winner_bonk.owner,
        close = payer,
    )]
    pub winner_bonk: Account<'info, Bonk>,

    #[account(
        mut,
        constraint = mint.key() == escrow_wallet.mint,
        constraint = mint.key() == to.mint,
    )]
    pub escrow_wallet: Account<'info, TokenAccount>,
    pub mint: Account<'info, Mint>, // USDC

    #[account(
        mut,
        constraint = to.owner == payer.key()
    )]
    pub to: Account<'info, TokenAccount>,

    #[account(mut)]
    pub payer: Signer<'info>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct WithdrawInitializingWinnerTokenAccount<'info> {
    #[account(mut)]
    bonking: Account<'info, Bonking>,

    #[account(
        mut,
        constraint = bonking.winner == winner_bonk.num,
        constraint = payer.key() == winner_bonk.owner,
        close = payer,
    )]
    winner_bonk: Account<'info, Bonk>,

    #[account(
        mut,
        constraint = mint.key() == escrow_wallet.mint,
        constraint = mint.key() == to.mint,
    )]
    escrow_wallet: Account<'info, TokenAccount>,
    mint: Account<'info, Mint>, // USDC

    #[account(
        init,
        payer = payer,
        associated_token::mint = mint,
        associated_token::authority = payer,
    )]
    to: Account<'info, TokenAccount>,

    #[account(mut)]
    payer: Signer<'info>,
    token_program: Program<'info, Token>,
    system_program: Program<'info, System>,
    associated_token_program: Program<'info, AssociatedToken>,
}

#[derive(Accounts)]
#[instruction(hash: [u8; 32], bonk_timeout: i64, slug: String)]
pub struct Initialize<'info> {
    #[account(init, payer = payer, seeds = [
        &BONKING,
        &anchor_lang::solana_program::keccak::hash(&slug.as_bytes()).to_bytes(),
    ], bump, space = 8 + size_of::<Bonking>())]
    bonking: Account<'info, Bonking>,

    #[account(
        init,
        payer = payer,
        seeds = [
            b"wallet".as_ref(),
            bonking.key().as_ref(),
        ],
        bump,
        token::mint = prize_mint,
        token::authority = payer,
    )]
    escrow_wallet: Account<'info, TokenAccount>,

    /// ticket coin
    mint: Account<'info, Mint>,

    prize_mint: Account<'info, Mint>,

    #[account(mut)]
    payer: Signer<'info>,
    system_program: Program<'info, System>,
    token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct BonkMe<'info> {
    #[account(init, payer = payer,
        seeds = [b"bonk", bonking.key().as_ref(), &bonking.count.to_le_bytes()],
        bump, space = 8 + size_of::<Bonk>())]
    bonk: Account<'info, Bonk>,

    #[account(mut)]
    bonking: Account<'info, Bonking>,

    #[account(mut)]
    payer: Signer<'info>,
    system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct PayedBonk<'info> {
    #[account(init, payer = payer,
        seeds = [b"bonk", bonking.key().as_ref(), &bonking.count.to_le_bytes()],
        bump, space = 8 + size_of::<Bonk>())]
    bonk: Account<'info, Bonk>,

    #[account(mut)]
    from_account: Account<'info, TokenAccount>,

    #[account(mut,
        constraint = to_account.owner == bonking.owner,
        constraint = to_account.mint == bonking.mint,
    )]
    to_account: Account<'info, TokenAccount>,

    #[account(mut)]
    bonking: Account<'info, Bonking>,

    #[account(mut)]
    payer: Signer<'info>,
    system_program: Program<'info, System>,

    token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct Finalize<'info> {
    #[account(mut)]
    bonking: Account<'info, Bonking>,
}

#[account]
#[derive(Debug, Default)]
pub struct Bonk {
    owner: Pubkey,
    num: u32,
    announcement_timeout: i64,
}

#[account]
#[derive(Debug, Default)]
pub struct Bonking {
    count: u32,
    winner: u32,
    hash1: [u8; 32],
    hash2: [u8; 32],
    timeout: i64,
    status: u8,
    owner: Pubkey,
    amount: u64,
    mint: Pubkey,
    announcement_timeout: i64,
}
