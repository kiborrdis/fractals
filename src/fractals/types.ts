export type Vector2 = [number, number];
export type Vector3 = [number, number, number];
export type Vector4 = [number, number, number, number];
export type RGBAVector = Vector4;

export type FractalParams = {
  invert: boolean;
  mirror: boolean;
  colorStart: Vector3;
  colorEnd: Vector3;
  colorOverflow: Vector3;
  splitNumber: number;
  angularSplitNumber: number;
  time: number;
  c: Vector2;
  r: number;
  rRangeStart: Vector2;
  rRangeEnd: Vector2;
  maxIterations: number;
  linearSplitPerDistChange: Vector2;
  radialSplitPerDistChange: Vector2;
  cxSplitPerDistChange: Vector2;
  cySplitPerDistChange: Vector2;
  rSplitPerDistChange: Vector2;
  iterationsSplitPerDistChange: Vector2;
};

export enum RuleType {
  StaticNumber = 0,
  RangeNumber = 1,
  ConstBoolean = 2,
}

export type ConstBooleanRule = {
  t: RuleType.ConstBoolean;
  value: boolean;
};

export type StaticNumberRule = {
  t: RuleType.StaticNumber;
  value: number;
};

export type RangeNumberRule = {
  t: RuleType.RangeNumber;
  range: Vector2;
  cycleSeconds: number;
};

export type NumberBuildRule = StaticNumberRule | RangeNumberRule;

export type ConvertToRule<I extends boolean | number | number[]> =
  I extends number
    ? NumberBuildRule
    : I extends boolean
    ? ConstBooleanRule
    : I extends [infer F, ...infer Rest]
    ? [
        F extends number ? ConvertToRule<F> : never,
        ...(Rest extends number[] ? ConvertToRule<Rest> : [])
      ]
    : [];

export type ConvertToBuildResult<
  R extends ConstBooleanRule | NumberBuildRule | NumberBuildRule[]
> = R extends NumberBuildRule
  ? number
  : R extends boolean
  ? boolean
  : R extends [infer F, ...infer Rest]
  ? [
      F extends NumberBuildRule ? number : never,
      ...(Rest extends NumberBuildRule[] ? ConvertToBuildResult<Rest> : [])
    ]
  : [];

export type FractalParamsBuildRules = {
  [K in keyof FractalParams]: ConvertToRule<FractalParams[K]>;
};
