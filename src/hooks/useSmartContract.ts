import { useWeb3React } from "@web3-react/core";
import { dd2Abi } from "abis/DD2";
import { masterChefAbi } from "abis/masterChefAbi";
import BigNumber from "bignumber.js";
import { rpcUrl } from "connectors";
import {
  ContractCallContext,
  ContractCallResults,
  Multicall,
} from "ethereum-multicall";
import { ethers } from "ethers";

interface MultiCallItem {
  reference: string;
  methodName: string;
  methodParameters: any[];
}

export interface MultiCallList {
  reference: string;
  contractAddress: string;
  abi: any;
  calls: MultiCallItem[];
}
export const dd2Address = "0xb1745657CB84c370DD0Db200a626d06b28cc5872";
export const masterChefAddress = "0x9da687e88b0A807e57f1913bCD31D56c49C872c2";
export const WethAddress = "0xc778417E063141139Fce010982780140Aa0cD5Ab";
BigNumber.config({
  EXPONENTIAL_AT: 100,
});
const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
const dd2ContractWithoutSigner = new ethers.Contract(
  dd2Address,
  dd2Abi,
  provider
);
const wethContractWithoutSigner = new ethers.Contract(
  WethAddress,
  dd2Abi,
  provider
);
const masterChefContractWithoutSigner = new ethers.Contract(
  masterChefAddress,
  masterChefAbi,
  provider
);

export const useSmartContract = () => {
  const { library, account } = useWeb3React();

  const masterChefContractWithSigner = library
    ? new ethers.Contract(
        masterChefAddress,
        masterChefAbi,
        library.getSigner(account)
      )
    : masterChefContractWithoutSigner;
  const WethContractWithSigner = library
    ? new ethers.Contract(WethAddress, dd2Abi, library.getSigner(account))
    : wethContractWithoutSigner;

  const dd2ContractWithSigner = library
    ? new ethers.Contract(dd2Address, dd2Abi, library.getSigner(account))
    : dd2ContractWithoutSigner;

  const getNativeBalanceOf = async (address: string) => {
    const balance = await provider.getBalance(address);
    return balance;
  };

  const multipleCalls = async (params: MultiCallList[]) => {
    const multiCall = new Multicall({
      ethersProvider: provider,
      tryAggregate: true,
    });

    const contractCallContext: ContractCallContext<{
      extraContext: string;
      foo4: boolean;
    }>[] = params.map(({ reference, contractAddress, abi, calls }) => {
      return {
        reference,
        contractAddress,
        abi,
        calls,
      };
    });
    const results: ContractCallResults = await multiCall.call(
      contractCallContext
    );
    return results.results;
  };

  const getWETHBalance = async (address: string) => {
    return await wethContractWithoutSigner.balanceOf(address);
  };

  const isWETHApproved = async (address: string) => {
    const wethContract = new ethers.Contract(WethAddress, dd2Abi, provider);
    return await wethContract.allowance(address, masterChefAddress);
  };

  const approveWETH = async (amount: number) => {
    return await WethContractWithSigner.approve(
      masterChefAddress,
      new BigNumber(amount).multipliedBy(1e18).toString()
    );
  };

  const getDepositedAndReward = async (address: string) => {
    return await masterChefContractWithSigner.userInfo(address);
  };

  const getDD2TokenPending = async (address: string) => {
    return await masterChefContractWithSigner.pendingDD2(address);
  };
  const deposit = async (amount: number) => {
    return await masterChefContractWithSigner.deposit(
      new BigNumber(amount).multipliedBy(1e18).toString()
    );
  };

  const harvestEarnedToken = async () => {
    return await masterChefContractWithSigner.withdraw(0);
  };

  const handleWithdraw = async (amount: number) => {
    return await masterChefContractWithSigner.withdraw(
      new BigNumber(amount).multipliedBy(1e18).toString()
    );
  };

  return {
    getNativeBalanceOf,
    multipleCalls,
    isWETHApproved,
    approveWETH,
    getDepositedAndReward,
    deposit,
    getWETHBalance,
    getDD2TokenPending,
    masterChefContractWithSigner,
    masterChefContractWithoutSigner,
    provider,
    harvestEarnedToken,
    handleWithdraw,
  };
};
