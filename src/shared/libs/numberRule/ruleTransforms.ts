import {
  computeTransitionState,
  makeNumberFromRangeRule,
} from "./ruleConversion";
import { StepNumberRule } from "./types";

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
  const newStepTimeSeconds = Math.max(newStepTime / 1000, 0);

  const newPrevLen = Math.min(
    Math.max(newStepTimeSeconds - lenToI, 0),
    prevLen + curLen - 0.001,
  );

  const newRule: typeof rule = {
    ...rule,
    transitions: [...rule.transitions],
    steps: [...rule.steps],
  };
  newRule.transitions[index - 1] = {
    ...newRule.transitions[index - 1],
    len: newPrevLen,
  };
  newRule.transitions[index] = {
    ...newRule.transitions[index],
    len: Math.max(curLen - (newPrevLen - prevLen), 0.001),
  };

  const newY = Math.max(Math.min(newMagnitude, 1.0), 0.0);

  newRule.steps[index] = newY;

  return newRule;
};
