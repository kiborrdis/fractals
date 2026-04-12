import { describe, expect, it } from "vitest";
import { moveRuleStep } from "./ruleTransforms";
import { RuleType, StepNumberRule } from "./types";

const totalDuration = (rule: StepNumberRule): number =>
  rule.transitions.reduce((sum, t) => sum + t.len, 0);

const makeRule = (lens: number[], steps: number[]): StepNumberRule => ({
  t: RuleType.StepNumber,
  range: [0, 1],
  steps,
  transitions: lens.map((len) => ({ fn: { t: "linear" as const }, len })),
});

describe("moveRuleStep", () => {
  describe("preserves total duration", () => {
    it("moving a middle step forward", () => {
      // steps at t=0, 2s, 5s  – total 9s
      const rule = makeRule([2, 3, 4], [0, 0.5, 1]);

      const result = moveRuleStep(rule, 1, 3000, 0.5);

      expect(totalDuration(result)).toBe(totalDuration(rule));
    });

    it("moving a middle step backward", () => {
      const rule = makeRule([2, 3, 4], [0, 0.5, 1]);

      const result = moveRuleStep(rule, 1, 1000, 0.5);

      expect(totalDuration(result)).toBe(totalDuration(rule));
    });

    it("moving the first moveable step (index 1)", () => {
      const rule = makeRule([2, 3, 4], [0, 0.5, 1]);

      const result = moveRuleStep(rule, 1, 1500, 0.5);

      expect(totalDuration(result)).toBe(totalDuration(rule));
    });

    it("moving the last step", () => {
      const rule = makeRule([2, 3, 4], [0, 0.5, 1]);

      const result = moveRuleStep(rule, 2, 7000, 0.5);

      expect(totalDuration(result)).toBe(totalDuration(rule));
    });

    it("moving a step exactly to its current position (no-op)", () => {
      const rule = makeRule([2, 3, 4], [0, 0.5, 1]);

      const result = moveRuleStep(rule, 1, 2000, 0.5);

      expect(totalDuration(result)).toBe(totalDuration(rule));
    });

    it("with a four-step rule – unrelated transitions unchanged", () => {
      const rule = makeRule([2, 3, 2, 3], [0, 0.25, 0.5, 1]);

      const result = moveRuleStep(rule, 2, 6000, 0.5);

      expect(totalDuration(result)).toBe(totalDuration(rule));
    });

    it("when step time is clamped to minimum gap (pushed too far left)", () => {
      const rule = makeRule([2, 3, 4], [0, 0.5, 1]);

      const result = moveRuleStep(rule, 1, 0, 0.5);

      expect(totalDuration(result)).toBe(totalDuration(rule));
    });

    it("when step time is clamped to maximum gap (pushed too far right)", () => {
      const rule = makeRule([2, 3, 4], [0, 0.5, 1]);

      const result = moveRuleStep(rule, 1, 1_000_000, 0.5);

      expect(totalDuration(result)).toBe(totalDuration(rule));
    });

    it("when step 2 is clamped forward (4-step rule)", () => {
      const rule = makeRule([2, 3, 2, 3], [0, 0.25, 0.5, 1]);

      const result = moveRuleStep(rule, 2, 999_999, 0.5);

      expect(totalDuration(result)).toBe(totalDuration(rule));
    });

    it("when step 2 is clamped backward (4-step rule)", () => {
      const rule = makeRule([2, 3, 2, 3], [0, 0.25, 0.5, 1]);

      const result = moveRuleStep(rule, 2, 0, 0.5);

      expect(totalDuration(result)).toBe(totalDuration(rule));
    });

    it("with negative newStepTime (treated as 0)", () => {
      const rule = makeRule([2, 3, 4], [0, 0.5, 1]);

      const result = moveRuleStep(rule, 1, -5000, 0.5);

      expect(totalDuration(result)).toBe(totalDuration(rule));
    });
  });

  describe("transition adjustments", () => {
    it("adjusts only transitions[index-1] and transitions[index]", () => {
      const rule = makeRule([2, 3, 2, 3], [0, 0.25, 0.5, 1]);

      const result = moveRuleStep(rule, 2, 6000, 0.5);

      expect(result.transitions[0].len).toBe(rule.transitions[0].len);
      expect(result.transitions[3].len).toBe(rule.transitions[3].len);
    });

    it("transition[index-1] increases by the same amount transition[index] decreases", () => {
      const rule = makeRule([2, 3, 4], [0, 0.5, 1]);

      const result = moveRuleStep(rule, 1, 3000, 0.5);

      const delta0 = result.transitions[0].len - rule.transitions[0].len;
      const delta1 = result.transitions[1].len - rule.transitions[1].len;
      expect(delta0 + delta1).toBeCloseTo(0);
    });

    it("step is placed at the requested time after the move", () => {
      const rule = makeRule([2, 3, 4], [0, 0.5, 1]);

      const result = moveRuleStep(rule, 1, 3000, 0.5);

      expect(result.transitions[0].len).toBe(3);
    });

    it("step 2 is placed at the requested time after the move", () => {
      const rule = makeRule([2, 3, 4], [0, 0.5, 1]);

      const result = moveRuleStep(rule, 2, 7000, 0.5);

      const timeOfStep2 = result.transitions[0].len + result.transitions[1].len;
      expect(timeOfStep2).toBe(7);
    });

    it("rounds the new step time to the nearest 0.5 s", () => {
      const rule = makeRule([2, 3, 4], [0, 0.5, 1]);

      const result = moveRuleStep(rule, 1, 2300, 0.5);

      expect(result.transitions[0].len).toBe(2.5);
    });

    it("rounds down to 0.5 s when requesting a time very close to 0", () => {
      const rule = makeRule([2, 3, 4], [0, 0.5, 1]);

      const result = moveRuleStep(rule, 1, 100, 0.5); // 0.1s rounds to 0 → clamped to 0.5

      expect(result.transitions[0].len).toBe(0.5);
    });

    it("clamps step to minStepLength (0.5s) from the previous step", () => {
      const rule = makeRule([2, 3, 4], [0, 0.5, 1]);

      const result = moveRuleStep(rule, 1, 0, 0.5);

      expect(result.transitions[0].len).toBe(0.5);
    });

    it("clamps step to minStepLength (0.5s) from the next step", () => {
      const rule = makeRule([2, 3, 4], [0, 0.5, 1]);

      const result = moveRuleStep(rule, 1, 1_000_000, 0.5);

      // transitions[1] must be at least 0.5s
      expect(result.transitions[1].len).toBeGreaterThanOrEqual(0.5);
    });
  });

  describe("step value (magnitude)", () => {
    it("sets the step to the requested magnitude", () => {
      const rule = makeRule([2, 3, 4], [0, 0.5, 1]);

      const result = moveRuleStep(rule, 1, 3000, 0.7);

      expect(result.steps[1]).toBe(0.7);
    });

    it("clamps magnitude above 1.0 down to 1.0", () => {
      const rule = makeRule([2, 3, 4], [0, 0.5, 1]);

      const result = moveRuleStep(rule, 1, 3000, 1.5);

      expect(result.steps[1]).toBe(1.0);
    });

    it("clamps magnitude below 0.0 up to 0.0", () => {
      const rule = makeRule([2, 3, 4], [0, 0.5, 1]);

      const result = moveRuleStep(rule, 1, 3000, -0.3);

      expect(result.steps[1]).toBe(0.0);
    });

    it("accepts boundary magnitude 0.0 without clamping", () => {
      const rule = makeRule([2, 3, 4], [0, 0.5, 1]);

      const result = moveRuleStep(rule, 1, 3000, 0.0);

      expect(result.steps[1]).toBe(0.0);
    });

    it("accepts boundary magnitude 1.0 without clamping", () => {
      const rule = makeRule([2, 3, 4], [0, 0.5, 1]);

      const result = moveRuleStep(rule, 1, 3000, 1.0);

      expect(result.steps[1]).toBe(1.0);
    });
  });

  describe("unrelated data is not modified", () => {
    it("does not change other step values", () => {
      const rule = makeRule([2, 3, 4], [0, 0.5, 1]);

      const result = moveRuleStep(rule, 1, 3000, 0.7);

      expect(result.steps[0]).toBe(rule.steps[0]);
      expect(result.steps[2]).toBe(rule.steps[2]);
    });

    it("preserves the transition function of adjusted transitions", () => {
      const rule = makeRule([2, 3, 4], [0, 0.5, 1]);

      const result = moveRuleStep(rule, 1, 3000, 0.5);

      expect(result.transitions[0].fn).toEqual(rule.transitions[0].fn);
      expect(result.transitions[1].fn).toEqual(rule.transitions[1].fn);
    });

    it("does not change unrelated transition lengths when they are already rounded", () => {
      // transitions[0] and [3] are untouched when we move step 2
      const rule = makeRule([2, 3, 2, 3], [0, 0.25, 0.5, 1]);

      const result = moveRuleStep(rule, 2, 6000, 0.5);

      expect(result.transitions[0].len).toBe(rule.transitions[0].len);
      expect(result.transitions[3].len).toBe(rule.transitions[3].len);
    });

    it("does not mutate the original rule object", () => {
      const rule = makeRule([2, 3, 4], [0, 0.5, 1]);
      const originalLens = rule.transitions.map((t) => t.len);
      const originalSteps = [...rule.steps];

      moveRuleStep(rule, 1, 3000, 0.7);

      expect(rule.transitions.map((t) => t.len)).toEqual(originalLens);
      expect(rule.steps).toEqual(originalSteps);
    });
  });


  describe("edge cases", () => {
    it("index 0: total duration is preserved", () => {
      // Step 0 is fixed at t=0. When index=0 is passed:
      //   - We ignore the requested newStepTime and set the step time to 0.
      const rule = makeRule([2, 3, 4], [0, 0.5, 1]);

      const result = moveRuleStep(rule, 0, 3000, 0.5);

      expect(totalDuration(result)).toBe(totalDuration(rule));
    });

    it("non-rounded unrelated transitions are silently normalized", () => {
      // transitions[0] = 1.3s is NOT a multiple of 0.5.
      // When step 2 is moved the else-if branch rounds it to 1.5s,
      // which changes the total duration as a side effect.
      const rule = makeRule([1.3, 3, 2, 3], [0, 0.5, 0.75, 1]);

      const result = moveRuleStep(rule, 2, 6000, 0.5);

      expect(result.transitions[0].len).toBe(1.5);
      // And therefore total duration differs from the original
      expect(totalDuration(result)).not.toBe(totalDuration(rule));
    });
  });
});
