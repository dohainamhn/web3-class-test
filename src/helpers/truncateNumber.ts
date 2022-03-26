export const truncateNumber = (value: string, numberAfterPeriod = 2) => {
  const splitValue = value.split(".");
  if (splitValue.length > 1) {
    const result =
      splitValue[0] + "." + splitValue[1].slice(0, numberAfterPeriod);
    return Number(result)
      .toLocaleString("en-US", {
        maximumFractionDigits: numberAfterPeriod,
        minimumFractionDigits: numberAfterPeriod,
      })
      .toString();
  }
  return value;
};
