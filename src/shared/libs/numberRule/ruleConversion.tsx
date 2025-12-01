import { ConvertToBuildResult, ConvertToRule, NumberBuildRule, RangeNumberRule, RuleType, StaticNumberRule, StepNumberRule, StepTransitionFn, StepTransitionFnType } from "./types";

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

export const makeScalarFromRule = (
  rule: NumberBuildRule,
  time: number = 0
): number => {
  if (rule.t === RuleType.StaticNumber) {
    return rule.value;
  }

  if (
    rule.t === RuleType.RangeNumber ||
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
  t: (t) => Math.pow(t, 2) * Math.sin((Math.PI*17*t) / 2),
  easeInSine: (t) => 1 - Math.pow(1 - t, 2) * Math.cos((Math.PI*17*t) / 2),
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
