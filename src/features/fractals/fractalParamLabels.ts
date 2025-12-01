import { Vector2 } from "@/shared/libs/vectors";
import { FractalDynamicParams } from "./types";

const routeToLabelMap: {
  [K in keyof FractalDynamicParams]?: FractalDynamicParams[K] extends
    | number
    | boolean
    | string
    ? [string]
    : FractalDynamicParams[K] extends Vector2
    ? [string, [string, string]]
    : [string];
} = {
  c: ['C', ["C.re", "C.im"]],
  maxIterations: ["Iterations4444444"],
};

export const getDynamicParamLabel = (route: string[]) => {
  if (route.length === 0) {
    return "";
  }

  if (route.length === 1) {
    return (
      routeToLabelMap[route[0] as keyof FractalDynamicParams]?.[0] ?? route.join(".")
    );
  }

  return (
    routeToLabelMap[route[0] as keyof FractalDynamicParams]?.[1]?.[
      Number(route[1])
    ] ?? route.join(".")
  );
};
