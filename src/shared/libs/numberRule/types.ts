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

export type AnyRule =
  | NumberBuildRule
  | Vector2BSplineRule
  | NVectorStepRule<number>;
export type AnyScalar = number;
export type AnyRuleOrScalar = AnyRule | AnyScalar;

export type ConvertRuleToBuildResult<R extends AnyRule> =
  R extends Vector2BSplineRule
    ? Vector2
    : R extends NVectorStepRule<infer D>
      ? TupleWithLength<number, D>
      : R extends NumberBuildRule
        ? number
        : never;

export type ConvertRuleOrScalarToBuildResult<R extends AnyRule | AnyScalar> =
  R extends AnyScalar
    ? R
    : R extends AnyRule
      ? ConvertRuleToBuildResult<R>
      : never;

type ArrayOrArrayOfArrays<V> = (V | ArrayOrArrayOfArrays<V>)[];

export type BuildArray = ArrayOrArrayOfArrays<AnyRuleOrScalar>;
type BuildObjectKeyValue = BuildArray | AnyRuleOrScalar;
export type BuildObject = {
  [key: string]: BuildObjectKeyValue;
};

// ConvertRuleArrayToResult example:
// type Test = ConvertRuleArrayToResult<
//   [
//     number,
//     Vector2BSplineRule,
//     RangeNumberRule,
//     StepNumberRule,
//     Vector2BSplineRule,
//     NVectorStepRule<3>,
//     [Vector2BSplineRule, RangeNumberRule],
//   ]
// >;
// Result:
// type Test = [
//   number,
//   Vector2,
//   number,
//   number,
//   Vector2,
//   [number, number, number],
//   [Vector2, number],
// ];
export type ConvertRuleArrayToResult<
  R extends ArrayOrArrayOfArrays<AnyRuleOrScalar> | AnyRuleOrScalar,
> = R extends AnyRuleOrScalar
  ? ConvertRuleOrScalarToBuildResult<R>
  : R extends [infer F, ...infer Rest]
    ? [
        F extends AnyRuleOrScalar
          ? ConvertRuleOrScalarToBuildResult<F>
          : F extends ArrayOrArrayOfArrays<AnyRuleOrScalar>
            ? ConvertRuleArrayToResult<F>
            : never,
        ...(Rest extends ArrayOrArrayOfArrays<AnyRuleOrScalar>
          ? ConvertRuleArrayToResult<Rest>
          : []),
      ]
    : [];

// type Test = ConvertBuildObjectToResult<{
//   a: number;
//   b: StaticNumberRule;
//   c: [RangeNumberRule, StepNumberRule];
//   d: Vector2BSplineRule;
//   e: NVectorStepRule<3>;
//   f: [[StaticNumberRule, RangeNumberRule, 3], StepNumberRule];
// }>;
// Result:
// type Test = {
//   a: number;
//   b: number;
//   c: [number, number];
//   d: Vector2;
//   e: [number, number, number];
//   f: [[number, number, 3], number];
// };
export type ConvertBuildObjectToResult<O extends BuildObject> = {
  [K in keyof O]: ConvertRuleArrayToResult<O[K]>;
};
