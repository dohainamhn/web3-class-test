import { configs } from "config";
import { rpcUrl } from "connectors";
import { toast } from "react-toastify";

export const setupNetwork = async (externalProvider?: any) => {
  const provider = externalProvider || (window as any).ethereum;
  const chainId = configs.chainId;
  if (provider) {
    try {
      await provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      });
      return true;
    } catch (switchError) {
      if ((switchError as any)?.code === 4902) {
        try {
          await provider.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: `0x${chainId.toString(16)}`,
                chainName: chainId,
                nativeCurrency: {
                  name: "rinkeby",
                  symbol: "ETH",
                  decimals: 18,
                },
                rpcUrls: rpcUrl,
                blockExplorerUrls: [`https://rinkeby.etherscan.io/`],
              },
            ],
          });
          return true;
        } catch (error) {
          toast("Failed to setup the network", {
            type: "error",
            position: "top-center",
          });
          return false;
        }
      }
      return false;
    }
  } else {
    return false;
  }
};
