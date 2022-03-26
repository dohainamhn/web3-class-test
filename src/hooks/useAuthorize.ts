import { useWeb3React } from "@web3-react/core";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const useAuthorize = () => {
  const { account } = useWeb3React();
  const navigate = useNavigate();
  useEffect(() => {
    if (!account) {
      navigate("/login");
    } else {
      navigate("/");
    }
  }, [account]);
};
