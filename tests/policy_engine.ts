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

  const allowListAccount = Keypair.generate();

  before(async () => {
    // Create the AllowList account
    await program.methods
      .initialize()
      .accounts({
        allowList: allowListAccount.publicKey,
      })
      .signers([allowListAccount])
      .rpc();
  });

  it("adds a new receiver to the allow list", async () => {
    let newReceiver = Keypair.generate().publicKey;

    await program.methods
      .addToAllowList(newReceiver)
      .accounts({
        allowList: allowListAccount.publicKey,
      })
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
      })
      .rpc();

    await program.methods
      .removeFromAllowList(receiverToRemove)
      .accounts({
        allowList: allowListAccount.publicKey,
      })
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
      })
      .rpc();

    let isAllowed = await program.methods
      .isAllowed(receiver)
      .accounts({
        allowList: allowListAccount.publicKey,
      })
      .view();

    expect(isAllowed).to.be.true;
  });
});
