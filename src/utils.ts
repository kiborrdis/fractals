// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const throttle = <P extends any[]>(func: (...args: P) => void, delay: number): (...args: P) => void  => {
  let lastCall = 0;
  return function (...args: P) {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      return func(...args);
    }
  };
}

export const clampToDecimal = (value: number, decimalScale: number) => {
  const factor = Math.pow(10, decimalScale);
  return Math.round(value * factor) / factor;
};
