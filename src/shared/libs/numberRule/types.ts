import { Vector2 } from "@/shared/libs/vectors";

export enum RuleType {
  StaticNumber = 0,
  RangeNumber = 1,
  StepNumber = 5,
}

export type StaticNumberRule = {
  t: RuleType.StaticNumber;
  value: number;
};

export type RangeNumberRule = {
  t: RuleType.RangeNumber;
  range: Vector2;
  cycleSeconds: number;
  phaseSeconds: number;
};

export type StepNumberRule = {
  t: RuleType.StepNumber;
  range: Vector2;
  steps: number[];
  transitions: StepTransition[];
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

export type ConvertToRule<I extends boolean | number | number[]> =
  I extends number
    ? NumberBuildRule
    : I extends [infer F, ...infer Rest]
      ? [
          F extends number ? ConvertToRule<F> : never,
          ...(Rest extends number[] ? ConvertToRule<Rest> : []),
        ]
      : [];

export type ConvertToBuildResult<
  R extends NumberBuildRule | NumberBuildRule[],
> = R extends NumberBuildRule
  ? number
  : R extends boolean
    ? boolean
    : R extends [infer F, ...infer Rest]
      ? [
          F extends NumberBuildRule ? number : never,
          ...(Rest extends NumberBuildRule[] ? ConvertToBuildResult<Rest> : []),
        ]
      : [];
