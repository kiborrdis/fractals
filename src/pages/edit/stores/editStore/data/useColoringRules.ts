import { useEditStore } from "../provider";

export const useColoringRules = () =>
  useEditStore((s) => s.fractal.dynamic.coloring);

export const useColoringEntry = (index: number) =>
  useEditStore((s) => s.fractal.dynamic.coloring[index]);
