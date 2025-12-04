import { CalcNodeResultType } from "../formula/types";
import { fractalFormulaToGLSLCode } from "./fractalFormulaToGLSLCode";
import vertex from "./vertexshader.glsl?raw";
import fragment from "./fragmentshader.glsl?raw";
import { createProgram, createShader } from "@/shared/libs/webgl";
import { setupUniformLocations } from "./prepareFractalUniforms";

export const createFractalShader = (
  context: WebGL2RenderingContext,
  formula: string,
  customVars: Record<string, CalcNodeResultType>
) => {
  const [glslCodeFormula, pow] = fractalFormulaToGLSLCode(formula, customVars);

  const powPlaceholder = pow >= 2 ? `powZ = ${pow}.0;` : "";
  const glslFormula = `z = ${glslCodeFormula};`;
  const vertexShader = createShader(context, context.VERTEX_SHADER, vertex);

  const fragmentShader = createShader(
    context,
    context.FRAGMENT_SHADER,
    fragment
      .replace("//@FORMULA_PLACEHOLDER@", glslFormula)
      .replace("//@FORMULA_POW_PLACEHOLDER@", powPlaceholder)
      .replace(
        "//@CUSTOM_VARS_DECLARATION_PLACEHOLDER@",
        Object.keys(customVars)
          .map(
            (varName) =>
              `uniform ${
                customVars[varName] === "vector2" ? "vec2" : "float"
              } u_cstm_${varName};`
          )
          .join("\n")
      )
  );

  const shaderProgram = createProgram(context, vertexShader, fragmentShader);

  if (!shaderProgram) {
    throw new Error("Shader program is undefined");
  }
  const pos_vertex_attr_array = context.getAttribLocation(
    shaderProgram,
    "a_position"
  );

  return {
    program: shaderProgram,
    pos_vertex_attr_array,
    uniforms: setupUniformLocations(context, shaderProgram),
  };
};

export type FractalShaderDescrition = ReturnType<typeof createFractalShader>;