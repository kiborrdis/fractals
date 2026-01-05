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
};

const customDerivatives: CustomDerivatives = {
  z: (node) => ({
    t: CalcNodeType.Variable,
    v: "dz",
    r: node.r,
  }),
  dz: (node) => ({
    t: CalcNodeType.Variable,
    v: "dz",
    r: node.r,
  }),

  // These ones probably not complex differentiable
  // I just define some random derivatives to avoid errors
  // Maybe in future I can do proper research and do something better
  re: (node) => ({
    t: CalcNodeType.Number,
    re: 1,
    im: 0,
    r: node.r,
  }),
  im: (node) => ({
    t: CalcNodeType.Number,
    re: 0,
    im: 0,
    r: node.r,
  }),
  mirror: (node) => ({
    t: CalcNodeType.Number,
    re: -1,
    im: 0,
    r: node.r,
  }),
  cmpl: (node) => node,
  rotate: (node) => node,
};

export const derivative = (node: CalcNode): CalcNode => {
  return rawDerivative(node, "z", fractalsStdFnNames, customDerivatives);
};
