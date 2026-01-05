import { NumberBuildRule, RuleType } from "@/shared/libs/numberRule";
import { Vector2 } from "@/shared/libs/vectors";
import { useCallback, useState } from "react";

const calcRangeFromRules = (
  rules: [NumberBuildRule, NumberBuildRule],
): number => {
  let maxRange = 2;

  rules.forEach((rule) => {
    if (rule.t === RuleType.RangeNumber) {
      const rangeSize = Math.abs(rule.range[1] - rule.range[0]);
      maxRange = Math.max(maxRange, rangeSize);
    } else if (rule.t === RuleType.StaticNumber) {
      maxRange = Math.max(maxRange, Math.abs(rule.value) * 2);
    } else if (rule.t === RuleType.StepNumber) {
      const rangeSize = Math.abs(rule.range[1] - rule.range[0]);
      maxRange = Math.max(maxRange, rangeSize);
    }
  });

  return maxRange * 1.5;
};

export const useViewport = (rules: [NumberBuildRule, NumberBuildRule]) => {
  const [{ axisRangeSizes, offset }, setViewport] = useState<{
    axisRangeSizes: Vector2;
    offset: Vector2;
  }>(() => {
    const range = calcRangeFromRules(rules);
    return {
      axisRangeSizes: [range, range],
      offset: [0, 0],
    };
  });

  return {
    axisRangeSizes,
    offset,
    setViewport: useCallback(
      (newAxisRangeSizes?: Vector2, offset?: Vector2) => {
        setViewport((prev) => ({
          axisRangeSizes: newAxisRangeSizes ?? prev.axisRangeSizes,
          offset: offset ?? prev.offset,
        }));
      },
      [],
    ),
  };
};
