import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { assert, expect, use } from "chai";
import { SolanaTweet } from "../target/types/solana_tweet";

describe("solanaTweet", () => {
  const provider = anchor.AnchorProvider.local();

  // Configure the client to use the local cluster.
  anchor.setProvider(provider);

  // access the solana program and execute instructions

  // workspace is used to access all solana programs in local project
  const program = anchor.workspace.SolanaTweet as Program<SolanaTweet>;

  // Define user wallet
  const user = provider.wallet;

  it("setup tweet platform!", async () => {
    /**
     * Genereate key pairs to execute tests
     * The key pairs represent a wallet are accounts we validate in the solana program
     */
    const tweetKeyPair = anchor.web3.Keypair.generate();

    // Trigger instruction or methods via RPC
    await program.rpc.setupPlatform({
      accounts: {
        tweet: tweetKeyPair.publicKey,
        user: user.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      },
      signers: [tweetKeyPair],
    });

    // Access the tweet account and trigger fetch method with pk for tweet account to access decentralized data ,used to run test validators
    let tweet = await program.account.tweet.fetch(tweetKeyPair.publicKey);
    expect(tweet.likes).to.equal(0);
    expect(tweet.message).to.equal("");
  });
  it("Write a tweet", async () => {
    const tweetKeyPair = anchor.web3.Keypair.generate();

    await program.rpc.setupPlatform({
      accounts: {
        tweet: tweetKeyPair.publicKey,
        user: user.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      },
      signers: [tweetKeyPair],
    });

    let tweet = await program.account.tweet.fetch(tweetKeyPair.publicKey);
    expect(tweet.likes).to.equal(0);
    expect(tweet.message).to.equal("");

    await program.rpc.writeTweet("Hello World!", user.publicKey, {
      accounts: {
        tweet: tweetKeyPair.publicKey,
      },
      signers: [],
    });

    tweet = await program.account.tweet.fetch(tweetKeyPair.publicKey);

    expect(tweet.likes).to.equal(0);
    expect(tweet.message).to.equal("Hello World!");
    expect(tweet.creator.toString()).to.equal(user.publicKey.toString());
  });

  it("should like tweet up no more than 5 times", async () => {
    const tweetKeyPair = anchor.web3.Keypair.generate();

    await program.rpc.setupPlatform({
      accounts: {
        tweet: tweetKeyPair.publicKey,
        user: user.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      },
      signers: [tweetKeyPair],
    });

    let tweet = await program.account.tweet.fetch(tweetKeyPair.publicKey);
    expect(tweet.likes).to.equal(0);
    expect(tweet.message).to.equal("");

    await program.rpc.writeTweet("Hello World!", user.publicKey, {
      accounts: {
        tweet: tweetKeyPair.publicKey,
      },
      signers: [],
    });

    tweet = await program.account.tweet.fetch(tweetKeyPair.publicKey);
    expect(tweet.likes).to.equal(0);
    expect(tweet.message).to.equal("Hello World!");
    expect(tweet.creator.toString()).to.equal(user.publicKey.toString());

    await program.rpc.likeTweet(user.publicKey, {
      accounts: {
        tweet: tweetKeyPair.publicKey,
      },
      signers: [],
    });

    tweet = await program.account.tweet.fetch(tweetKeyPair.publicKey);
    expect(tweet.likes).to.equal(1);
    expect(tweet.peopleWhoLiked[0].toString()).to.equal(
      user.publicKey.toString()
    );

    try {
      await program.rpc.likeTweet(user.publicKey, {
        accounts: {
          tweet: tweetKeyPair.publicKey,
        },
        signers: [],
      });

      assert.ok(false);
    } catch (error) {
      const expectedError = "User has already liked the tweet";
      assert.equal(error.error.errorMessage, expectedError);
    }
    const secondUser = anchor.web3.Keypair.generate();
    await program.rpc.likeTweet(secondUser.publicKey, {
      accounts: {
        tweet: tweetKeyPair.publicKey,
      },
      signers: [],
    });

    tweet = await program.account.tweet.fetch(tweetKeyPair.publicKey);
    expect(tweet.likes).to.equal(2);
    expect(tweet.peopleWhoLiked[1].toString()).to.equal(
      secondUser.publicKey.toString()
    );

    const thirdUser = anchor.web3.Keypair.generate();
    await program.rpc.likeTweet(thirdUser.publicKey, {
      accounts: {
        tweet: tweetKeyPair.publicKey,
      },
      signers: [],
    });

    tweet = await program.account.tweet.fetch(tweetKeyPair.publicKey);
    expect(tweet.likes).to.equal(3);
    expect(tweet.peopleWhoLiked[2].toString()).to.equal(
      thirdUser.publicKey.toString()
    );

    const fourthUser = anchor.web3.Keypair.generate();
    await program.rpc.likeTweet(fourthUser.publicKey, {
      accounts: {
        tweet: tweetKeyPair.publicKey,
      },
      signers: [],
    });

    tweet = await program.account.tweet.fetch(tweetKeyPair.publicKey);
    expect(tweet.likes).to.equal(4);
    expect(tweet.peopleWhoLiked[3].toString()).to.equal(
      fourthUser.publicKey.toString()
    );

    const fifthUser = anchor.web3.Keypair.generate();
    await program.rpc.likeTweet(fifthUser.publicKey, {
      accounts: {
        tweet: tweetKeyPair.publicKey,
      },
      signers: [],
    });

    tweet = await program.account.tweet.fetch(tweetKeyPair.publicKey);
    expect(tweet.likes).to.equal(5);
    expect(tweet.peopleWhoLiked[4].toString()).to.equal(
      fifthUser.publicKey.toString()
    );

    const sixthUser = anchor.web3.Keypair.generate();
    try {
      await program.rpc.likeTweet(sixthUser.publicKey, {
        accounts: {
          tweet: tweetKeyPair.publicKey,
        },
        signers: [],
      });

      assert.ok(false);
    } catch (error) {
      assert.equal(
        error.error.errorMessage,
        "Cannot receive more than 5 likes"
      );
    }
  });
  it("should not allow writting an empty message", async () => {
    const tweetKeypair = anchor.web3.Keypair.generate();

    await program.rpc.setupPlatform({
      accounts: {
        tweet: tweetKeypair.publicKey,
        user: user.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      },
      signers: [tweetKeypair],
    });

    let tweet = await program.account.tweet.fetch(tweetKeypair.publicKey);
    expect(tweet.likes).to.equal(0);
    expect(tweet.message).to.equal("");

    try {
      await program.rpc.writeTweet("", user.publicKey, {
        accounts: {
          tweet: tweetKeypair.publicKey,
        },
        signers: [],
      });
      assert.ok(false);
    } catch (error) {
      assert.equal(error.error.errorMessage, "Message Cannot be empty");
    }
  });
});
