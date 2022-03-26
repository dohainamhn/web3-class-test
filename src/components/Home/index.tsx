import {
  Box,
  BoxProps,
  Button,
  ButtonProps,
  styled,
  Typography,
} from "@mui/material";
import { TypographyProps } from "@mui/system";
import { useWeb3React } from "@web3-react/core";
import BigNumber from "bignumber.js";
import { Modal } from "components/Modal";
import { TableComponent } from "components/Table";
import { convertWalletAddress } from "helpers/convertWalletAddress";
import { truncateNumber } from "helpers/truncateNumber";
import { useLoadData } from "hooks/useLoadData";
import { useSmartContract } from "hooks/useSmartContract";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

const HomeContainer = styled(Box)<BoxProps>(() => ({
  width: "1000px",
  height: "50vh",
}));
const Wrapper = styled(Box)<BoxProps>(() => ({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  width: "100%",
  height: "100vh",
}));

const Header = styled(Box)<BoxProps>(() => ({
  width: "100%",
  display: "flex",
  justifyContent: "space-around",
}));

const Body = styled(Box)<BoxProps>(() => ({}));
const BodyTop = styled(Box)<BoxProps>(() => ({
  marginTop: "40px",
  width: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-around",
}));
const BodyActions = styled(Box)<BoxProps>(() => ({
  width: "100%",
  display: "flex",
  justifyContent: "space-around",
  marginTop: "50px",
}));
const BodyBottom = styled(Box)<BoxProps>(() => ({
  display: "flex",
  justifyContent: "space-around",
  marginTop: "30px",
}));
const Text = styled(Typography)<TypographyProps>(() => ({
  fontSize: "20px",
}));
const HarvestBtn = styled(Button)<ButtonProps>(() => ({
  backgroundColor: "#666666",
  color: "#ffff",
  "&:hover": {
    backgroundColor: "#666666 !important",
  },
}));
const Btn = styled(Button)<ButtonProps>(() => ({
  backgroundColor: "#666666",
  width: "25%",
  height: "45px",
  color: "#ffff",
  "&:hover": {
    backgroundColor: "#666666 !important",
  },
}));
const EmptyBox = styled(Box)<BoxProps>(() => ({
  width: "24%",
}));

export enum ModalIds {
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw",
}

