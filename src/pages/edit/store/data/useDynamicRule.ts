import { FractalDynamicParamsBuildRules } from "@/features/fractals";
import { useEditStore } from "../provider";
import { useActions } from "./useActions";

export const useDynamicRule = (name: keyof FractalDynamicParamsBuildRules) => {
  const rule = useEditStore((state) => state.fractal.dynamic[name]);
  const { dynamicRuleChange } = useActions();

  return [rule, dynamicRuleChange] as const;
};
