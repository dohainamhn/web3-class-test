import { InjectedConnector } from "@web3-react/injected-connector";
import { WalletConnectConnector } from "@web3-react/walletconnect-connector";

export const injected = new InjectedConnector({ supportedChainIds: [4] });
export const rpcUrl =
  "https://rinkeby.infura.io/v3/3a8742e05a97452dac21c904f59270cd";
export const walletConnect = new WalletConnectConnector({
  rpc: {
    4: rpcUrl,
  },
  supportedChainIds: [4],
  qrcode: true,
});