export const Home = () => {
  const [balance, setBalance] = useState("");
  const [depositedWETHBalance, setDepositedWETHBalance] = useState("");
  const [tokenEarn, setTokenEarn] = useState("");
  const [approve, setApprove] = useState(false);
  const [histories, setHistories] = useState([]);
  const [totalTokenStaked, setTotalTokenStaked] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedModal, setSelectedModal] = useState<ModalIds>(
    ModalIds.DEPOSIT
  );
  const { account } = useWeb3React();
  const { handleLoadData, handleLoadDataFromGraph } = useLoadData({
    setDepositedWETHBalance,
    setWETHBalance: setBalance,
    setApprove,
    setTokenEarn,
    setHistories,
    setTotalTokenStaked,
  });
  const {
    isWETHApproved,
    approveWETH,
    getDepositedAndReward,
    deposit,
    getWETHBalance,
    getDD2TokenPending,
    harvestEarnedToken,
    handleWithdraw,
  } = useSmartContract();
  useEffect(() => {
    if (account) {
      // get WETH balance
      getWETHBalance(account).then((rawBalance) => {
        const balance = new BigNumber(rawBalance._hex).div(1e18).toNumber();
        setBalance(truncateNumber(String(balance), 4));
      });
      // get staked token
      getDepositedAndReward(account).then(({ amount }) => {
        // const tokenReward = new BigNumber(rewardDebt._hex).div(1e18).toNumber();
        const depositBalance = new BigNumber(amount._hex).div(1e18).toNumber();
        // setTokenEarn(truncateNumber(String(tokenReward),2));
        setDepositedWETHBalance(truncateNumber(String(depositBalance), 4));
      });
      //get token earned
      getDD2TokenPending(account).then((amount) => {
        const tokenReward = new BigNumber(amount._hex).div(1e18).toNumber();
        setTokenEarn(truncateNumber(String(tokenReward), 4));
      });
      // check Approvea
      isWETHApproved(account).then((response) => {
        const allowedAmount = new BigNumber(response._hex).div(1e18).toNumber();
        if (allowedAmount > 0) {
          setApprove(true);
        } else {
          setApprove(false);
        }
      });
      handleLoadDataFromGraph(account);
    }
  }, [account]);

  const handleDeposit = async (value: number) => {
    const id = toast.loading("Loading...", {
      position: "top-center",
    });
    try {
      setLoading(true);
      const transaction = await deposit(value);
      if (transaction.hash) {
        await transaction.wait();
      }
      setModalOpen(false);
      toast.update(id, {
        render: "successfully",
        type: "success",
        isLoading: false,
        autoClose: 1000,
      });
      handleLoadData();
      handleLoadDataFromGraph(account!);
    } catch (error: any) {
      toast.dismiss(id);
      setLoading(false);
      toast("insufficient balance", {
        type: "error",
        position: "top-center",
        autoClose: 1000,
      });
    }
    setLoading(false);
  };

  const handleWithDraw = async (value: number) => {
    const id = toast.loading("Loading...", {
      position: "top-center",
    });
    try {
      setLoading(true);
      const transaction = await handleWithdraw(value);
      if (transaction.hash) {
        await transaction.wait();
      }
      setModalOpen(false);
      toast.update(id, {
        render: "successfully",
        type: "success",
        isLoading: false,
        autoClose: 1000,
      });
      handleLoadData();
      handleLoadDataFromGraph(account!);
    } catch (error: any) {
      toast.dismiss(id);
      setLoading(false);
      toast("insufficient balance", {
        type: "error",
        position: "top-center",
        autoClose: 1000,
      });
    }
    setLoading(false);
  };
  const handleHarvest = async () => {
    const id = toast.loading("Loading...", {
      position: "top-center",
    });
    try {
      const transaction = await harvestEarnedToken();
      if (transaction.hash) {
        await transaction.wait();
        toast.update(id, {
          render: "successfully",
          type: "success",
          isLoading: false,
          autoClose: 1000,
        });
        handleLoadData();
        handleLoadDataFromGraph(account!);
      }
    } catch (error: any) {
      toast.dismiss(id);
      toast(error.message, {
        type: "error",
        position: "top-center",
        autoClose: 1000,
      });
    }
  };

  const handleApprove = async () => {
    if (Number(balance) > 0) {
      const id = toast.loading("Loading...", {
        position: "top-center",
      });
      try {
        const transaction = await approveWETH(Number(balance));
        if (transaction.hash) {
          await transaction.wait();
          toast.update(id, {
            render: "successfully",
            type: "success",
            isLoading: false,
            autoClose: 1000,
          });
        }
        handleLoadData();
        handleLoadDataFromGraph(account!);
      } catch (error: any) {
        toast.dismiss(id);
        toast(error.message, {
          type: "error",
          position: "top-center",
          autoClose: 1000,
        });
      }
    } else {
      toast("Insufficient funds", {
        type: "error",
        position: "top-center",
        autoClose: 1000,
      });
    }
  };

  return (
    <Wrapper>
      <HomeContainer>
        <Header>
          <Text>
            Wallet address:{" "}
            <span
              style={{
                color: "#4fab0ac7",
              }}
            >
              {convertWalletAddress(account)}
            </span>
          </Text>
          <Text>
            Balance:{" "}
            <span
              style={{
                color: "rgb(255 84 0 / 78%)",
              }}
            >
              {balance}
            </span>{" "}
            WETH{" "}
          </Text>
        </Header>
        <Body>
          <BodyTop>
            <Text>
              Token Earn:{" "}
              <span
                style={{
                  color: "rgb(255 84 0 / 78%)",
                }}
              >
                {tokenEarn}
              </span>{" "}
              DD2
            </Text>
            <div
              style={{
                minWidth: "15%",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <HarvestBtn onClick={handleHarvest}>Harvest</HarvestBtn>
            </div>
          </BodyTop>
          <BodyActions>
            {approve ? (
              <>
                <Btn
                  onClick={() => {
                    setModalOpen(true);
                    setSelectedModal(ModalIds.DEPOSIT);
                  }}
                >
                  Deposit
                </Btn>
                <Btn
                  onClick={() => {
                    setModalOpen(true);
                    setSelectedModal(ModalIds.WITHDRAW);
                  }}
                >
                  WithDraw
                </Btn>
              </>
            ) : (
              <Btn
                onClick={() => {
                  handleApprove();
                }}
              >
                Approve
              </Btn>
            )}
          </BodyActions>
          <BodyBottom>
            <div>
              <Text>Your stake: {depositedWETHBalance} WETH</Text>
              <Text
                style={{
                  marginTop: "20px",
                }}
              >
                Total stake:{totalTokenStaked} WETH
              </Text>
            </div>
            <EmptyBox />
          </BodyBottom>
        </Body>
        <TableComponent data={histories} />
      </HomeContainer>
      <Modal
        loading={loading}
        selectedModal={selectedModal}
        balance={
          selectedModal === ModalIds.DEPOSIT ? balance : depositedWETHBalance
        }
        close={() => {
          setModalOpen(false);
        }}
        open={modalOpen}
        onSubmit={
          selectedModal === ModalIds.DEPOSIT ? handleDeposit : handleWithDraw
        }
      />
    </Wrapper>
  );
};
