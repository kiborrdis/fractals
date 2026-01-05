import { useEditStore } from "../provider";

export const useFractalFormula = () => {
  return useEditStore((state) => state.fractal.formula);
};
