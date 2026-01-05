import {
  computeTransitionState,
  makeArrayFromRules,
  makeNumberFromRangeRule,
} from "./ruleConversion";
import { NVectorStepRule, StepNumberRule } from "./types";

export const changeRulePeriod = (
  rule: StepNumberRule,
  newPeriod: number,
): StepNumberRule => {
  const len = rule.transitions.reduce((m, t) => m + t.len, 0);

  return {
    ...rule,
    transitions: rule.transitions.map((t) => ({
      ...t,
      len: (t.len / len) * newPeriod,
    })),
  };
};

export const addNewStepToRule = (
  rule: StepNumberRule,
  time: number,
): StepNumberRule => {
  rule = makeEditableToTime(rule, time);

  const { i: stepIndex, transitionPhase } = computeTransitionState(rule, time);
  const separateValue = makeNumberFromRangeRule(rule, time);
  const transitionLength = rule.transitions[stepIndex].len;

  const newRule = { ...rule };
  newRule.steps = [...newRule.steps];
  newRule.transitions = [...newRule.transitions];

  newRule.transitions[stepIndex] = {
    ...newRule.transitions[stepIndex],
    len: transitionLength * (transitionPhase / transitionLength),
  };

  newRule.transitions.splice(stepIndex + 1, 0, {
    fn: { t: "linear" },
    len: transitionLength * (1 - transitionPhase / transitionLength),
  });
  newRule.steps.splice(
    stepIndex + 1,
    0,
    (separateValue - rule.range[0]) / (rule.range[1] - rule.range[0]),
  );

  return newRule;
};

const makeEditableToTime = (
  rule: StepNumberRule,
  time: number,
): StepNumberRule => {
  const rulePeriod = rule.transitions.reduce((m, r) => m + r.len, 0) * 1000;
  const n = Math.ceil(time / rulePeriod);

  if (n < 2) {
    return rule;
  }

  let transitions: (typeof rule)["transitions"] = [];
  let steps: (typeof rule)["steps"] = [];

  for (let i = 0; i < n; i++) {
    transitions = transitions.concat(rule.transitions);
    steps = steps.concat(rule.steps);
  }

  return {
    ...rule,
    transitions,
    steps,
  };
};

// In seconds
const minStepLength = 0.5;
const roundToClosestMinStep = (time: number) =>
  Math.round(time / minStepLength) * minStepLength;

export const moveRuleStep = (
  rule: StepNumberRule,
  index: number,
  /**
   * In milliseconds
   */
  newStepTime: number,
  newMagnitude: number,
): StepNumberRule => {
  const lenToI = rule.transitions
    .slice(0, index - 1)
    .reduce((a, b) => a + b.len, 0);

  const prevLen = rule.transitions[index - 1]?.len ?? 0;
  const curLen = rule.transitions[index].len;
  const newStepTimeSeconds = roundToClosestMinStep(
    Math.max(newStepTime / 1000, 0),
  );
  const newPrevLen = Math.min(
    Math.max(newStepTimeSeconds - lenToI, minStepLength),
    prevLen + curLen - minStepLength,
  );

  const newRule: typeof rule = {
    ...rule,
    transitions: [...rule.transitions],
    steps: [...rule.steps],
  };

  for (let i = 0; i < newRule.transitions.length; i++) {
    if (i === index - 1) {
      newRule.transitions[i] = {
        ...newRule.transitions[i],
        len: roundToClosestMinStep(newPrevLen),
      };
    } else if (i === index) {
      newRule.transitions[i] = {
        ...newRule.transitions[i],
        len: roundToClosestMinStep(
          Math.max(curLen - (newPrevLen - prevLen), minStepLength),
        ),
      };
    } else if (
      roundToClosestMinStep(newRule.transitions[i].len) !==
      newRule.transitions[i].len
    ) {
      newRule.transitions[i] = {
        ...newRule.transitions[i],
        len: roundToClosestMinStep(newRule.transitions[i].len),
      };
    }
  }

  newRule.transitions[index - 1] = {
    ...newRule.transitions[index - 1],
    len: roundToClosestMinStep(newPrevLen),
  };
  newRule.transitions[index] = {
    ...newRule.transitions[index],
    len: roundToClosestMinStep(
      Math.max(curLen - (newPrevLen - prevLen), minStepLength),
    ),
  };

  const newY = Math.max(Math.min(newMagnitude, 1.0), 0.0);

  newRule.steps[index] = newY;

  return newRule;
};

export const normalizeStepLenBasedOnDistance = (
  rule: NVectorStepRule<2>,
): NVectorStepRule<2> => {
  const distances: number[] = [];

  for (let i = 0; i < rule.steps.length; i++) {
    const currentStep = rule.steps[i];
    const nextStep = rule.steps[(i + 1) % rule.steps.length];

    const distance = Math.sqrt(
      (nextStep[0] - currentStep[0]) ** 2 + (nextStep[1] - currentStep[1]) ** 2,
    );
    distances.push(distance);
  }

  const totalDistance = distances.reduce((a, b) => a + b, 0);
  const fullLen = rule.transitions.reduce((a, b) => a + b.len, 0);
  const newTransitions = rule.transitions.map((t, i) => ({
    ...t,
    len: (distances[i] / totalDistance) * fullLen,
  }));

  return {
    ...rule,
    transitions: newTransitions,
  };
};

export const moveVectorRuleStep = <N extends number>(
  rule: NVectorStepRule<N>,
  index: number,
  newValue: number[],
): NVectorStepRule<N> => {
  const newSteps = [...rule.steps];

  newSteps[index] = newValue;

  return {
    ...rule,
    steps: newSteps,
  };
};

export const addStepToVectorRule = <N extends number>(
  rule: NVectorStepRule<N>,
  time: number,
): NVectorStepRule<N> => {
  const { i: stepIndex, transitionPhase } = computeTransitionState(
    {
      transitions: rule.transitions,
    },
    time,
  );
  const separateValue: number[] = makeArrayFromRules(rule, time);

  const newRule = { ...rule };
  newRule.steps = [...newRule.steps];
  newRule.transitions = [...newRule.transitions];

  const prevLen = rule.transitions[stepIndex].len;
  newRule.transitions[stepIndex] = {
    ...newRule.transitions[stepIndex],
    len: prevLen * (transitionPhase / prevLen),
  };
  newRule.transitions.splice(stepIndex + 1, 0, {
    fns: [{ t: "linear" }, { t: "linear" }],
    len: prevLen * (1 - transitionPhase / prevLen),
  });

  newRule.steps.splice(stepIndex + 1, 0, separateValue);

  return newRule;
};
