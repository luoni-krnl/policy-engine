import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Keypair } from "@solana/web3.js";
import { expect } from "chai";
import { PolicyEngine } from "../target/types/policy_engine";

describe("policy_engine", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.PolicyEngine as Program<PolicyEngine>;

  const tester = new Keypair();

  it("Is allowed!", async () => {
    await program.methods
      .setAllow(true)
      .accounts({ user: tester.publicKey })
      .signers([tester])
      .rpc();

    const tx = await program.account.allowInfo.fetch(tester.publicKey);
    expect(tx.isAllowed).true;
  });
});
