import { Vector2 } from "../vectors";
import { animationFns } from "./animationFns";
import { makeVector2FromBSpline } from "./bSplineRule";
import {
  ConvertToBuildResult,
  ConvertToRule,
  NumberBuildRule,
  NVectorStepRule,
  RangeNumberRule,
  RuleType,
  StaticNumberRule,
  StepNumberRule,
  StepTransition,
  StepTransitionFn,
  Vector2BSplineRule,
} from "./types";

const SECOND = 1000;

export const calcRulePeriod = (
  rule:
    | StepNumberRule
    | RangeNumberRule
    | NVectorStepRule<number>
    | Vector2BSplineRule,
): number => {
  if (rule.t === RuleType.RangeNumber) {
    return rule.period * SECOND;
  }

  if (rule.t === RuleType.StepNVector) {
    return rule.transitions.reduce((m, t) => m + t.len, 0) * SECOND;
  }

  if (rule.t === RuleType.Vector2BSpline) {
    return rule.period * SECOND;
  }

  return rule.transitions.reduce((m, t) => m + t.len, 0) * SECOND;
};

// Calculate max rangeSize
export const calcVectorRuleRangeSize = (
  rule: NVectorStepRule<2> | Vector2BSplineRule,
): number => {
  let minBoundX = Infinity;
  let maxBoundX = -Infinity;
  let minBoundY = Infinity;
  let maxBoundY = -Infinity;

  if (rule.t === RuleType.Vector2BSpline) {
    rule.controls.forEach((control) => {
      if (control[0] < minBoundX) {
        minBoundX = control[0];
      }
      if (control[0] > maxBoundX) {
        maxBoundX = control[0];
      }
      if (control[1] < minBoundY) {
        minBoundY = control[1];
      }
      if (control[1] > maxBoundY) {
        maxBoundY = control[1];
      }
    });

    return Math.max(
      Math.abs(maxBoundX - minBoundX),
      Math.abs(maxBoundY - minBoundY),
    );
  }

  if (rule.t === RuleType.StepNVector) {
    rule.steps.forEach((step) => {
      if (step[0] < minBoundX) {
        minBoundX = step[0];
      }
      if (step[0] > maxBoundX) {
        maxBoundX = step[0];
      }
      if (step[1] < minBoundY) {
        minBoundY = step[1];
      }
      if (step[1] > maxBoundY) {
        maxBoundY = step[1];
      }
    });

    return Math.max(
      Math.abs(maxBoundX - minBoundX),
      Math.abs(maxBoundY - minBoundY),
    );
  }

  return 2;
};

export const extractMaxValueFromRule = (rule: NumberBuildRule): number => {
  if (rule.t === RuleType.StaticNumber) {
    return rule.value;
  }

  if (rule.t === RuleType.RangeNumber) {
    return Math.max(...rule.range);
  }

  if (rule.t === RuleType.StepNumber) {
    const maxStep = Math.max(...rule.steps);
    return maxStep * (rule.range[1] - rule.range[0]) + rule.range[0];
  }

  return 0;
};

export const makeRuleFromNumber = (value: number): StaticNumberRule => {
  return {
    t: RuleType.StaticNumber,
    value,
  };
};

export const makeRuleFromArray = <V extends number[]>(
  value: V,
): ConvertToRule<V> => {
  return value.map(makeRuleFromNumber) as ConvertToRule<V>;
};

export const rangeRule = (
  range: [number, number],
  period: number,
  phaseSeconds: number = 0,
): RangeNumberRule => {
  return {
    t: RuleType.RangeNumber,
    range,
    period,
    phase: phaseSeconds,
  };
};

export const makeScalarFromRule = (
  rule: NumberBuildRule,
  time: number = 0,
): number => {
  if (rule.t === RuleType.StaticNumber) {
    return rule.value;
  }

  if (rule.t === RuleType.RangeNumber || rule.t === RuleType.StepNumber) {
    return makeNumberFromRangeRule(rule, time);
  }

  return 0;
};

