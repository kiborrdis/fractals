import { describe, expect, it } from "vitest";
import { createBSplineRuleFromPoints } from "./bSplineRule";
import {
  convertAnyRuleToResult,
  convertBuildArrayToResult,
  convertBuildObjectToResult,
} from "./ruleConversion";
import { NVectorStepRule, RuleType, StepNumberRule } from "./types";

type DeepMutable<T> = {
  -readonly [P in keyof T]: DeepMutable<T[P]>;
};

describe("convertAnyRuleToResult", () => {
  describe("StaticNumberRule", () => {
    it("returns the static value regardless of time", () => {
      const rule = { t: RuleType.StaticNumber, value: 42 } as const;

      expect(convertAnyRuleToResult(rule, 0)).toBe(42);
      expect(convertAnyRuleToResult(rule, 5000)).toBe(42);
    });
  });

  describe("RangeNumberRule", () => {
    it("returns the start value at time 0 with zero phase", () => {
      const rule = {
        t: RuleType.RangeNumber,
        range: [0, 2] as [number, number],
        period: 1,
        phase: 0,
      } as const;

      expect(convertAnyRuleToResult(rule, 0)).toBeCloseTo(1);
    });

    it("oscillates within the specified range", () => {
      const rule = {
        t: RuleType.RangeNumber,
        range: [0, 2] as [number, number],
        period: 1,
        phase: 0,
      } as const;

      for (let t = 0; t <= 10000; t += 100) {
        const result = convertAnyRuleToResult(rule, t);
        expect(result).toBeGreaterThanOrEqual(0 - 1e-10);
        expect(result).toBeLessThanOrEqual(2 + 1e-10);
      }
    });
  });

  describe("StepNumberRule", () => {
    const rule: StepNumberRule = {
      t: RuleType.StepNumber,
      range: [0, 1] as [number, number],
      steps: [0, 1],
      transitions: [
        { fn: { t: "linear" as const }, len: 1 },
        { fn: { t: "linear" as const }, len: 1 },
      ],
    };

    it("returns the first step value at time 0", () => {
      expect(convertAnyRuleToResult(rule, 0)).toBeCloseTo(0);
    });

    it("returns the interpolated value mid-transition", () => {
      expect(convertAnyRuleToResult(rule, 500)).toBeCloseTo(0.5);
    });

    it("returns the second step value at transition boundary", () => {
      expect(convertAnyRuleToResult(rule, 1000)).toBeCloseTo(1);
    });
  });

  describe("NVectorStepRule", () => {
    const rule: NVectorStepRule<2> = {
      t: RuleType.StepNVector,
      dimension: 2,
      steps: [
        [0, 0],
        [10, 20],
      ],
      transitions: [
        { fns: [{ t: "linear" }, { t: "linear" }], len: 1 },
        { fns: [{ t: "linear" }, { t: "linear" }], len: 1 },
      ],
    };

    it("returns the first step at time 0", () => {
      expect(convertAnyRuleToResult(rule, 0)).toEqual([0, 0]);
    });

    it("returns numeric x and y values", () => {
      const result = convertAnyRuleToResult(rule, 0);
      expect(typeof result[0]).toBe("number");
      expect(typeof result[1]).toBe("number");
    });

    it("returns interpolated vector mid-transition", () => {
      const result = convertAnyRuleToResult(rule, 500);
      expect(result[0]).toBeCloseTo(5);
      expect(result[1]).toBeCloseTo(10);
    });

    it("returns the second step at the transition boundary", () => {
      const result = convertAnyRuleToResult(rule, 1000);
      expect(result[0]).toBeCloseTo(10);
      expect(result[1]).toBeCloseTo(20);
    });

    it("returns a tuple with the correct length", () => {
      expect(convertAnyRuleToResult(rule, 0)).toHaveLength(2);
    });
  });

  describe("Vector2BSplineRule", () => {
    const points: [number, number][] = [
      [0, 0],
      [1, 2],
      [2, 0],
      [3, 2],
    ];
    const rule = createBSplineRuleFromPoints(1, points);

    it("returns a Vector2 (length-2 array)", () => {
      const result = convertAnyRuleToResult(rule, 0);
      expect(result).toHaveLength(2);
    });

    it("returns numeric x and y values", () => {
      const result = convertAnyRuleToResult(rule, 0);
      expect(typeof result[0]).toBe("number");
      expect(typeof result[1]).toBe("number");
    });

    it("produces a different result at different times", () => {
      const t0 = convertAnyRuleToResult(rule, 0);
      const t250 = convertAnyRuleToResult(rule, 250);
      const isSame = t0[0] === t250[0] && t0[1] === t250[1];
      expect(isSame).toBe(false);
    });
  });
});

const staticRule = (value: number) =>
  ({ t: RuleType.StaticNumber, value }) as const;

const stepVec2Rule: NVectorStepRule<2> = {
  t: RuleType.StepNVector,
  dimension: 2,
  steps: [
    [0, 0],
    [10, 20],
  ],
  transitions: [
    { fns: [{ t: "linear" }, { t: "linear" }], len: 1 },
    { fns: [{ t: "linear" }, { t: "linear" }], len: 1 },
  ],
};

