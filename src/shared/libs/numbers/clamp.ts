export const clampToDecimal = (value: number, decimalScale: number) => {
  const factor = Math.pow(10, decimalScale);
  return Math.round(value * factor) / factor;
};
