import { FractalParams, FractalParamsBuildRules, ConstBooleanRule, RuleType, StaticNumberRule, ConvertToRule, RangeNumberRule } from "./fractals/types";

export const makeRulesBasedOnParams = (
  params: FractalParams
): FractalParamsBuildRules => {
  const rules: FractalParamsBuildRules = {
    invert: makeRuleFromBoolean(params.invert),
    mirror: makeRuleFromBoolean(params.mirror),
    colorStart: makeRuleFromArray(params.colorStart),
    colorEnd: makeRuleFromArray(params.colorEnd),
    colorOverflow: makeRuleFromArray(params.colorOverflow),
    splitNumber: makeRuleFromNumber(params.splitNumber),
    time: makeRuleFromNumber(params.time),
    c: makeRuleFromArray(params.c),
    r: makeRuleFromNumber(params.r),
    rRangeStart: makeRuleFromArray(params.rRangeStart),
    rRangeEnd: makeRuleFromArray(params.rRangeEnd),
    maxIterations: makeRuleFromNumber(params.maxIterations),
    linearSplitPerDistChange: makeRuleFromArray(
      params.linearSplitPerDistChange
    ),
    radialSplitPerDistChange: makeRuleFromArray(
      params.radialSplitPerDistChange
    ),
    cxSplitPerDistChange: makeRuleFromArray(params.cxSplitPerDistChange),
    cySplitPerDistChange: makeRuleFromArray(params.cySplitPerDistChange),
    rSplitPerDistChange: makeRuleFromArray(params.rSplitPerDistChange),
    iterationsSplitPerDistChange: makeRuleFromArray(
      params.iterationsSplitPerDistChange
    ),
    angularSplitNumber: makeRuleFromNumber(params.angularSplitNumber),
  };
  return rules;
};
export const makeRuleFromBoolean = (value: boolean): ConstBooleanRule => {
  return {
    t: RuleType.ConstBoolean,
    value,
  };
};
export const makeRuleFromNumber = (value: number): StaticNumberRule => {
  return {
    t: RuleType.StaticNumber,
    value,
  };
};
export const makeRuleFromArray = <V extends number[]>(value: V): ConvertToRule<V> => {
  return value.map(makeRuleFromNumber) as ConvertToRule<V>;
};

export const rangeRule = (
  range: [number, number],
  cycleSeconds: number
): RangeNumberRule => {
  return {
    t: RuleType.RangeNumber,
    range,
    cycleSeconds,
  };
}
