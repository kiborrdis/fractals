import { ConvertToRule } from "@/shared/libs/numberRule";
import { Vector2, Vector4 } from "@/shared/libs/vectors";

export type RGBAVector = Vector4;

type LineTrap = {
  type: "line";
  a: number;
  b: number;
  c: number;
};

type PointTrap = {
  type: "point";
  position: Vector2;
};

type CircleTrap = {
  type: "circle";
  center: Vector2;
  radius: number;
};

export type FractalTrap = LineTrap | PointTrap | CircleTrap;
export type FractalTrapType = FractalTrap["type"];

export type FractalParams = {
  invert: boolean;

  formula: string;
  initialZFormula?: string;
  initialCFormula?: string;
  initialTime?: number;
  antialiasingLevel?: number;

  gradientColoringEnabled?: boolean;
  borderColoringEnabled?: boolean;
  trapColoringEnabled?: boolean;

  traps?: FractalTrap[];
  trapIntensity?: number;
  trapGradient?: GradientStop[];

  gradient: GradientStop[];
  borderColor?: RGBAVector;
  borderIntensity?: number;

  mirroringType: "off" | "hex" | "square" | "radial";

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
  linearMirroringFactor: number;
  radialMirroringAngle: number;
  c: Vector2;
  r: number;
  maxIterations: number;

  time: number;

  rlVisibleRange: Vector2;
  imVisibleRange: Vector2;

  hexMirroringDistVariation: number;
  linearMirroringDistVariation: number;
  radialMirroringDistVariation: number;
  cDistVariation: Vector2;
  rDistVariation: number;
  iterationsDistVariation: number;
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
