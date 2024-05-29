import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Statelessratio } from "../target/types/statelessratio";
import {
  clusterApiUrl,
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import {
  Account,
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  approve,
} from "@solana/spl-token";
import { airdropIfRequired } from "@solana-developers/helpers";

describe("statlessratio", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.Statelessratio as Program<Statelessratio>;
  const provider = anchor.getProvider();
  const connection = provider.connection;
  const payer = Keypair.generate();
  const B = Keypair.generate();

  let tokenAccount: Account;
  let tokenAccountB: Account;

  before(async () => {
    const airdropSignature = await connection.requestAirdrop(
      payer.publicKey,
      LAMPORTS_PER_SOL
    );
    const latestBlockHash = await connection.getLatestBlockhash();
    //connection.confirmTransaction({signature: "sdf"}, "finalized")
    // airdropIfRequired(connection)
    const confirmedTx = await connection.confirmTransaction({
      blockhash: latestBlockHash.blockhash,
      lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
      signature: airdropSignature,
    });
    // Confirm the transaction.
    console.log(`Confirmed transaction 1: ${confirmedTx.context.slot}`);
    const mint = await createMint(
      connection,
      payer,
      payer.publicKey,
      payer.publicKey,
      9 // We are using 9 to match the CLI decimal default exactly
    );

    console.log(mint.toBase58());

    tokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      payer,
      mint,
      payer.publicKey
    );
    tokenAccountB = await getOrCreateAssociatedTokenAccount(
      connection,
      payer,
      mint,
      B.publicKey
    );
    console.log("payer pk: ", payer.publicKey.toBase58());
    console.log("token account address: ", tokenAccount.address.toBase58());

    await mintTo(
      connection,
      payer,
      mint,
      tokenAccount.address,
      payer.publicKey,
      100000000000 // because decimals for the mint are set to 9
    );
  });

  it("Is initialized!", async () => {
    const tkA = tokenAccount.address;
    const tkB = tokenAccountB.address;

    const ratio_num = new anchor.BN(123);
    const ratio_de = new anchor.BN(100);
    const amount = new anchor.BN(42000);
    const [makerAuthority, mABump] =
      anchor.web3.PublicKey.findProgramAddressSync(
        [
          Buffer.from("stateless_ratio"),
          new Uint8Array(ratio_num.toArray("le", 8)),
          new Uint8Array(ratio_de.toArray("le", 8)),
          tkA.toBuffer(),
          tkA.toBuffer(),
        ], //tkA.toBuffer()

        program.programId
      );
    console.log("LFG");
    const apo = await approve(
      connection,
      payer,
      tkA,
      makerAuthority,
      payer.publicKey,
      590000000
    );
    const latestBlockHash = await connection.getLatestBlockhash();

    const confirmedTx = await connection.confirmTransaction({
      blockhash: latestBlockHash.blockhash,
      lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
      signature: apo,
    });
    const txDetailsA = await program.provider.connection.getTransaction(apo, {
      maxSupportedTransactionVersion: 0,
      commitment: "confirmed",
    });

    const logsA = txDetailsA?.meta?.logMessages || null;

    if (!logsA) {
      console.log("No logs found");
    }
    console.log("approve tx confirmed", logsA);
    // Confirm the transaction.
    console.log(`Confirmed transaction 1: ${confirmedTx.context.slot}`);
    console.log("MAAAKEauth: ", makerAuthority, "bump: ", mABump);
    const tokenBalance1 = await provider.connection.getTokenAccountBalance(tkB);
    console.log(`Alice's Token Balance: ${tokenBalance1.value.uiAmount}`);

    // Add your test here.
    const tx = await program.methods
      .fill(ratio_num, ratio_de, amount)
      .accounts({
        makerSrcAccount: tkA,
        makerDstAccount: tkA,
        takerSrcAccount: tkA,
        takerDstAccount: tkB,
      })
      .rpc();
    const latestBlockHash2 = await connection.getLatestBlockhash();

    const confirmedTx2 = await connection.confirmTransaction({
      blockhash: latestBlockHash2.blockhash,
      lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
      signature: apo,
    });
    const txDetails = await program.provider.connection.getTransaction(tx, {
      maxSupportedTransactionVersion: 0,
      commitment: "confirmed",
    });

    const logs = txDetails?.meta?.logMessages || null;

    if (!logs) {
      console.log("No logs found");
    }
    console.log("Your transaction signature", tx, txDetails, logs);
    const tokenBalance = await provider.connection.getTokenAccountBalance(tkB);
    console.log(`Alice's Token Balance: ${tokenBalance.value.uiAmount}`);
  });
});
