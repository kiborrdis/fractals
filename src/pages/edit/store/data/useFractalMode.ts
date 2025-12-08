import { useStaticRule } from "./useStaticRule";

export const useFractalMode = () => {
  const [initialZFormula] = useStaticRule("initialZFormula");
  const [initialCFormula] = useStaticRule("initialCFormula");

  if (initialZFormula === "c0" && initialCFormula === "fCoord") {
    return "cplane";
  }
  if (
    (initialZFormula === "fCoord" || initialZFormula === undefined) &&
    (initialCFormula === "c0" || initialCFormula === undefined)
  ) {
    return "zplane";
  }
  return "custom";
};
