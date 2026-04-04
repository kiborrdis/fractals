import { ConvertToRule, NumberBuildRule } from "@/shared/libs/numberRule";
import { Vector2, Vector4 } from "@/shared/libs/vectors";

export type RGBAVector = Vector4;

export enum MirroringPassType {
  Linear = 1,
  Hex = 2,
  Radial = 3,
}

export type MirroringPass = [MirroringPassType, number, number];

export enum ColoringMode {
  Iterations = 1,
  Border = 2,
  Trap = 3,

  Normal = 40,
  StripesAverage = 50,
}

export enum BlendMode {
  Normal = 1,
  Add = 2,
  Multiply = 3,
  Screen = 4,
  ColorDodge = 5,
  ColorBurn = 6,
  Lighten = 7,
  Darken = 8,
  Difference = 9,
  Exclusion = 10,
  Overlay = 11,
  HardLight = 12,
  InvertedOverlay = 13,
  InvertedHardLight = 14,
  SoftLight = 15,
}

export type ColoringEntry = {
  type: ColoringMode;
  blend: BlendMode;
};

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

type SegmentTrap = {
  type: "segment";
  p1: Vector2;
  p2: Vector2;
};

export type FractalTrap = LineTrap | PointTrap | CircleTrap | SegmentTrap;
export type FractalTrapType = FractalTrap["type"];

export type FractalParams = {
  invert: boolean;

  formula: string;
  initialZFormula?: string;
  initialCFormula?: string;
  initialTime?: number;
  antialiasingLevel?: number;

  coloring?: ColoringEntry[];

  traps?: FractalTrap[];
  trapGradient?: GradientStop[];

  gradient: GradientStop[];
  borderColor?: RGBAVector;
  borderIntensity?: number;

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
  mirroringPasses: MirroringPass[];
  c: Vector2;
  r: number;
  maxIterations: number;

  time: number;

  rlVisibleRange: Vector2;
  imVisibleRange: Vector2;

  cDistVariation: Vector2;
  rDistVariation: number;
  iterationsDistVariation: number;

  trapDistMult: number;
  trapDistPow: number;
};

export type GradientStop = [
  number, // Position 0-10000, following by r,g,b,a
  number,
  number,
  number,
  number,
];

type FractalDynamicParamsRulable = Omit<FractalDynamicParams, "mirroringPasses">;

export type FractalDynamicParamsBuildRules = {
  [K in keyof FractalDynamicParamsRulable]: ConvertToRule<
    FractalDynamicParamsRulable[K]
  >;
} & {
  mirroringPasses: [MirroringPassType, NumberBuildRule, NumberBuildRule][];
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
