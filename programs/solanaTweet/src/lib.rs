use anchor_lang::prelude::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod solana_tweet {
    use super::*;
}

/** --------------------------------------------------
*                      STRUCTS
----------------------------------------------------*/

// Tweet Struct
#[account] // An attribute for a data structure representing a solana account
#[derive(Default)]
pub struct Tweet {
    message: String,
    likes: u8,
    creator: Pubkey,
    people_who_liked: Vec<Pubkey>,
}

// TweetPlatform Struct
#[derive(Accounts)]
pub struct TweetPlatform<'info> {
    #[account(init, payer = user, space = 900)]
    pub tweet: Account<'info, Tweet>,

    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

// Write Tweet Struct
#[derive(Accounts)]
pub struct WriteTweet<'info> {
    #[account(mut)]
    pub tweet: Account<'info, Tweet>,
}

// Like Tweet Struct
#[derive(Accounts)]
pub struct LikeTweet<'info> {
    #[account(mut)]
    pub tweet: Account<'info, Tweet>,
}
