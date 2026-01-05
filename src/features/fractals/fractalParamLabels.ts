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
  c: [
    "Complex constant(c)",
    ["Complex constant(c) Real", "Complex constant(c) Imaginary"],
  ],
  maxIterations: ["Max iterations"],
  r: ["Escape radius"],
};

export const getDynamicParamLabel = (route: string[]) => {
  if (route.length === 0) {
    return "";
  }

  if (route.length === 1) {
    return (
      routeToLabelMap[route[0] as keyof FractalDynamicParams]?.[0] ??
      route.join(".")
    );
  }

  return (
    routeToLabelMap[route[0] as keyof FractalDynamicParams]?.[1]?.[
      Number(route[1])
    ] ?? route.join(".")
  );
};
