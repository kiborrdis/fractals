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
  StepTransitionFnType,
  StepTransitionFn,
  StepNumberRule,
} from "./types";

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

  if (
    rule.t === RuleType.RangeNumber ||
    rule.t === RuleType.PatchNumber ||
    rule.t === RuleType.StepNumber
  ) {
    return makeNumberFromRangeRule(rule, time);
  }

  return 0;
};

export const makeNumberFromRangeRule = (
  rule: NumberBuildRule,
  time: number = 0
): number => {
  if (rule.t === RuleType.PatchNumber) {
    const period = rule.patches.reduce<number>((m, r) => m + r.len * 1000, 0);
    const rulePhase = time % period;

    let patchStart = 0;
    const patchOfPhase = rule.patches.find((p) => {
      if (p.len * 1000 + patchStart > rulePhase) {
        return true;
      }

      patchStart += p.len * 1000;

      return false;
    });

    if (!patchOfPhase) {
      return 0;
    }

    switch (patchOfPhase.fn) {
      case "sin": {
        const {
          range: [start, end],
          phase: phaseSeconds,
          cycle: cycleSeconds,
        } = patchOfPhase;

        return (
          start +
          (end - start) / 2 +
          ((end - start) / 2) *
            Math.sin(
              (rulePhase - patchStart + phaseSeconds * 1000) /
                ((cycleSeconds * 1000) / Math.PI)
            )
        );
      }
      case "lin":
        return (
          patchOfPhase.range[0] +
          ((patchOfPhase.range[1] - patchOfPhase.range[0]) *
            (rulePhase - patchStart)) /
            (patchOfPhase.len * 1000)
        );
    }

    return 0;
  }

  if (rule.t === RuleType.StepNumber) {
    const { i: stepIndex, transitionPhase: transitionTime } = computeTransitionState(rule, time);

    const stepTransition = rule.transitions[stepIndex];
    const stepValueStart = rule.steps[stepIndex];
    const stepValueEnd = rule.steps[(stepIndex + 1) % rule.steps.length];

    let relativeValue = 0;

    if (animationFns[stepTransition.fn.t]) {
      relativeValue = animationFns[stepTransition.fn.t](
        transitionTime / stepTransition.len,
        stepTransition.fn.data!
      );
    } else {
      relativeValue = animationFns.linear(
        transitionTime / stepTransition.len,
        stepTransition.fn.data!
      );
    }

    return (
      (stepValueStart + (stepValueEnd - stepValueStart) * relativeValue) *
        (rule.range[1] - rule.range[0]) +
      rule.range[0]
    );
  }

  if (rule.t === RuleType.StaticNumber) {
    return rule.value;
  }

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

export const computeTransitionState = (
  rule: StepNumberRule,
  timeMs: number
): {
  i: number,
  phase: number,
  transitionPhase: number,
} => {
  const timeSeconds = timeMs / 1000;
  const fullLen = rule.transitions.reduce((acc, t) => acc + t.len, 0);
  const phase = timeSeconds % fullLen;

  let acc = 0;

  for (let i = 0; i < rule.transitions.length; i++) {
    acc += rule.transitions[i].len;

    if (phase <= acc) {
      return {i, phase, transitionPhase: phase - (acc - rule.transitions[i].len)};
    }
  }

  return {
    i: rule.transitions.length - 1,
    phase,
    transitionPhase: phase - (acc - rule.transitions[rule.transitions.length - 1].len),
  };
};

export const animationFns: {
  [K in StepTransitionFnType]: (
    t: number,
    d: Extract<StepTransitionFn, { t: K }>["data"]
  ) => number;
} = {
  linear: (t) => t,
  t: (t) => Math.pow(t, 2),
  easeInSine: (t) => 1 - Math.cos((t * Math.PI) / 2),
  easeOutSine: (t) => Math.sin((t * Math.PI) / 2),
  easeInOutSine: (t) => -((Math.cos(Math.PI * t) - 1) / 2),
  easeInOutElastic: (t) => {
    const c5 = (2 * Math.PI) / 4.5;

    return t === 0
      ? 0
      : t === 1
      ? 1
      : t < 0.5
      ? -(Math.pow(2, 20 * t - 10) * Math.sin((20 * t - 11.125) * c5)) / 2
      : (Math.pow(2, -20 * t + 10) * Math.sin((20 * t - 11.125) * c5)) / 2 + 1;
  },
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
