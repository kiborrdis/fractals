import { CalcNodeResultType } from "../formula/types";
import { fractalFormulaToGLSLCode } from "./fractalFormulaToGLSLCode";
import vertex from "./vertexshader.glsl?raw";
import fragment from "./fragmentshader.glsl?raw";
import { createProgram, createShader } from "@/shared/libs/webgl";
import { setupUniformLocations } from "./prepareFractalUniforms";
import { VarNameToTypeMap } from "../formula/fnAndVarDescr";

const formulaVars: VarNameToTypeMap = {
  z: "vector2",
  c: "vector2",
  fCoord: "vector2",
};

const initialZFormulaVars: VarNameToTypeMap = {
  c0: "vector2",
  fCoord: "vector2",
};

const initialCFormulaVars: VarNameToTypeMap = {
  c0: "vector2",
  fCoord: "vector2",
};

export const createFractalShader = (
  context: WebGL2RenderingContext,
  formula: string,
  customVars: Record<string, CalcNodeResultType>,
  initialZFormula: string = "fCoord",
  initialCFormula: string = "c0",
) => {
  const [glslCodeFormula, pow] = fractalFormulaToGLSLCode(formula, formulaVars, customVars);
  const [glslCodeInitialZFormula] = fractalFormulaToGLSLCode(initialZFormula, initialZFormulaVars, customVars);
  const [glslCodeInitialCFormula] = fractalFormulaToGLSLCode(initialCFormula, initialCFormulaVars, customVars);

  const powPlaceholder = pow >= 2 ? `powZ = ${pow}.0;` : "";
  const glslInitialZFormula = `z0 = ${glslCodeInitialZFormula};`;
  const glslInitialCFormula = `c = ${glslCodeInitialCFormula};`;
  const glslFractalFormula = `z = ${glslCodeFormula};`;

  const vertexShader = createShader(context, context.VERTEX_SHADER, vertex);
  const shaderText = fragment
    .replace("//@FORMULA_PLACEHOLDER@", glslFractalFormula)
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

  return {
    program: shaderProgram,
    pos_vertex_attr_array,
    uniforms: setupUniformLocations(context, shaderProgram),
  };
};

export type FractalShaderDescrition = ReturnType<typeof createFractalShader>;
