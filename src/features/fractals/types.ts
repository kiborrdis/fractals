import { ConvertToRule } from "@/shared/libs/numberRule";
import { Vector2, Vector4 } from "@/shared/libs/vectors";

export type RGBAVector = Vector4;

export type FractalParams = {
  invert: boolean;

  formula: string;
  gradient: GradientStop[];

  mirroringType: "off" | "hex" | "square";

  /**
   * @description [2, Infinity] -- override auto-calculated smoothing power(in general, should be max power of z in formula).
   *              [-Infinity, 0) disable smoothing altogether,
   *              [0, 2) use auto-calculated smoothing power. If fail to calculate, smoothing disabled
   *              Not defined considered as 0
   */
  bandSmoothing?: number;

  dynamic: FractalDynamicParams;
  custom: Record<string, number | Vector2>;
};

export type FractalDynamicParams = {
  hexMirroringFactor: number;
  hexMirroringPerDistChange: number;
  linearMirroringFactor: number;
  radialMirroringAngle: number;
  time: number;
  c: Vector2;
  r: number;
  rlVisibleRange: Vector2;
  imVisibleRange: Vector2;
  maxIterations: number;
  linearMirroringPerDistChange: number;
  radialMirroringPerDistChange: number;
  cxPerDistChange: number;
  cyPerDistChange: number;
  rPerDistChange: number;
  iterationsPerDistChange: number;
};

export type GradientStop = [
  number, // Position 0-10000, following by r,g,b,a
  number,
  number,
  number,
  number,
];

export type FractalDynamicParamsBuildRules = {
  [K in keyof FractalDynamicParams]: ConvertToRule<FractalDynamicParams[K]>;
};

export type FractalCustomRules = Record<
  string,
  ConvertToRule<number | Vector2>
>;

export type FractalParamsBuildRules = Omit<
  FractalParams,
  "dynamic" | "custom"
> & {
  dynamic: FractalDynamicParamsBuildRules;
  custom: FractalCustomRules;
};
