import { useEditStore } from "../provider";

export const useCustomVars = () => {
  const vars = useEditStore((state) => state.fractal.custom);

  return vars;
};
