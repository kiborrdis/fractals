import { Vector2 } from "@/shared/libs/vectors";

export enum RuleType {
  StaticNumber = 0,
  RangeNumber = 1,
  StepNumber = 5,

  StepNVector = 10,
  Vector2BSpline = 20,
}

export type Vector2BSplineRule = {
  t: RuleType.Vector2BSpline;
  knots: number[];
  controls: Vector2[];

  /**
   * Period of the spline in seconds
   */
  period: number;
  dimension: number;
};

export type StaticNumberRule = {
  t: RuleType.StaticNumber;
  value: number;
};

export type RangeNumberRule = {
  t: RuleType.RangeNumber;
  range: Vector2;
  period: number;
  phase: number;
};

export type StepNumberRule = {
  t: RuleType.StepNumber;
  range: Vector2;
  steps: number[];
  transitions: StepTransition[];
};

export type NVectorStepRule<D extends number> = {
  t: RuleType.StepNVector;
  dimension: D;
  steps: number[][];
  transitions: VecStepTransition[];
};

export type VecStepTransition = {
  fns: StepTransitionFn[];
  /**
   * Transition length in seconds
   */
  len: number;
};

export type StepTransition = {
  fn: StepTransitionFn;
  /**
   * Transition length in seconds
   */
  len: number;
};

export type StepTransitionFnType = StepTransitionFn["t"];

export type StepTransitionFn = {
  t:
    | "linear"
    | "t"
    | "easeInSine"
    | "easeOutSine"
    | "easeInOutSine"
    | "easeInOutElastic";
  data?: never;
};

export type NumberBuildRule =
  | StaticNumberRule
  | RangeNumberRule
  | StepNumberRule;

export type Vector2BulidRule =
  | Vector2BSplineRule
  | NVectorStepRule<2>
  | [NumberBuildRule, NumberBuildRule];

export type ConvertNumberVectorToRule<I extends number[]> = I extends [
  infer F,
  ...infer Rest,
]
  ? [
      F extends number ? NumberBuildRule : never,
      ...(Rest extends number[] ? ConvertNumberVectorToRule<Rest> : []),
    ]
  : [];

export type ConvertToRule<I extends boolean | number | number[]> =
  I extends number
    ? NumberBuildRule
    : I extends number[]
      ?
          | ConvertNumberVectorToRule<I>
          | (I extends [number, number]
              ? Vector2BSplineRule | NVectorStepRule<2>
              : I extends number[]
                ? NVectorStepRule<I["length"]>
                : never)
      : [];

type TupleWithLength<
  T,
  L extends number,
  R extends T[] = [],
> = R["length"] extends L ? R : TupleWithLength<T, L, [T, ...R]>;

export type ConvertToBuildResult<
  R extends
    | NumberBuildRule
    | NumberBuildRule[]
    | NVectorStepRule<number>
    | Vector2BSplineRule,
> = R extends Vector2BSplineRule
  ? Vector2
  : R extends NVectorStepRule<infer D>
    ? TupleWithLength<number, D>
    : R extends NumberBuildRule
      ? number
      : R extends [infer F, ...infer Rest]
        ? [
            F extends NumberBuildRule ? number : never,
            ...(Rest extends NumberBuildRule[]
              ? ConvertToBuildResult<Rest>
              : []),
          ]
        : [];
