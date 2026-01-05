import {
  NumberBuildRule,
  NVectorStepRule,
  RuleType,
  Vector2BSplineRule,
  Vector2BulidRule,
} from "./types";

export const isNumberRule = (
  value:
    | NumberBuildRule
    | Vector2BSplineRule
    | NVectorStepRule<number>
    | [NumberBuildRule, NumberBuildRule],
): value is NumberBuildRule => {
  return !isVector2Rule(value) && value.t !== RuleType.StepNVector;
};

export const isVector2Rule = (
  value:
    | NumberBuildRule
    | Vector2BSplineRule
    | NVectorStepRule<number>
    | [NumberBuildRule, NumberBuildRule],
): value is Vector2BulidRule => {
  return (
    Array.isArray(value) ||
    value.t === RuleType.Vector2BSpline ||
    (value.t === RuleType.StepNVector && value.dimension === 2)
  );
};
