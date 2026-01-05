import {
  CalcNode,
  CalcNodeNumber,
  CalcNodeType,
} from "@/shared/libs/complexVariableFormula";

const isReal = (node: CalcNode): boolean => {
  return node.t === CalcNodeType.Number && node.im === 0;
};

const isZero = (node: CalcNode): boolean => {
  return node.t === CalcNodeType.Number && node.re === 0 && node.im === 0;
};

const isOne = (node: CalcNode): boolean => {
  return node.t === CalcNodeType.Number && node.re === 1 && node.im === 0;
};

const accumulateSum = (
  node: CalcNode,
  accumulatedNode: CalcNodeNumber,
  prevSign: string,
): CalcNode => {
  if (
    node.t !== CalcNodeType.Operation ||
    node.c[0].t !== CalcNodeType.Number ||
    (node.v !== "+" && node.v !== "-")
  ) {
    if (isZero(accumulatedNode)) {
      if (prevSign === "+") {
        return simplify(node);
      } else if (prevSign === "-") {
        return simplify({
          t: CalcNodeType.Operation,
          v: "*",
          c: [
            {
              t: CalcNodeType.Number,
              re: -1,
              im: 0,
              r: [0, 0],
            },
            simplify(node),
          ],
          r: [0, 0],
        });
      }
    }

    if (node.t === CalcNodeType.Number) {
      if (prevSign === "+") {
        accumulatedNode.re += node.re;
        accumulatedNode.im += node.im;
      } else if (prevSign === "-") {
        accumulatedNode.re -= node.re;
        accumulatedNode.im -= node.im;
      }
      return accumulatedNode;
    }

    return {
      t: CalcNodeType.Operation,
      v: prevSign,
      c: [accumulatedNode, simplify(node)],
      r: [0, 0],
    };
  }

  if (node.c[0].t === CalcNodeType.Number) {
    if (prevSign === "+") {
      accumulatedNode.re += node.c[0].re;
      accumulatedNode.im += node.c[0].im;
    } else if (prevSign === "-") {
      accumulatedNode.re -= node.c[0].re;
      accumulatedNode.im -= node.c[0].im;
    }
  }

  if (node.c[1].t === CalcNodeType.Number) {
    if (prevSign === "+") {
      accumulatedNode.re += node.c[1].re;
      accumulatedNode.im += node.c[1].im;
    } else if (prevSign === "-") {
      accumulatedNode.re -= node.c[1].re;
      accumulatedNode.im -= node.c[1].im;
    }

    return accumulatedNode;
  }

  return accumulateSum(node.c[1], accumulatedNode, node.v);
};

export const simplify = (node: CalcNode): CalcNode => {
  if (node.t === CalcNodeType.Operation) {
    if (node.v === "+") {
      let o1 = node.c[0];
      let o2 = node.c[1];

      if (o1.t !== CalcNodeType.Number) {
        o1 = simplify(o1);
      }

      if (o1.t === CalcNodeType.Number) {
        return accumulateSum(
          o2,
          {
            t: CalcNodeType.Number,
            r: [0, 0],
            re: o1.re,
            im: o1.im,
          },
          "+",
        );
      }

      o2 = simplify(o2);

      if (isZero(o2)) {
        return o1;
      }

      return {
        ...node,
        c: [o1, o2],
      };
    }

    if (node.v === "-") {
      let o1 = node.c[0];
      let o2 = node.c[1];

      if (o1.t !== CalcNodeType.Number) {
        o1 = simplify(o1);
      }

      // Simplify if at least one is a number (can be complex)
      if (o1.t === CalcNodeType.Number) {
        return accumulateSum(
          o2,
          {
            t: CalcNodeType.Number,
            r: [0, 0],
            re: o1.re,
            im: o1.im,
          },
          "-",
        );
      }

      o2 = simplify(o2);

      if (isZero(o1)) {
        if (o2.t === CalcNodeType.Number) {
          return {
            t: CalcNodeType.Number,
            r: [0, 0],
            re: -o2.re,
            im: -o2.im,
          };
        }

        return {
          t: CalcNodeType.Operation,
          v: "*",
          c: [
            {
              t: CalcNodeType.Number,
              re: -1,
              im: 0,
              r: [0, 0],
            },
            o2,
          ],
          r: [0, 0],
        };
      }

      if (isZero(o2)) {
        return o1;
      }

      return {
        ...node,
        c: [o1, o2],
      };
    }

    if (node.v === "*") {
      const o1 = simplify(node.c[0]);
      const o2 = simplify(node.c[1]);

      // Simplify if at least one is a number (can be complex)
      // Complex multiplication: (a+bi)(c+di) = (ac-bd) + (ad+bc)i
      if (o1.t === CalcNodeType.Number && o2.t === CalcNodeType.Number) {
        return {
          t: CalcNodeType.Number,
          r: [0, 0],
          re: o1.re * o2.re - o1.im * o2.im,
          im: o1.re * o2.im + o1.im * o2.re,
        };
      }

      if (isZero(o1) || isZero(o2)) {
        return {
          t: CalcNodeType.Number,
          r: [0, 0],
          re: 0,
          im: 0,
        };
      }

      if (isOne(o1)) {
        return o2;
      }

      if (isOne(o2)) {
        return o1;
      }

      return {
        ...node,
        c: [o1, o2],
      };
    }

    if (node.v === "/") {
      const o1 = simplify(node.c[0]);
      const o2 = simplify(node.c[1]);

      // Only simplify if divisor (second operand) is real
      if (
        o1.t === CalcNodeType.Number &&
        o2.t === CalcNodeType.Number &&
        isReal(o2)
      ) {
        return {
          t: CalcNodeType.Number,
          r: [0, 0],
          re: o1.re / o2.re,
          im: o1.im / o2.re,
        };
      }

      if (isZero(o1)) {
        return {
          t: CalcNodeType.Number,
          r: [0, 0],
          re: 0,
          im: 0,
        };
      }

      if (isOne(o2)) {
        return o1;
      }

      return {
        ...node,
        c: [o1, o2],
      };
    }

    if (node.v === "^") {
      const o1 = simplify(node.c[0]);
      const o2 = simplify(node.c[1]);

      // Only simplify if exponent (second operand) is real
      if (
        o1.t === CalcNodeType.Number &&
        o2.t === CalcNodeType.Number &&
        isReal(o2)
      ) {
        // For complex base and real exponent, this is a simplified case
        // Only handle when base is also real for now
        if (isReal(o1)) {
          return {
            t: CalcNodeType.Number,
            r: [0, 0],
            re: Math.pow(o1.re, o2.re),
            im: 0,
          };
        }
      }

      if (isZero(o2)) {
        return {
          t: CalcNodeType.Number,
          r: [0, 0],
          re: 1,
          im: 0,
        };
      }

      if (isOne(o2)) {
        return o1;
      }

      return {
        ...node,
        c: [o1, o2],
      };
    }
  }

  if (node.t === CalcNodeType.FuncCall) {
    const simplifiedArgs = node.o.map(simplify);
    return {
      ...node,
      o: simplifiedArgs,
    };
  }

  return node;
};
