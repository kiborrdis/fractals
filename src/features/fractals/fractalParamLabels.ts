import { Vector2 } from "@/shared/libs/vectors";
import { ColoringMode, FractalDynamicParams, MirroringPassType } from "./types";

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

const coloringRouteToLabelMap: {
  [K in ColoringMode]?: string[];
} = {
  [ColoringMode.Trap]: ["Trap Dist Multiplier", "Trap Dist Pow"],
  [ColoringMode.Border]: ["Border Dist Multiplier", "Border Dist Pow"],
  [ColoringMode.Normal]: ["Normal angle"],
};

export const getDynamicColoringParamLabels = (
  coloringType: ColoringMode,
  paramIndex: number,
) => {
  return (
    coloringRouteToLabelMap[coloringType]?.[paramIndex] ??
    `Coloring param ${paramIndex}`
  );
};

const mirroringPassesRouteToLabelMap: {
  [K in MirroringPassType]?: string[];
} = {
  [MirroringPassType.Hex]: ["", "Hex Mirroring Factor", "Hex Mirroring Factor Distance Variation"],
  [MirroringPassType.Linear]: ["", "Square Mirroring Factor", "Square Mirroring Factor Distance Variation"],
  [MirroringPassType.Radial]: ["", "Mirroring Angle", "Mirroring Angle Distance Variation"],
};

export const getDynamicMirroringPassesParamLabels = (
  mirroringPassType: MirroringPassType,
  paramIndex: number,
) => {
  return (
    mirroringPassesRouteToLabelMap[mirroringPassType]?.[paramIndex] ??
    `Mirroring pass param ${paramIndex}`
  );
};
