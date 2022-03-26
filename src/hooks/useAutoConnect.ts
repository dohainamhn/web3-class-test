import { useWeb3React } from "@web3-react/core";
import { useEffect } from "react";
import { injected } from "../connectors";

export const useAutoConnect = () => {
  const { activate, account } = useWeb3React();
  useEffect(() => {
    injected.isAuthorized().then((authorize) => {
      if (authorize) {
        activate(injected, undefined, true);
      }
    });
  }, []);
};
