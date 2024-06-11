import idl from "../../../anchor/target/idl/statelessratio.json";
import {
  ConnectionProvider,
  useAnchorWallet,
} from "@solana/wallet-adapter-react";
import { useMemo } from "react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";

import { PublicKey, clusterApiUrl } from "@solana/web3.js";
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
    console.log(program);
  }

  return <></>;
}
