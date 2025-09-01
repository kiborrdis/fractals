import { FractalDynamicParamsBuildRules } from "../../../fractals/types";
import { useEditStore } from "../provider";
import { useActions } from "./useActions";

export const useDynamicRule = (name: keyof FractalDynamicParamsBuildRules) => {
  const rule = useEditStore((state) => state.fractal.dynamic[name]);
  const { dynamicRuleChange } = useActions();

  return [rule, dynamicRuleChange] as const;
};
