import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Keypair } from "@solana/web3.js";
import { expect } from "chai";
import { PolicyEngine } from "../target/types/policy_engine";

describe("policy_engine", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.PolicyEngine as Program<PolicyEngine>;

  let user = Keypair.generate();
  let allowListAccount = Keypair.generate();

  before(async () => {
    // Airdrop SOL to the user
    const airdropSignature = await provider.connection.requestAirdrop(
      user.publicKey,
      2e9
    );
    await provider.connection.confirmTransaction(airdropSignature);

    // Create the AllowList account
    await program.methods
      .initialize()
      .accounts({
        allowList: allowListAccount.publicKey,
        user: user.publicKey,
      })
      .signers([allowListAccount, user])
      .rpc();
  });

  it("adds a new receiver to the allow list", async () => {
    let newReceiver = Keypair.generate().publicKey;

    await program.methods
      .addToAllowList(newReceiver)
      .accounts({
        allowList: allowListAccount.publicKey,
        user: user.publicKey,
      })
      .signers([user])
      .rpc();

    let account = await program.account.allowList.fetch(
      allowListAccount.publicKey
    );

    expect(account.allowedReceivers[0].equals(newReceiver)).true;
  });

  it("removes a receiver from the allow list", async () => {
    let receiverToRemove = Keypair.generate().publicKey;

    await program.methods
      .addToAllowList(receiverToRemove)
      .accounts({
        allowList: allowListAccount.publicKey,
        user: user.publicKey,
      })
      .signers([user])
      .rpc();

    await program.methods
      .removeFromAllowList(receiverToRemove)
      .accounts({
        allowList: allowListAccount.publicKey,
        user: user.publicKey,
      })
      .signers([user])
      .rpc();

    let account = await program.account.allowList.fetch(
      allowListAccount.publicKey
    );

    expect(account.allowedReceivers).to.not.include(receiverToRemove);
  });

  it("checks if a receiver is allowed", async () => {
    let receiver = Keypair.generate().publicKey;

    await program.methods
      .addToAllowList(receiver)
      .accounts({
        allowList: allowListAccount.publicKey,
        user: user.publicKey,
      })
      .signers([user])
      .rpc();

    let isAllowed = await program.methods
      .isAllowed(receiver)
      .accounts({
        allowList: allowListAccount.publicKey,
        user: user.publicKey,
      })
      .view();

    expect(isAllowed).to.be.true;
  });
});
