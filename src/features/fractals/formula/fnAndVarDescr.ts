import { CalcNodeResultType } from "./types";

export const varNameToType: Record<string, CalcNodeResultType> = {
  c: "vector2",
  z: "vector2",
};

export const funcNameToSignature: Record<
  string,
  {
    params: CalcNodeResultType[];
    return: CalcNodeResultType;
  }
> = {
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
  cmpl: {
    params: ["number", "number"],
    return: "vector2",
  },
  sin: {
    params: ["vector2"],
    return: "vector2",
  },
};
