import { clusterApiUrl, Connection } from "@solana/web3.js";
declare global {
  var SolanaConnection: Connection;
}
// (async () => {
//   window.SolanaConnection = new Connection("sdfs", { wsEndpoint: "" });
//   console.log(window.SolanaConnection);
// })();

//@ts-ignore
const connection = new window.solanaWeb3.Connection(
  //@ts-ignore

  solanaWeb3.clusterApiUrl("devnet")
);
window.SolanaConnection = connection;
