import { GraphFractalBackground } from "@/features/fractals/GraphBackground";
import { Vector2 } from "@/shared/libs/vectors";
import {
  formulaVars,
  GradientStop,
  parseFormula,
  validateFormula,
} from "@/features/fractals";
import { useMemo } from "react";
import { useFractalFormula } from "../stores/editStore/data/useFractalFormula";

const BACKGROUND_GRADIENT: GradientStop[] = [
  [0, 0, 0, 0, 1.0],
  [10, 0, 0.16862745098039217, 0.050980392156862744, 1.0],
  [30, 0.07450980392156863, 0.3686274509803922, 0.1607843137254902, 1.0],
  [40, 0.20784313725490197, 0.6313725490196078, 0.3333333333333333, 1.0],
  [70, 0.36470588235294116, 0.6509803921568628, 0.45098039215686275, 1.0],
  [99, 0.6274509803921569, 0.7294117647058823, 0.6549019607843137, 1.0],
  [100, 0.14901960784313725, 0.14901960784313725, 0.14901960784313725, 1.0],
];

export const GraphFractalMap = ({
  c,
  priority,
}: {
  c: Vector2;
  priority?: number;
}) => {
  const formula = useFractalFormula();

  const canRender = useMemo(() => {
    try {
      const node = parseFormula(formula);
      const [valid] = validateFormula(node, new Set(Object.keys(formulaVars)));

      return valid;
    } catch {
      return false;
    }
  }, [formula]);

  // Return null if formula has custom variables
  if (!canRender) {
    return null;
  }

  return (
    <GraphFractalBackground
      priority={priority}
      c={c}
      formula={formula}
      gradient={BACKGROUND_GRADIENT}
    />
  );
};
