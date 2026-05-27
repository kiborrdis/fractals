import {
  CalcNode,
  CalcNodeType,
  calcTypesOfNodes,
  funcNameToSignature,
  simplify,
} from "@/shared/libs/complexVariableFormula";
import {
  parseFormula,
  validateFormula,
} from "@/shared/libs/complexVariableFormula/parseFormula";
import { VarNameToTypeMap } from "../formula/fnAndVarDescr";
import { FractalFormulaError } from "../errors";

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
    throw new FractalFormulaError(
      "fractalFormulaToGLSLCode: failed to parse formula " + e,
    );
  }

  if (!node) {
    throw new FractalFormulaError(
      "fractalFormulaToGLSLCode: failed to parse formula",
    );
  }
  const [valid, msg] = validateFormula(
    node,
    new Set([...Object.keys(customVars ?? {}), ...Object.keys(vars)]),
  );

  const types = calcTypesOfNodes(node, { ...vars, ...customVars });

  if (!valid) {
    throw new FractalFormulaError(
      'fractalFormulaToGLSLCode: invalid formula "' + msg + '"',
    );
  }

  const pow = getMaxZPower(node) || 0;

  const res = transformToGLSLCode(node, {
    map: {
      ...vars,
      ...customVars,
    },
    nodeTypeMap: types,
    variableTransform: (varName: string) => {
      if (customVars[varName]) {
        return `u_cstm_${varName}`;
      }
      return varName;
    },
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

const identity = <T>(x: T) => x;
const transformToGLSLCode = (
  node: CalcNode,
  context: {
    map: VarNameToTypeMap;
    nodeTypeMap: Map<CalcNode, "number" | "vector2" | "error">;
    variableTransform?: (varName: string) => string;
  },
): string => {
  const { nodeTypeMap, variableTransform = identity } = context;

  switch (node.t) {
    case CalcNodeType.Number: {
      if (nodeTypeMap.get(node) === "number") {
        return toGlslFloat(node.re);
      }

      const im = toGlslFloat(node.im);
      const re = toGlslFloat(node.re);

      return `vec2(${re}, ${im})`;
    }
    case CalcNodeType.Variable:
      return `${variableTransform(node.v)}`;
    case CalcNodeType.Operation: {
      if (node.v !== "^") {
        const arg1Type = nodeTypeMap.get(node.c[0]);
        const arg2Type = nodeTypeMap.get(node.c[1]);

        const arg1 = matchType(
          transformToGLSLCode(node.c[0], context),
          nodeTypeMap.get(node.c[0]),
          nodeTypeMap.get(node),
        );

        const arg2 = matchType(
          transformToGLSLCode(node.c[1], context),
          nodeTypeMap.get(node.c[1]),
          nodeTypeMap.get(node),
        );

        if (arg1Type === "number" && arg2Type === "number") {
          return `(${arg1} ${node.v} ${arg2})`;
        }

        return `${operationToFnMap[node.v]}(${arg1}, ${arg2})`;
      } else {
        const arg1Type = nodeTypeMap.get(node.c[0]);
        const arg2Type = nodeTypeMap.get(node.c[1]);

        if (arg1Type === "number" && arg2Type === "number") {
          const arg1 = transformToGLSLCode(node.c[0], context);
          const arg2 = transformToGLSLCode(node.c[1], context);
          return `pow(${arg1}, ${arg2})`;
        }

        const arg1 = matchType(
          transformToGLSLCode(node.c[0], context),
          arg1Type,
          nodeTypeMap.get(node),
        );

        if (node.c[1].t === CalcNodeType.Number && node.c[1].im === 0) {
          const arg2 = matchType(
            transformToGLSLCode(node.c[1], context),
            nodeTypeMap.get(node.c[1]),
            "number",
          );
          return `complexRealPow(${arg1}, ${arg2})`;
        }

        const arg2 = matchType(
          transformToGLSLCode(node.c[1], context),
          arg2Type,
          nodeTypeMap.get(node),
        );

        return `${operationToFnMap[node.v]}(${arg1}, ${arg2})`;
      }
    }
    case CalcNodeType.FuncCall:
      return `${fnNameToFnMap[node.n]}(${node.o
        .map((n, i) => {
          let argType: "number" | "vector2" | "error" | null =
            funcNameToSignature[node.n]?.params[i] ?? null;
          if (argType === "error") {
            argType = null;
          }

          return matchType(
            transformToGLSLCode(n, context),
            nodeTypeMap.get(n),
            argType ?? undefined,
          );
        })
        .join(", ")})`;
    case CalcNodeType.Error:
      throw new FractalFormulaError(
        "CalcNodeError met during GLSL code generation",
      );
  }
};

const matchType = (
  str: string,
  currentType?: "number" | "vector2" | "error",
  targetType?: "number" | "vector2" | "error",
): string => {
  if (!currentType || !targetType) {
    return str;
  }

  if (currentType === targetType) {
    return str;
  }

  if (currentType === "number" && targetType === "vector2") {
    return `vec2(${str}, 0.0)`;
  }

  if (currentType === "vector2" && targetType === "number") {
    return `${str}.x`;
  }

  return str;
};

const toGlslFloat = (num: number): string =>
  String(num).includes(".") ? String(num) : `${String(num)}.0`;

const operationToFnMap: Record<string, string> = {
  "+": "complexAdd",
  "-": "complexSub",
  "*": "complexMul",
  "/": "complexDiv",
  "^": "complexPow",
};

const fnNameToFnMap: Record<string, string> = {
  PLog: "complexPLog",
  log: "complexPLog",
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
  len: "length",
  clamp: "clamp",
  mod: "mod",
  normalize: 'complexNormalize'
};
