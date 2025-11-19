import { FractalParamsBuildRules } from "@/features/fractals";
import { useEditStore } from "../provider";
import { useActions } from "./useActions";

export const useStaticRule = <K extends keyof Omit<FractalParamsBuildRules, 'dynamic'>>(
  name: K
) => {
  const rule = useEditStore((state) => state.fractal[name]);
  const { staticRuleChange } = useActions();
  
  return [rule, staticRuleChange] as const;
};