const makeVectorFromSteps = <N extends number>(
  rule: NVectorStepRule<N>,
  time: number,
): number[] => {
  const nums: number[] = [];

  const { stepI, nextStepI, transitionTime } = getTransitionValue(rule, time);
  const step = rule.steps[stepI];
  const nextStep = rule.steps[nextStepI];

  for (let i = 0; i < rule.dimension; i++) {
    const number = getValueFromTransitionValue(
      rule.transitions[stepI].fns[i],
      transitionTime,
      step[i],
      nextStep[i],
    );
    nums.push(number);
  }

  return nums;
};

const makeNumberFromSteps = (
  rule: {
    transitions: StepTransition[];
    steps: number[];
    range: Vector2;
  },
  time: number,
) => {
  const { i: stepIndex, transitionPhase: transitionTime } =
    computeTransitionState(rule, time);

  const stepTransition = rule.transitions[stepIndex];
  const stepValueStart = rule.steps[stepIndex];
  const stepValueEnd = rule.steps[(stepIndex + 1) % rule.steps.length];

  const magnitudeVal = getValueFromTransitionValue(
    stepTransition.fn,
    transitionTime / stepTransition.len,
    stepValueStart,
    stepValueEnd,
  );

  return magnitudeVal * (rule.range[1] - rule.range[0]) + rule.range[0];
};

const getTransitionValue = (
  rule: {
    transitions: Pick<StepTransition, "len">[];
  },
  time: number,
) => {
  const { i: stepIndex, transitionPhase: transitionTime } =
    computeTransitionState(rule, time);
  const stepTransition = rule.transitions[stepIndex];

  return {
    stepI: stepIndex,
    nextStepI: (stepIndex + 1) % rule.transitions.length,
    transitionTime: transitionTime / stepTransition.len,
  };
};

const getValueFromTransitionValue = (
  fn: StepTransitionFn,
  time: number,
  step: number,
  nextStep: number,
) => {
  let relativeValue = 0;

  if (animationFns[fn.t]) {
    relativeValue = animationFns[fn.t](time, fn.data!);
  } else {
    relativeValue = animationFns.linear(time, fn.data!);
  }

  return step + (nextStep - step) * relativeValue;
};

export const makeNumberFromRangeRule = (
  rule: NumberBuildRule,
  time: number = 0,
): number => {
  if (rule.t === RuleType.StepNumber) {
    return makeNumberFromSteps(rule, time);
  }

  if (rule.t === RuleType.StaticNumber) {
    return rule.value;
  }

  const [start, end] = rule.range;
  const halfRange = (end - start) / 2;
  return (
    start +
    halfRange +
    halfRange *
      Math.sin(
        (time + rule.phase * SECOND) / (((rule.period / 2) * SECOND) / Math.PI),
      )
  );
};

export const computeTransitionState = (
  rule: {
    transitions: Pick<StepTransition, "len">[];
  },
  timeMs: number,
): {
  i: number;
  phase: number;
  transitionPhase: number;
} => {
  const timeSeconds = timeMs / 1000;
  const fullLen = rule.transitions.reduce((acc, t) => acc + t.len, 0);
  const phase = timeSeconds % fullLen;

  let acc = 0;

  for (let i = 0; i < rule.transitions.length; i++) {
    acc += rule.transitions[i].len;

    if (phase <= acc) {
      return {
        i,
        phase,
        transitionPhase: phase - (acc - rule.transitions[i].len),
      };
    }
  }

  return {
    i: rule.transitions.length - 1,
    phase,
    transitionPhase:
      phase - (acc - rule.transitions[rule.transitions.length - 1].len),
  };
};

export const makeArrayFromRules = <
  V extends NumberBuildRule[] | NVectorStepRule<number> | Vector2BSplineRule,
>(
  rules: V,
  time: number = 0,
): ConvertToBuildResult<V> => {
  if ("t" in rules) {
    if (rules.t === RuleType.Vector2BSpline) {
      return makeVector2FromBSpline(rules, time) as ConvertToBuildResult<V>;
    }

    if (rules.t === RuleType.StepNVector) {
      const vector = makeVectorFromSteps(rules, time);
      return vector as ConvertToBuildResult<V>;
    }
  }

  return rules.map((rule) =>
    makeScalarFromRule(rule, time),
  ) as ConvertToBuildResult<V>;
};
