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
    private formula: string,
    private params: FractalParamsBuildRules,
  ) {
    this.shader = createFractalShader(
      this.context,
      this.formula,
      convertCustomVarsToTypes(params.custom),
    );
  }

  updateParams(newParams: FractalParamsBuildRules) {
    if (
      Object.keys(newParams.custom).length !==
      Object.keys(this.params.custom).length
    ) {
      this.shader = createFractalShader(
        this.context,
        this.formula,
        convertCustomVarsToTypes(newParams.custom),
      );
    }

    this.params = newParams;
  }

  getRenderData(time: number) {
    return [
      this.shader,
      makeFractalParamsFromRules(this.params, time),
    ] as const;
  }
}
