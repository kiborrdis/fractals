import { CalcNodeResultType } from "@/shared/libs/complexVariableFormula/types";

export type VarNameToTypeMap = Record<string, CalcNodeResultType>;

export const varNameToType: VarNameToTypeMap = {};

export const funcNameToSignature: Record<
  string,
  {
    params: CalcNodeResultType[];
    return: CalcNodeResultType;
  }
> = {
  log: {
    params: ["vector2"],
    return: "vector2",
  },
  PLog: {
    params: ["vector2"],
    return: "vector2",
  },
  im: {
    params: ["vector2"],
    return: "number",
  },
  re: {
    params: ["vector2"],
    return: "number",
  },
  sin: {
    params: ["vector2"],
    return: "vector2",
  },
  sinh: {
    params: ["vector2"],
    return: "vector2",
  },
  exp: {
    params: ["vector2"],
    return: "vector2",
  },
  cos: {
    params: ["vector2"],
    return: "vector2",
  },
  cosh: {
    params: ["vector2"],
    return: "vector2",
  },
  acos: {
    params: ["vector2"],
    return: "vector2",
  },
  asin: {
    params: ["vector2"],
    return: "vector2",
  },
  tan: {
    params: ["vector2"],
    return: "vector2",
  },
  rotate: {
    params: ["vector2", "number"],
    return: "vector2",
  },
  abs: {
    params: ["number"],
    return: "number",
  },
  mirror: {
    params: ["vector2"],
    return: "vector2",
  },
  conjugate: {
    params: ["vector2"],
    return: "vector2",
  },
  len: {
    params: ["vector2"],
    return: "number",
  },
  clamp: {
    params: ["number", "number", "number"],
    return: "number",
  },
  mod: {
    params: ["number", "number"],
    return: "number",
  },
  normalize: {
    params: ["vector2"],
    return: "vector2",}
};
