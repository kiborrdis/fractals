import { FractalParams, FractalParamsBuildRules, ConstBooleanRule, RuleType, StaticNumberRule, ConvertToRule, RangeNumberRule, ConvertToBuildResult, NumberBuildRule } from "./fractals/types";

export const makeRulesBasedOnParams = (
  params: FractalParams
): FractalParamsBuildRules => {
  const rules: FractalParamsBuildRules = {
    hexMirroringFactor: makeRuleFromNumber(params.hexMirroringFactor),
    hexMirroringPerDistChange: makeRuleFromArray(params.hexMirroringPerDistChange),
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
  cycleSeconds: number,
  phaseSeconds: number = 0
): RangeNumberRule => {
  return {
    t: RuleType.RangeNumber,
    range,
    cycleSeconds,
    phaseSeconds,
  };
};

const makeScalarFromRule = (
  rule: NumberBuildRule | ConstBooleanRule,
  time: number = 0
): number | boolean => {
  if (rule.t === RuleType.ConstBoolean) {
    return rule.value;
  }

  if (rule.t === RuleType.StaticNumber) {
    return rule.value;
  }

  if (rule.t === RuleType.RangeNumber) {
    return makeNumberFromRangeRule(rule, time);
  }

  return 0;
};

export const makeNumberFromRangeRule = (
  rule: RangeNumberRule,
  time: number = 0
): number => {
  const [start, end] = rule.range;

  return (
    start +
    (end - start) / 2 +
    ((end - start) / 2) *
    Math.sin((time + rule.phaseSeconds * 1000  ) / ((rule.cycleSeconds * 1000) / Math.PI) )
  );
};

const makeArrayFromRules = <V extends NumberBuildRule[]>(
  rules: V,
  time: number = 0
): ConvertToBuildResult<V> => {
  return rules.map((rule) => makeScalarFromRule(rule, time)
  ) as ConvertToBuildResult<V>;
};

export const makeFractalParamsFromRules = (
  rules: FractalParamsBuildRules,
  time: number = 0
): FractalParams => {
  const params = Object.entries(rules).reduce((acc, [key, value]) => {
    if (Array.isArray(value)) {
      // @ts-expect-error TODO research, maybe it can be done properly now
      acc[key as keyof FractalParams] = makeArrayFromRules(value, time);
      return acc;
    }

    // @ts-expect-error TODO research, maybe it can be done properly now
    acc[key] = makeScalarFromRule(value, time);
    return acc;
  }, {} as FractalParams);

  if (!params.mirror) {
    params.splitNumber = 0.5;
    params.angularSplitNumber = 181;
    params.linearSplitPerDistChange = [0, 0];
    params.radialSplitPerDistChange = [0, 0];
  }

  return params;
};

