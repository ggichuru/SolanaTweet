import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { expect } from "chai";
import { SolanaTweet } from "../target/types/solana_tweet";

describe("solanaTweet", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.SolanaTweet as Program<SolanaTweet>;

  it("setup tweet platform!", async () => {
    const tweetKeyPair = anchor.web3.Keypair.generate();
    const user = program.provider.wallet;

    await program.rpc.setupPlatform({
      accounts: {
        tweet: tweetKeyPair.publicKey,
        user: user,
        systemProgram: anchor.web3.SystemProgram.programId,
      },
      signers: [tweetKeyPair],
    });
    let tweet = await program.account.tweet.fetch(tweetKeyPair.publicKey);
    expect(tweet.likes).to.equal(0);
    expect(tweet.message).to.equal("");
  });
});
