import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Keypair } from "@solana/web3.js";
import fs from "fs";
import { PolicyEngine } from "../target/types/policy_engine";

const main = async () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const idl = JSON.parse(
    fs.readFileSync("target/idl/policy_engine.json", "utf8")
  );
  const program = new anchor.Program(idl, provider) as Program<PolicyEngine>;

  const allowListAccount = Keypair.generate();
  console.log({
    pub: allowListAccount.publicKey,
    sec: allowListAccount.secretKey,
  });

  // Create the AllowList account
  await program.methods
    .initialize()
    .accounts({
      allowList: allowListAccount.publicKey,
    })
    .signers([allowListAccount])
    .rpc();

  let newReceiver = Keypair.generate();
  console.log({ pub: newReceiver.publicKey, sec: newReceiver.secretKey });

  await program.methods
    .addToAllowList(newReceiver.publicKey)
    .accounts({
      allowList: allowListAccount.publicKey,
    })
    .rpc();

  let account = await program.account.allowList.fetch(
    allowListAccount.publicKey
  );

  console.log(account);
};

main();
