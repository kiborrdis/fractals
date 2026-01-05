import {
  calcVectorRuleRangeSize,
  Vector2BSplineRule,
} from "@/shared/libs/numberRule";
import { Vector2 } from "@/shared/libs/vectors";
import { useCallback, useState } from "react";

const calcSplineOffset = (rule: Vector2BSplineRule) => {
  const accum = rule.controls.reduce(
    (acc, point) => {
      acc[0] += point[0];
      acc[1] += point[1];
      return acc;
    },
    [0, 0],
  );

  return [
    -accum[0] / rule.controls.length,
    -accum[1] / rule.controls.length,
  ] as Vector2;
};
export const useViewport = (rule: Vector2BSplineRule) => {
  const [{ axisRangeSizes, offset }, setViewport] = useState<{
    axisRangeSizes: Vector2;
    offset: Vector2;
  }>(() => {
    return {
      axisRangeSizes: [
        calcVectorRuleRangeSize(rule) * 1.5,
        calcVectorRuleRangeSize(rule) * 1.5,
      ] as Vector2,
      offset: calcSplineOffset(rule),
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
