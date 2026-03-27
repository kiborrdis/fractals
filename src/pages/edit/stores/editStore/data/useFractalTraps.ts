import { FractalTrap } from "@/features/fractals";
import { useEditStore } from "../provider";

export const useFractalTraps = () => {
  const traps = useEditStore(
    (s) => (s.fractal as Record<string, unknown>).traps,
  ) as FractalTrap[] | undefined;
  return traps ?? [];
};
