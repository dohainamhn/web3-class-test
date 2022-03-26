import { Box, BoxProps, Button, ButtonProps, styled } from "@mui/material";
import { UnsupportedChainIdError, useWeb3React } from "@web3-react/core";
import { injected, walletConnect } from "../../connectors";
import MetamaskIcon from "assets/images/metamask.svg";
import WalletConnectIcon from "assets/images/walletConnect.svg";
import { setupNetwork } from "helpers/setupNetwork";
import { toast } from "react-toastify";
import { NoEthereumProviderError } from "@web3-react/injected-connector";
import { UserRejectedRequestError as UserRejectedRequestErrorInjected } from "@web3-react/injected-connector";
import {
  UserRejectedRequestError as UserRejectedRequestErrorWalletConnect,
  WalletConnectConnector,
} from "@web3-react/walletconnect-connector";

const LoginContainer = styled(Box)<BoxProps>(() => ({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  flexDirection: "column",
  gap: "100px",
  height: "100vh",
}));

const ConnectButton = styled(Button)<ButtonProps>(() => ({
  color: "#ffff",
  width: "350px",
  "& .MuiButton-endIcon": {
    width: "45px",
    height: "45px",
  },
  "& img": {
    width: "45px",
    height: "45px",
  },
  backgroundColor: "#666666",
  padding: "10px 40px",
  borderRadius: "5px",
  "&:hover": {
    backgroundColor: "#666666 !important",
  },
}));

export const enum WalletType {
  WALLETCONNECT = "walletConnect",
  METAMASK = "metamask",
}

export const Login = () => {
  const { activate } = useWeb3React();

  const handleConnect = async (walletType: WalletType) => {
    const connector =
      walletType === WalletType.METAMASK ? injected : walletConnect;
    try {
      activate(connector, async (error: Error) => {
        if (error instanceof UnsupportedChainIdError) {
          const provider = await connector.getProvider();
          const hasSetup = await setupNetwork(provider);
          if (hasSetup) {
            activate(connector);
          }
        } else {
          if (error instanceof NoEthereumProviderError) {
            toast("Provider Error", {
              type: "error",
              position: "top-center",
              autoClose: 1000,
            });
          } else if (
            error instanceof UserRejectedRequestErrorInjected ||
            error instanceof UserRejectedRequestErrorWalletConnect
          ) {
            if (connector instanceof WalletConnectConnector) {
              const walletConnector = connector as WalletConnectConnector;
              localStorage.removeItem("walletconnect");
              walletConnector.walletConnectProvider = undefined;
            }
            toast("Authorization Error", {
              type: "error",
              position: "top-center",
              autoClose: 1000,
            });
          } else {
            toast(error.message, {
              type: "error",
              position: "top-center",
              autoClose: 1000,
            });
          }
        }
      });
    } catch (error) {
      console.log("error", error);
    }
  };

  return (
    <LoginContainer>
      <ConnectButton
        onClick={() => {
          handleConnect(WalletType.METAMASK);
        }}
        endIcon={<img src={MetamaskIcon} />}
      >
        Connect to MetaMaska
      </ConnectButton>
      <ConnectButton
        onClick={() => {
          handleConnect(WalletType.WALLETCONNECT);
        }}
        endIcon={<img src={WalletConnectIcon} />}
      >
        Connect to WalletConnect
      </ConnectButton>
    </LoginContainer>
  );
};
