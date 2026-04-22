import { CalcNodeResultType } from "@/shared/libs/complexVariableFormula/types";
import { fractalFormulaToGLSLCode } from "./fractalFormulaToGLSLCode";
import vertex from "./fractalvertex.glsl?raw";
import fragment from "./fractalmapfragment.glsl?raw";
import {
  createProgram,
  createShader,
  createUniformApplier,
  UniformApplierMemory,
} from "@/shared/libs/webgl";
import {
  formulaVars,
  initialCFormulaVars,
  initialZFormulaVars,
} from "./allowedVars";
import {
  createCameraUniformApplier,
  createMapFractalUniformApplier,
  createMapParamsUniformApplier,
  createResolutionUniformApplier2,
} from "./prepareFractalUniforms";

export const createFractalMapShader = (
  context: WebGL2RenderingContext,
  formula: string,
  customVars: Record<string, CalcNodeResultType>,
  initialZFormula: string = "fCoord",
  initialCFormula: string = "c0",
) => {
  const [glslCodeFormula] = fractalFormulaToGLSLCode(
    formula,
    formulaVars,
    customVars,
  );
  const [glslCodeInitialZFormula] = fractalFormulaToGLSLCode(
    initialZFormula,
    initialZFormulaVars,
    customVars,
  );
  const [glslCodeInitialCFormula] = fractalFormulaToGLSLCode(
    initialCFormula,
    initialCFormulaVars,
    customVars,
  );

  const glslInitialZFormula = `z0 = ${glslCodeInitialZFormula};`;
  const glslInitialCFormula = `c = ${glslCodeInitialCFormula};`;
  const glslFractalFormula = `z = ${glslCodeFormula};`;

  const vertexShader = createShader(context, context.VERTEX_SHADER, vertex);
  const shaderText = fragment
    .replace("//@FORMULA_PLACEHOLDER@", glslFractalFormula)
    .replace("//@INITIAL_Z_FORMULA_PLACEHOLDER@", glslInitialZFormula)
    .replace("//@INITIAL_C_FORMULA_PLACEHOLDER@", glslInitialCFormula)
    .replace(
      "//@CUSTOM_VARS_DECLARATION_PLACEHOLDER@",
      Object.keys(customVars)
        .map(
          (varName) =>
            `uniform ${
              customVars[varName] === "vector2" ? "vec2" : "float"
            } u_cstm_${varName};`,
        )
        .join("\n"),
    );

  const fragmentShader = createShader(
    context,
    context.FRAGMENT_SHADER,
    shaderText,
  );

  const shaderProgram = createProgram(context, vertexShader, fragmentShader);

  if (!shaderProgram) {
    throw new Error("Shader program is undefined");
  }

  const memory = new UniformApplierMemory();

  const applyCameraParams = createCameraUniformApplier(
    context,
    shaderProgram,
    memory,
  );
  const applyResolutionParams = createResolutionUniformApplier2(
    context,
    shaderProgram,
    memory,
  );
  const applyCustomVars = createUniformApplier<Record<string, unknown>>(
    context,
    shaderProgram,
    memory,
    Object.keys(customVars).map((varName) => {
      const type = customVars[varName] === "vector2" ? "2f" : "1f";

      if (type === "2f") {
        return [
          "2f",
          `u_cstm_${varName}`,
          (data) => (data[varName] as [number, number]) ?? null,
        ] as const;
      }

      if (type === "1f") {
        return [
          "1f",
          `u_cstm_${varName}`,
          (data) => (data[varName] as number) ?? null,
        ] as const;
      }

      return [
        type,
        `u_cstm_${varName}`,
        (data) => data[varName] ?? null,
      ] as const;
    }),
  );

  return {
    program: shaderProgram,
    applyMapFractalParams: createMapFractalUniformApplier(
      context,
      shaderProgram,
      memory,
    ),
    applyMapParams: createMapParamsUniformApplier(context, shaderProgram, memory),
    applyCameraParams,
    applyResolutionParams,
    applyCustomVars,
    cleanup: () => {
      context.deleteProgram(shaderProgram);

      if (vertexShader) {
        context.deleteShader(vertexShader);
      }
      if (fragmentShader) {
        context.deleteShader(fragmentShader);
      }
    },
  };
};

export type FractalMapShader = ReturnType<typeof createFractalMapShader>;
