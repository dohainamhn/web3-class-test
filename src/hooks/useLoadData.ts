import { useWeb3React } from "@web3-react/core";
import { dd2Abi } from "abis/DD2";
import { masterChefAbi } from "abis/masterChefAbi";
import { convertMultiCallData } from "helpers/convertMultiCallData";
import { SetStateAction, useEffect, useState } from "react";
import get from "lodash/get";
import {
  masterChefAddress,
  useSmartContract,
  WethAddress,
} from "./useSmartContract";
import BigNumber from "bignumber.js";

interface Params {
  setWETHBalance: (value: SetStateAction<string>) => void;
  setDepositedWETHBalance: (value: SetStateAction<string>) => void;
  setTokenEarn: (value: SetStateAction<string>) => void;
  setApprove: (value: SetStateAction<boolean>) => void;
  setHistories: (value: SetStateAction<any>) => void;
  setTotalTokenStaked: (value: SetStateAction<string>) => void;
}

export const useLoadData = ({
  setWETHBalance,
  setDepositedWETHBalance,
  setTokenEarn,
  setApprove,
  setHistories,
  setTotalTokenStaked,
}: Params) => {
  const [loading, setLoading] = useState(false);
  const { account } = useWeb3React();
  const { multipleCalls } = useSmartContract();
  const handleLoadData = async () => {
    setLoading(true);
    try {
      const result = await multipleCalls([
        {
          reference: "wethSC",
          contractAddress: WethAddress,
          abi: dd2Abi,
          calls: [
            {
              reference: "balance",
              methodName: "balanceOf",
              methodParameters: [account],
            },
            {
              reference: "allowance",
              methodName: "allowance",
              methodParameters: [account, masterChefAddress],
            },
          ],
        },
        {
          reference: "masterChefSC",
          contractAddress: masterChefAddress,
          abi: masterChefAbi,
          calls: [
            {
              reference: "getDD2Reward",
              methodName: "pendingDD2",
              methodParameters: [account],
            },
            {
              reference: "getDepositBalance",
              methodName: "userInfo",
              methodParameters: [account],
            },
          ],
        },
      ]);
      const data = convertMultiCallData(result);
      setWETHBalance(
        data.wethSCData.filter((item: any) => item.method === "balanceOf")[0]
          .values[0]
      );
      setApprove(
        data.wethSCData.filter((item: any) => item.method === "allowance")[0]
          .values[0] > 0
      );
      setTokenEarn(
        data.masterChefSCData.filter(
          (item: any) => item.method === "pendingDD2"
        )[0].values[0]
      );
      setDepositedWETHBalance(
        data.masterChefSCData.filter(
          (item: any) => item.method === "userInfo"
        )[0].values[0]
      );
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  };
  const handleLoadDataFromGraph = async (_account: string) => {
    try {
      const rawData = await fetch(
        "https://api.thegraph.com/subgraphs/id/QmUeW81F6vCytYtZP25hQM3823TXcdP7Rh9opvXETF9KkM",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: `
              query getHistoriesData ($userId: ID!, $first: Int!, $skip: Int!) {
               totalStaked (
                id: "totalStake"
               )
               {
                 amount,
                 userCount,
               }
             user(
              id: $userId
              )
               {
                 historiesCount
               }
             histories (
                 first: $first,
                 skip: $skip,
                 orderBy: date,
                 orderDirection: desc,
                 where: {
                   user: $userId
                 }
               ){
                 user,
                 action,
                 amount,
                 date
               }
             }
            
           `,
            variables: {
              userId: _account.toLocaleLowerCase(),
              first: 100,
              skip: 0,
            },
          }),
        }
      );
      const data = await rawData.json();
      setHistories(get(data, "data.histories", []));
      setTotalTokenStaked(
        new BigNumber(get(data, "data.totalStaked.amount", "0"))
          .div(1e18)
          .toFixed(4)
          .toString()
      );
      return data.data;
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timer;
    if (account) {
      interval = setInterval(() => {
        handleLoadDataFromGraph(account);
        handleLoadData();
      }, 5000);
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [account]);

  return {
    handleLoadData,
    handleLoadDataFromGraph,
  };
};
