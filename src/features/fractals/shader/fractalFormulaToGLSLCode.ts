import {
  CalcNode,
  CalcNodeType,
  simplify,
} from "@/shared/libs/complexVariableFormula";
import {
  parseFormula,
  validateFormula,
} from "@/shared/libs/complexVariableFormula/parseFormula";
import { VarNameToTypeMap } from "../formula/fnAndVarDescr";

export const fractalFormulaToGLSLCode = (
  formula: string,
  vars: VarNameToTypeMap,
  customVars: VarNameToTypeMap = {},
  parseFormulaFn = parseFormula,
) => {
  let node: CalcNode | null;
  try {
    node = parseFormulaFn(formula);
    node = simplify(node);
  } catch (e) {
    throw new Error("fractalFormulaToGLSLCode: failed to parse formula " + e);
  }

  if (!node) {
    throw new Error("fractalFormulaToGLSLCode: failed to parse formula");
  }
  const [valid, msg] = validateFormula(
    node,
    new Set([...Object.keys(customVars ?? {}), ...Object.keys(vars)]),
  );

  if (!valid) {
    throw new Error('fractalFormulaToGLSLCode: invalid formula "' + msg + '"');
  }

  const pow = getMaxZPower(node) || 0;

  const res = transformToGLSLCode(
    node,
    {
      ...vars,
      ...customVars,
    },
    (varName: string) => {
      if (customVars[varName]) {
        return `u_cstm_${varName}`;
      }
      return varName;
    },
  );

  return [res, pow] as const;
};

const getMaxZPower = (node: CalcNode): number | null => {
  switch (node.t) {
    case CalcNodeType.Number:
      return 0;
    case CalcNodeType.Variable:
      if (node.v === "z") {
        return 1;
      } else {
        return 0;
      }
    case CalcNodeType.Operation: {
      if (node.v === "^") {
        const base = node.c[0];
        const exponent = node.c[1];
        if (
          base.t === CalcNodeType.Variable &&
          base.v === "z" &&
          exponent.t === CalcNodeType.Number
        ) {
          return exponent.re;
        }
      }
      const leftPower = getMaxZPower(node.c[0]);
      const rightPower = getMaxZPower(node.c[1]);
      if (leftPower === null || rightPower === null) {
        return null;
      }
      if (node.v === "+" || node.v === "-") {
        return Math.max(leftPower, rightPower);
      } else if (node.v === "*") {
        return leftPower + rightPower;
      } else if (node.v === "/") {
        return leftPower - rightPower;
      }
      return null;
    }
    case CalcNodeType.FuncCall: {
      let maxPower = 0;
      for (const arg of node.o) {
        const argPower = getMaxZPower(arg);
        if (argPower === null) {
          return null;
        }
        if (argPower > maxPower) {
          maxPower = argPower;
        }
      }
      return maxPower > 0 ? 1 : 0;
    }
    case CalcNodeType.Error:
      return null;
  }
};

const transformToGLSLCode = (
  node: CalcNode,
  map: VarNameToTypeMap,
  variableTransform = (varName: string) => varName,
): string => {
  switch (node.t) {
    case CalcNodeType.Number: {
      const im = String(node.im).includes(".")
        ? String(node.im)
        : `${String(node.im)}.0`;
      const re = String(node.re).includes(".")
        ? String(node.re)
        : `${String(node.re)}.0`;

      return `vec2(${re}, ${im})`;
    }
    case CalcNodeType.Variable:
      if (map[node.v] === "number") {
        return `vec2(${variableTransform(node.v)}, 0.0)`;
      }

      return `${variableTransform(node.v)}`;
    case CalcNodeType.Operation: {
      if (node.v !== "^") {
        return `${operationToFnMap[node.v]}(${transformToGLSLCode(
          node.c[0],
          map,
          variableTransform,
        )}, ${transformToGLSLCode(node.c[1], map, variableTransform)})`;
      } else {
        return `${operationToFnMap[node.v]}(${transformToGLSLCode(
          node.c[0],
          map,
          variableTransform,
        )}, ${transformToGLSLCode(node.c[1], map, variableTransform)}.x)`;
      }
    }
    case CalcNodeType.FuncCall:
      return `${fnNameToFnMap[node.n]}(${node.o
        .map((n) => transformToGLSLCode(n, map, variableTransform))
        .join(", ")})`;
    case CalcNodeType.Error:
      throw new Error("CalcNodeError met during GLSL code generation");
  }
};

const operationToFnMap: Record<string, string> = {
  "+": "complexAdd",
  "-": "complexSub",
  "*": "complexMul",
  "/": "complexDiv",
  "^": "complexPow",
};

const fnNameToFnMap: Record<string, string> = {
  PLog: "complexPLog",
  im: "im",
  re: "re",
  cmpl: "cmpl",
  sin: "complexSin",
  sinh: "complexSinh",
  rotate: "complexRotate",
  mirror: "complexMirror",
  conjugate: "complexConjugate",
  cos: "complexCos",
  cosh: "complexCosh",
  acos: "complexAcos",
  asin: "complexAsin",
  exp: "complexExp",
  tan: "complexTan",
  abs: "abs",
};
