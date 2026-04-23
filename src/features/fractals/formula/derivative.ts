import {
  CalcNode,
  CalcNodeType,
  CustomDerivatives,
  StdFnNames,
  derivative as rawDerivative,
} from "@/shared/libs/complexVariableFormula";

export const fractalsStdFnNames: StdFnNames = {
  exp: "exp",
  ln: "PLog",
  sin: "sin",
  cos: "cos",
  tan: "tan",
  sinh: "sinh",
  cosh: "cosh",
  acos: "acos",
  asin: "asin",
};

const customDerivatives: CustomDerivatives = {
  z: (_derivative, node) => ({
    t: CalcNodeType.Variable,
    v: "dz",
    r: node.r,
  }),
  dz: (_derivative, node) => ({
    t: CalcNodeType.Variable,
    v: "dz",
    r: node.r,
  }),

  // I make an assumtion that there is no z in o[1].
  // If there were, it would be wrong derivative. For now I leave it like this
  rotate: (der, node, varName, ...rest) => {
    if (node.t === CalcNodeType.FuncCall) {
      return {
        t: CalcNodeType.FuncCall,
        n: "rotate",
        o: [der(node.o[0], varName, ...rest), node.o[1]],
        r: node.r,
      };
    }

    return node;
  },

  // These ones probably not complex differentiable
  // I just define some random derivatives to avoid errors
  // Maybe in future I can do proper research and do something better
  re: (_derivative, node) => ({
    t: CalcNodeType.Number,
    re: 1,
    im: 0,
    r: node.r,
  }),
  im: (_derivative, node) => ({
    t: CalcNodeType.Number,
    re: 0,
    im: 0,
    r: node.r,
  }),
  mirror: (_derivative, node) => ({
    t: CalcNodeType.Number,
    re: -1,
    im: 0,
    r: node.r,
  }),
  cmpl: (_derivative, node) => node,
  conjugate: (_derivative, node) => node,
};

export const derivative = (node: CalcNode): CalcNode => {
  return rawDerivative(node, "z", fractalsStdFnNames, customDerivatives);
};
