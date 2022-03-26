export const convertWalletAddress = (address?: string | null) => {
  return address
    ? address.slice(0, 3) +
        "..." +
        address.slice(address.length - 3, address.length)
    : "";
};
