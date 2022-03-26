import LoadingButton, { LoadingButtonProps } from "@mui/lab/LoadingButton";
import {
  Dialog,
  DialogContent,
  DialogContentProps,
  DialogProps,
  DialogTitle,
  DialogTitleProps,
  styled,
  Typography,
  TypographyProps,
  TextField,
  TextFieldProps,
} from "@mui/material";
import { ModalIds } from "components/Home";
import { useState } from "react";

const ModalBody = styled(Dialog)<DialogProps>(() => ({
  "& .MuiPaper-root": {
    padding: "20px 20px 0px 20px",
    borderRadius: "10px",
    width: "100%",
    maxWidth: "600px",
    minWidth: "fit-content",
  },
}));

const Header = styled(DialogTitle)<DialogTitleProps>(() => ({}));

const Title = styled(Typography)<TypographyProps>(() => ({}));

const Body = styled(DialogContent)<DialogContentProps>(() => ({
  marginTop: "40px",
  width: "100%",
  display: "flex",
  alignItems: "center",
  flexDirection: "column",
}));

const Text = styled(Typography)<TypographyProps>(() => ({
  marginTop: "30px",
}));
const Input = styled(TextField)<TextFieldProps>(() => ({
  width: "70%",
}));
const Btn = styled(LoadingButton)<LoadingButtonProps>(() => ({
  textTransform: "capitalize",
  padding: "10px",
  minWidth: "100px",
  backgroundColor: "#666666",
  color: "#ffff",
  "&:hover": {
    backgroundColor: "#666666 !important",
  },
  marginTop: "30px",
  "& .MuiLoadingButton-loadingIndicator": {
    color: "#ffff",
  },
}));
interface Props {
  open: boolean;
  close: () => void;
  selectedModal: ModalIds;
  balance: string;
  onSubmit: (value: number) => void;
  loading: boolean;
}

export const Modal = ({
  open,
  close,
  selectedModal,
  balance,
  onSubmit,
  loading,
}: Props) => {
  const [inputBalance, setInputBalance] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    if (value === "") {
      setErrorMessage("Please enter valid amount");
    } else {
      setErrorMessage("");
    }
    setInputBalance(value);
  };
  return (
    <ModalBody
      onClose={() => {
        close();
      }}
      open={open}
    >
      <Header>
        <Title>
          {selectedModal === ModalIds.DEPOSIT ? "Stake" : "Withdraw"}
        </Title>
      </Header>
      <Body>
        <Input
          placeholder="Enter your amount"
          helperText={errorMessage}
          error={errorMessage !== ""}
          value={inputBalance}
          type={"number"}
          onChange={handleChange}
        />
        <Text>
          Your WETH{" "}
          {selectedModal === ModalIds.DEPOSIT ? "balance" : "deposited"}:{" "}
          {balance} WETH
        </Text>
        <Btn
          loading={loading}
          onClick={() => {
            if (errorMessage === "" && inputBalance !== "") {
              onSubmit(Number(inputBalance));
            }
          }}
        >
          {selectedModal === ModalIds.DEPOSIT ? "Stake" : "Withdraw"}
        </Btn>
      </Body>
    </ModalBody>
  );
};
