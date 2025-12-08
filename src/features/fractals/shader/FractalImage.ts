import { makeFractalParamsFromRules } from "../ruleConversion";
import { FractalParamsBuildRules } from "../types";
import {
  createFractalShader,
  FractalShaderDescrition,
} from "./createFractalShader";

const convertCustomVarsToTypes = (customVars: Record<string, unknown>) => {
  return Object.entries(customVars).reduce(
    (acc, [key, val]) => {
      acc[key] = Array.isArray(val) ? "vector2" : "number";
      return acc;
    },
    {} as Record<string, "number" | "vector2">,
  );
};

export class FractalImage {
  private shader: FractalShaderDescrition;

  constructor(
    private context: WebGL2RenderingContext,
    private params: FractalParamsBuildRules,
  ) {
    this.shader = createFractalShader(
      this.context,
      params.formula,
      convertCustomVarsToTypes(params.custom),
      params.initialZFormula,
      params.initialCFormula,
    );
  }

  updateParams(newParams: FractalParamsBuildRules) {
    if (
      Object.keys(newParams.custom).length !==
      Object.keys(this.params.custom).length ||
      this.params.formula !== newParams.formula ||
      this.params.initialCFormula !== newParams.initialCFormula ||
      this.params.initialZFormula !== newParams.initialZFormula
    ) {
      this.shader = createFractalShader(
        this.context,
        newParams.formula,
        convertCustomVarsToTypes(newParams.custom),
        newParams.initialZFormula,
        newParams.initialCFormula,
      );
    }

    this.params = newParams;
  }

  getRenderData(time: number) {
    return [
      this.shader,
      makeFractalParamsFromRules(this.params, time + (this.params.initialTime ?? 0)),
    ] as const;
  }
}
