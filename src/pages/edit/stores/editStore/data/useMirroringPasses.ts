import { MirroringPassType } from "@/features/fractals";
import { useEditStore } from "../provider";
import { useActions } from "./useActions";
import { useCallback } from "react";
import { NumberBuildRule } from "@/shared/libs/numberRule";

export const useMirroringPasses = () => {
  const passes = useEditStore((state) => state.fractal.dynamic.mirroringPasses);
  const { dynamicRuleChange } = useActions();

  const setPasses = useCallback(
    (newPasses: [MirroringPassType, NumberBuildRule, NumberBuildRule][]) => {
      dynamicRuleChange("mirroringPasses", newPasses);
    },
    [dynamicRuleChange],
  );

  return [passes ?? [], setPasses] as const;
};
