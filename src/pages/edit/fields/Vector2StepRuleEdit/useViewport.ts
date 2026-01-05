import {
  calcVectorRuleRangeSize,
  NVectorStepRule,
} from "@/shared/libs/numberRule";
import { Vector2 } from "@/shared/libs/vectors";
import { useCallback, useState } from "react";

export const useViewport = (rule: NVectorStepRule<2>) => {
  const [{ axisRangeSizes, offset }, setViewport] = useState<{
    axisRangeSizes: Vector2;
    offset: Vector2;
  }>(() => {
    return {
      axisRangeSizes: [
        calcVectorRuleRangeSize(rule) * 1.5,
        calcVectorRuleRangeSize(rule) * 1.5,
      ],
      offset: [0, 0],
    };
  });

  return {
    axisRangeSizes,
    offset,
    setViewport: useCallback(
      (newAxisRangeSizes?: Vector2, offset?: Vector2) => {
        setViewport((prev) => ({
          axisRangeSizes: newAxisRangeSizes
            ? newAxisRangeSizes
            : prev.axisRangeSizes,
          offset: offset ?? prev.offset,
        }));
      },
      [],
    ),
  };
};
