use anchor_lang::prelude::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod solana_tweet {
    use super::*;

    /** --------------------------------------------------
    *                      FUNCTIONS
    ----------------------------------------------------*/
    pub fn setup_platform(ctx: Context<TweetPlatform>) -> Result<()> {
        let tweet = &mut ctx.accounts.tweet;

        tweet.likes = 0;
        tweet.message = ("").to_string();

        Ok(())
    }

    pub fn write_tweet(
        ctx: Context<WriteTweet>,
        message: String,
        user_public_key: Pubkey,
    ) -> Result<()> {
        let tweet = &mut ctx.accounts.tweet;

        // Cannot override a tweet message if the tweet message already has data
        if !tweet.message.trim().is_empty() {
            return err!(Errors::CannotUpdateTweet);
        }

        // Can't write an emptu tweet message if the message provided by external user is empty
        if message.trim().is_empty() {
            return err!(Errors::EmptyMessage);
        }

        tweet.message = message;
        tweet.likes = 0;
        tweet.creator = user_public_key;

        Ok(())
    }

    pub fn like_tweet(ctx: Context<LikeTweet>, user_liking_tweet: Pubkey) -> Result<()> {
        let tweet = &mut ctx.accounts.tweet;

        if tweet.message.trim().is_empty() {
            return err!(Errors::NotValidTweet);
        }

        if tweet.likes == 5 {
            return err!(Errors::ReachedMaximumLikes);
        }

        /*
         * Iterate through all the values from the people_who_liked data field
         * This verifies if the user liking the tweet has like it before.
         * Otherwise, add the user liking the tweet to the array
         */
        let mut iter = tweet.people_who_liked.iter();

        if iter.any(|&v| v == user_liking_tweet) {
            return err!(Errors::UserLikedTweet);
        }

        tweet.likes += 1;
        tweet.people_who_liked.push(user_liking_tweet);

        Ok(())
    }
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

/** --------------------------------------------------
*                      ERRORS
----------------------------------------------------*/
#[error_code]
pub enum Errors {
    #[msg("Tweet Cannot be upadted")]
    CannotUpdateTweet,

    #[msg("Message Cannot be empty")]
    EmptyMessage,

    #[msg("Cannot receive more than 5 likes")]
    ReachedMaximumLikes,

    #[msg("Cannot like a tweet without a valid message")]
    NotValidTweet,

    #[msg("User has already liked the tweet")]
    UserLikedTweet,
}
