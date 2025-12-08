import {
  CalcNode,
  CalcNodeType,
  forEachNodeChild,
} from "@/shared/libs/calcGraph";
import { parseFormula, validateFormula } from "../formula/parseFormula";
import { calcTypesOfNodes } from "../formula/trackTypes";
import { CalcNodeResultTypeMap } from "../formula/types";
import { VarNameToTypeMap } from "../formula/fnAndVarDescr";

export const fractalFormulaToGLSLCode = (
  formula: string,
  vars: VarNameToTypeMap,
  customVars: VarNameToTypeMap = {},
) => {
  let node: CalcNode | null;
  try {
    node = parseFormula(formula);
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

  const typeMap = calcTypesOfNodes(node, { ...vars, ...customVars });
  const pow = getMaxZPower(node) || 0;

  if (typeMap.get(node) !== "vector2") {
    throw new Error(
      'fractalFormulaToGLSLCode: invalid result type of formula, must be "vector2", got "' +
        typeMap.get(node) +
        '"',
    );
  }
  let allNodesWithTypes = true;

  forEachNodeChild(node, (n) => {
    allNodesWithTypes = typeMap.has(n) && allNodesWithTypes;
  });

  if (!allNodesWithTypes) {
    throw new Error(
      'fractalFormulaToGLSLCode: types for some nodes have not been calculated"',
    );
  }
  const res = transformToGLSLCode(node, typeMap, (varName: string) => {
    if (customVars[varName]) {
      return `u_cstm_${varName}`;
    }
    return varName;
  });
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
          return exponent.v;
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
  map: CalcNodeResultTypeMap,
  variableTransform = (varName: string) => varName,
): string => {
  switch (node.t) {
    case CalcNodeType.Number:
      return String(node.v).includes(".")
        ? String(node.v)
        : `${String(node.v)}.0`;
    case CalcNodeType.Variable:
      return `${variableTransform(node.v)}`;
    case CalcNodeType.Operation: {
      const leftT = map.get(node.c[0])!;
      const rightT = map.get(node.c[1])!;

      if (
        (leftT === "vector2" && rightT === "vector2") ||
        (node.v === "^" && leftT === "vector2")
      ) {
        return `${operationToFnMap[node.v]}(${transformToGLSLCode(
          node.c[0],
          map,
          variableTransform,
        )}, ${transformToGLSLCode(node.c[1], map, variableTransform)})`;
      }

      if (node.v === "^") {
        return `pow(${transformToGLSLCode(
          node.c[0],
          map,
          variableTransform,
        )}, ${transformToGLSLCode(node.c[1], map, variableTransform)})`;
      }

      return `(${transformToGLSLCode(node.c[0], map, variableTransform)}${
        node.v
      }${transformToGLSLCode(node.c[1], map, variableTransform)})`;
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
};
