import idl from "../../../anchor/target/idl/statelessratio.json";
import type {
  Commitment,
  ConfirmOptions,
  Connection,
  Signer,
} from "@solana/web3.js";
import {
  ConnectionProvider,
  useAnchorWallet,
  type AnchorWallet,
} from "@solana/wallet-adapter-react";
import * as anchor from "@coral-xyz/anchor";
import {
  createMint,
  mintTo,
  approve,
  createApproveInstruction,
  getAssociatedTokenAddressSync,
  createAssociatedTokenAccountIdempotentInstruction,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { useMemo } from "react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";

import { PublicKey, Transaction, clusterApiUrl } from "@solana/web3.js";
import {
  Program,
  type Idl,
  AnchorProvider,
  setProvider,
} from "@coral-xyz/anchor";
export function CreateOrder() {
  // The network can be set to 'devnet', 'testnet', or 'mainnet-beta'.
  const network = WalletAdapterNetwork.Devnet;

  // You can also provide a custom RPC endpoint.
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);
  return (
    <ConnectionProvider endpoint={endpoint}>
      <div>
        <CreateOrderButton />
      </div>
    </ConnectionProvider>
  );
}

export function CreateOrderButton() {
  //   const { connection } = useConnection();
  //   console.log(connection);
  const wallet = useAnchorWallet();
  console.log(wallet, "whatup");
  if (wallet) {
    const provider = new AnchorProvider(window.SolanaConnection, wallet, {});

    setProvider(provider);

    const program = new Program(idl as Idl, provider);
    console.log(program, wallet);
    async function newOrder(
      rationNumerator: number,
      ratioDenominator: number,
      orderSize: number,
      makerSrc: string,
      srcMint: string,
      dstMint: string,
      makerDest?: string,
      feePayer?: string
    ) {
      if (!makerDest) makerDest = makerSrc;
      if (!feePayer) feePayer = makerSrc;

      const makerSrcAddress = new PublicKey(makerSrc);
      const makerDestAddress = new PublicKey(makerDest);
      const feePayerAddress = new PublicKey(feePayer);
      const srcMintAddress = new PublicKey(srcMint);
      const dstMintAddress = new PublicKey(dstMint);

      const ratio_num = new anchor.BN(rationNumerator);
      const ratio_de = new anchor.BN(ratioDenominator);
      const amount = new anchor.BN(orderSize);
      const makerSrcTokenAddress = getAssociatedTokenAddressSync(
        srcMintAddress,
        makerSrcAddress,
        false,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      );
      const makerDstTokenAddress = getAssociatedTokenAddressSync(
        srcMintAddress,
        makerSrcAddress,
        false,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      );
      const [makerAuthority, mABump] =
        anchor.web3.PublicKey.findProgramAddressSync(
          [
            Buffer.from("stateless_ratio"),
            new Uint8Array(ratio_num.toArray("le", 8)),
            new Uint8Array(ratio_de.toArray("le", 8)),
            makerSrcTokenAddress.toBuffer(),
            makerDstTokenAddress.toBuffer(),
          ],
          program.programId
        );
      console.log("LFG");
      wallet?.signTransaction;

      // const transaction = new Transaction().add(
      //     createAssociatedTokenAccountIdempotentInstruction(
      //         payer.publicKey,
      //         associatedToken,
      //         owner,
      //         srcMintAddress,
      //         TOKEN_PROGRAM_ID,
      //         ASSOCIATED_TOKEN_PROGRAM_ID
      //     )
      // );

      // await sendAndConfirmTransaction(connection, transaction, [payer], confirmOptions);

      //    const sourceAccount = await createAssociatedTokenAccountIdempotent(connection, feePayerAddress, srcMintAddress, owner.publicKey, {});
      //  const tokenAccount = getAssociatedTokenAddressSync(
      const transaction = new Transaction().add(
        createApproveInstruction(
          makerSrcTokenAddress,
          makerAuthority,
          makerSrcAddress,
          orderSize
        )
      );

      const signedTx = await wallet?.signTransaction(transaction);
      if (signedTx) {
        window.SolanaConnection.sendRawTransaction(signedTx.serialize());
      }
    }
    function fillOrder() {}
  }

  return <></>;
}
