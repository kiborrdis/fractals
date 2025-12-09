import { extractMaxValueFromRule } from "@/shared/libs/numberRule";
import { useEditStore } from "../provider";

export const useMaxIteration = () => {
  const maxIterationRule = useEditStore((s) => s.fractal.dynamic.maxIterations);
  const iterationChange = useEditStore(
    (s) => s.fractal.dynamic.iterationsPerDistChange,
  );
  const maxIterVal = extractMaxValueFromRule(maxIterationRule);
  const maxIterChangeVal = extractMaxValueFromRule(iterationChange);

  return Math.max(maxIterVal, maxIterVal + maxIterChangeVal);
};
