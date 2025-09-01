import {
  ConstBooleanRule,
  RuleType,
  StaticNumberRule,
  ConvertToRule,
  RangeNumberRule,
  ConvertToBuildResult,
  NumberBuildRule,
  FractalDynamicParamsBuildRules,
  FractalDynamicParams,
  FractalParams,
  FractalParamsBuildRules,
} from "./fractals/types";

export const makeRulesBasedOnParams = ({
  dynamic: params,
  ...rest
}: FractalParams): FractalParamsBuildRules => {
  const rules: FractalParamsBuildRules = {
    ...rest,
    dynamic: {
      hexMirroringFactor: makeRuleFromNumber(params.hexMirroringFactor),
      hexMirroringPerDistChange: makeRuleFromArray(
        params.hexMirroringPerDistChange
      ),
      invert: makeRuleFromBoolean(params.invert),
      linearMirroringFactor: makeRuleFromNumber(params.linearMirroringFactor),
      time: makeRuleFromNumber(params.time),
      c: makeRuleFromArray(params.c),
      r: makeRuleFromNumber(params.r),
      rlVisibleRange: makeRuleFromArray(params.rlVisibleRange),
      imVisibleRange: makeRuleFromArray(params.imVisibleRange),
      maxIterations: makeRuleFromNumber(params.maxIterations),
      linearMirroringPerDistChange: makeRuleFromArray(
        params.linearMirroringPerDistChange
      ),
      radialMirroringPerDistChange: makeRuleFromArray(
        params.radialMirroringPerDistChange
      ),
      cxPerDistChange: makeRuleFromArray(params.cxPerDistChange),
      cyPerDistChange: makeRuleFromArray(params.cyPerDistChange),
      rPerDistChange: makeRuleFromArray(params.rPerDistChange),
      iterationsPerDistChange: makeRuleFromArray(
        params.iterationsPerDistChange
      ),
      radialMirroringAngle: makeRuleFromNumber(params.radialMirroringAngle),
    },
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
export const makeRuleFromArray = <V extends number[]>(
  value: V
): ConvertToRule<V> => {
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
      Math.sin(
        (time + rule.phaseSeconds * 1000) /
          ((rule.cycleSeconds * 1000) / Math.PI)
      )
  );
};

export const makeArrayFromRules = <V extends NumberBuildRule[]>(
  rules: V,
  time: number = 0
): ConvertToBuildResult<V> => {
  return rules.map((rule) =>
    makeScalarFromRule(rule, time)
  ) as ConvertToBuildResult<V>;
};

export const makeFractalParamsFromRules = (
  rules: FractalParamsBuildRules,
  time: number = 0
): FractalParams => {
  return {
    ...rules,
    dynamic: makeFractalDynamicParamsFromRules(rules.dynamic, time),
  };
};

const makeFractalDynamicParamsFromRules = (
  rules: FractalDynamicParamsBuildRules,
  time: number = 0
): FractalDynamicParams => {
  const params = Object.entries(rules).reduce((acc, [key, value]) => {
    if (Array.isArray(value)) {
      // @ts-expect-error TODO research, maybe it can be done properly now
      acc[key as keyof FractalDynamicParams] = makeArrayFromRules(value, time);
      return acc;
    }

    // @ts-expect-error TODO research, maybe it can be done properly now
    acc[key] = makeScalarFromRule(value, time);
    return acc;
  }, {} as FractalDynamicParams);

  return params;
};
