export * from "./clamp";

export const lowestCommonMultiple = (a: number, b: number): number => {
  const gcd = (x: number, y: number): number => {
    while (y) {
      [x, y] = [y, x % y];
    }
    return x;
  };
  return (a * b) / gcd(a, b);
};