describe("convertBuildArrayToResult", () => {
  it("converts a flat array of rules to their scalar values", () => {
    const arr = [staticRule(1), staticRule(2), staticRule(3)];
    expect(
      convertBuildArrayToResult(arr as DeepMutable<typeof arr>, 0),
    ).toEqual([1, 2, 3]);
  });

  it("passes plain numbers through unchanged", () => {
    const arr = [5, staticRule(10)] as const;
    expect(
      convertBuildArrayToResult(arr as DeepMutable<typeof arr>, 0),
    ).toEqual([5, 10]);
  });

  it("converts a Vector2BSplineRule inside an array", () => {
    const spline = createBSplineRuleFromPoints(1, [
      [0, 0],
      [1, 2],
      [2, 0],
      [3, 2],
    ]);
    const result = convertBuildArrayToResult([spline] as const, 0);
    expect(result).toHaveLength(1);
    expect(result[0]).toHaveLength(2);
    expect(typeof result[0][0]).toBe("number");
  });

  it("converts an NVectorStepRule inside an array", () => {
    const result = convertBuildArrayToResult([stepVec2Rule] as const, 0);
    expect(result[0]).toEqual([0, 0]);
  });

  it("converts a nested array of rules", () => {
    expect(
      convertBuildArrayToResult(
        [[staticRule(3), staticRule(7)], staticRule(1)] as const,
        0,
      ),
    ).toEqual([[3, 7], 1]);
  });

  it("converts deeply nested arrays", () => {
    const arr = [
      [[staticRule(1), staticRule(2)], staticRule(3)],
      staticRule(4),
    ] as const;
    expect(
      convertBuildArrayToResult(arr as DeepMutable<typeof arr>, 0),
    ).toEqual([[[1, 2], 3], 4]);
  });

  it("mixes plain numbers and rules at nested levels", () => {
    const arr = [[5, staticRule(6)], staticRule(7)] as const;
    expect(
      convertBuildArrayToResult(arr as DeepMutable<typeof arr>, 0),
    ).toEqual([[5, 6], 7]);
  });

  it("forwards time to rules", () => {
    const rangeRule = {
      t: RuleType.RangeNumber,
      range: [0, 2] as [number, number],
      period: 1,
      phase: 0,
    } as const;
    const atT0 = convertBuildArrayToResult([rangeRule] as const, 0)[0];
    const atT250 = convertBuildArrayToResult([rangeRule] as const, 250)[0];
    expect(atT0).not.toBeCloseTo(atT250);
  });

  it("returns an empty array for an empty input", () => {
    expect(convertBuildArrayToResult([], 0)).toEqual([]);
  });
});

describe("convertBuildObjectToResult", () => {
  it("converts a plain number value unchanged", () => {
    const result = convertBuildObjectToResult({ x: 42 }, 0);
    expect(result.x).toBe(42);
  });

  it("converts a StaticNumberRule value", () => {
    const result = convertBuildObjectToResult({ a: staticRule(7) }, 0);
    expect(result.a).toBe(7);
  });

  it("converts a RangeNumberRule value", () => {
    const rangeRule = {
      t: RuleType.RangeNumber,
      range: [0, 2] as [number, number],
      period: 1,
      phase: 0,
    } as const;
    const result = convertBuildObjectToResult({ v: rangeRule }, 0);
    expect(typeof result.v).toBe("number");
    expect(result.v).toBeGreaterThanOrEqual(0);
    expect(result.v).toBeLessThanOrEqual(2);
  });

  it("converts a Vector2BSplineRule value", () => {
    const spline = createBSplineRuleFromPoints(1, [
      [0, 0],
      [1, 2],
      [2, 0],
      [3, 2],
    ]);
    const result = convertBuildObjectToResult({ pos: spline }, 0);
    expect(result.pos).toHaveLength(2);
    expect(typeof result.pos[0]).toBe("number");
  });

  it("converts an NVectorStepRule value", () => {
    const result = convertBuildObjectToResult({ v: stepVec2Rule }, 0);
    expect(result.v).toEqual([0, 0]);
  });

  it("converts an array value (flat rules)", () => {
    const arr = [staticRule(3), staticRule(7)] as const;
    const result = convertBuildObjectToResult(
      { pair: arr as DeepMutable<typeof arr> },
      0,
    );
    expect(result.pair).toEqual([3, 7]);
  });

  it("converts multiple keys independently", () => {
    const result = convertBuildObjectToResult(
      { a: staticRule(1), b: staticRule(2), c: 99 },
      0,
    );
    expect(result).toEqual({ a: 1, b: 2, c: 99 });
  });

  it("forwards time to all values", () => {
    const rangeRule = {
      t: RuleType.RangeNumber,
      range: [0, 2] as [number, number],
      period: 1,
      phase: 0,
    } as const;
    const atT0 = convertBuildObjectToResult({ v: rangeRule }, 0).v;
    const atT250 = convertBuildObjectToResult({ v: rangeRule }, 250).v;
    expect(atT0).not.toBeCloseTo(atT250);
  });

  it("handles an empty object", () => {
    expect(convertBuildObjectToResult({}, 0)).toEqual({});
  });
});
