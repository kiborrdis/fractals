const zPow = (): string => {
  let pow = Math.floor(Math.random() * 3) + 1;

  if (pow <= 3) {
    pow = pow * (Math.random() < 0.5 ? 1 : -1);
  }

  return `z^${pow}*${multiplier()}`;
};

const multiplier = (): string => {
  let multiplierReal = 1;
  let multiplierImag = 0;

  const rangeSize = 5;

  if (Math.random() > 0.5) {
    multiplierReal = Math.random() * rangeSize - rangeSize / 2;
  }

  if (Math.random() > 0.5) {
    multiplierImag = Math.random() * rangeSize - rangeSize / 2;
  }
  return `(${multiplierReal.toFixed(2)}${multiplierImag ? ` + ${multiplierImag.toFixed(2)}i` : ""})`;
};

export const generateRandomFormula = (): string => {
  const funcs = ["sin", "cos", "sinh", "cosh", "PLog", "exp"];
  const ops = ["+", "-"];
  const parts: string[] = [];

  const funcAllowed = Math.random() < 0.5;

  const numOfParts = Math.round(Math.random() * (funcAllowed ? 0.7 : 1)) + 2;

  for (let i = 0; i < numOfParts; i++) {
    const useFunc = funcAllowed ? Math.random() < 0.5 : false;

    if (useFunc) {
      const func = funcs[Math.floor(Math.random() * funcs.length)];
      parts.push(`${func}(${zPow()})*${multiplier()}`);
    } else {
      parts.push(zPow());
    }
  }

  return (
    parts.reduce((acc, part, index) => {
      if (index === 0) {
        return part;
      } else {
        const op = ops[Math.floor(Math.random() * ops.length)];
        return `${acc} ${op} ${part}`;
      }
    }, "") + "+c"
  );
};
