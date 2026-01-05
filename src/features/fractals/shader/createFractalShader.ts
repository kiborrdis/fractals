import { CalcNodeResultType } from "@/shared/libs/complexVariableFormula/types";
import { fractalFormulaToGLSLCode } from "./fractalFormulaToGLSLCode";
import vertex from "./fractalvertex.glsl?raw";
import fragment from "./fractalfragment.glsl?raw";
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
import { parseFormula } from "@/shared/libs/complexVariableFormula/parseFormula";
import { CalcNodeType, simplify } from "@/shared/libs/complexVariableFormula";
import { derivative } from "../formula/derivative";
import {
  createCameraUniformApplier,
  createFractalUniformApplier,
  createResolutionUniformApplier,
} from "./prepareFractalUniforms";

export const createFractalShader = (
  context: WebGL2RenderingContext,
  formula: string,
  customVars: Record<string, CalcNodeResultType>,
  initialZFormula: string = "fCoord",
  initialCFormula: string = "c0",
) => {
  const [glslCodeFormula, pow] = fractalFormulaToGLSLCode(
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

  const [glslCodeDerivative] = fractalFormulaToGLSLCode(
    formula,
    { ...formulaVars, dz: "vector2" },
    customVars,
    (formula: string) => {
      const node = simplify(derivative(parseFormula(formula)));

      if (node.t === CalcNodeType.Error) {
        throw new Error("Derivative formula must result in an error node");
      }

      return node;
    },
  );
  let powPlaceholder = "";

  if (pow >= 2) {
    powPlaceholder = `powZ = ${pow}.0;`;

    if (pow !== Math.ceil(pow)) {
      powPlaceholder = `powZ = ${pow};`;
    } else {
      powPlaceholder = `powZ = ${pow}.0;`;
    }
  }

  const glslInitialZFormula = `z0 = ${glslCodeInitialZFormula};`;
  const glslInitialCFormula = `c = ${glslCodeInitialCFormula};`;
  const glslFractalFormula = `z = ${glslCodeFormula};`;
  const glslDerivFormula = `dz = ${glslCodeDerivative};`;

  const vertexShader = createShader(context, context.VERTEX_SHADER, vertex);
  const shaderText = fragment
    .replace("//@FORMULA_PLACEHOLDER@", glslFractalFormula)
    .replace("//@FORMULA_DERIVATIVE_PLACEHOLDER@", glslDerivFormula)
    .replace("//@INITIAL_Z_FORMULA_PLACEHOLDER@", glslInitialZFormula)
    .replace("//@INITIAL_C_FORMULA_PLACEHOLDER@", glslInitialCFormula)
    .replace("//@FORMULA_POW_PLACEHOLDER@", powPlaceholder)
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
  const pos_vertex_attr_array = context.getAttribLocation(
    shaderProgram,
    "a_position",
  );

  const memory = new UniformApplierMemory();
  const applyFractalParams = createFractalUniformApplier(
    context,
    shaderProgram,
    memory,
  );
  const applyCameraParams = createCameraUniformApplier(
    context,
    shaderProgram,
    memory,
  );
  const applyResolutionParams = createResolutionUniformApplier(
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
    pos_vertex_attr_array,
    applyFractalParams,
    applyCameraParams,
    applyResolutionParams,
    applyCustomVars,
  };
};

export type FractalShaderDescrition = ReturnType<typeof createFractalShader>;
