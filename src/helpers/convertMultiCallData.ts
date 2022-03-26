import BigNumber from "bignumber.js";
import { truncateNumber } from "./truncateNumber";

export const convertMultiCallData = (data: any) => {
  const masterChefSCData = data.masterChefSC.callsReturnContext.map(
    (item: any) => {
      return {
        method: item.methodName,
        values: item.returnValues.map((amount: any) => {
          const result = new BigNumber(amount.hex).div(1e18).toNumber();
          return truncateNumber(String(result), 4);
        }),
      };
    }
  );
  let wethSCData = data.wethSC.callsReturnContext.map((item: any) => {
    return {
      method: item.methodName,
      values: item.returnValues.map((amount: any) => {
        const result = new BigNumber(amount.hex).div(1e18).toNumber();
        return truncateNumber(String(result), 4);
      }),
    };
  });
  return {
    masterChefSCData,
    wethSCData,
  };
};
