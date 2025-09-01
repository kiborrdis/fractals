import { useEditStore } from "../provider";

export const useFractalParamsData = () => {
  const fractal = useEditStore((state) => state.fractal);

  return fractal;
};
