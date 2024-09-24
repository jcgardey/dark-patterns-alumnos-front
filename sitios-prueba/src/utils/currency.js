export const formatCurrency = (number) => {
  const formatting_options = {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  };
  return new Intl.NumberFormat('en-US', formatting_options).format(number);
};
