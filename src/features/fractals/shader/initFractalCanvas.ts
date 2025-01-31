import vertex from "./vertexshader.glsl?raw";
import fragment from "./fragmentshader.glsl?raw";

import { setupUniformLocations } from "./prepareFractalUniforms";
import { fractalFormulaToGLSLCode } from "./fractalFormulaToGLSLCode";
import { createProgram, createShader } from "@/shared/libs/webgl";

export const initFractalCanvas = (
  formula: string,
  canvas: HTMLCanvasElement,
) => {
  const context = canvas.getContext("webgl", { antialias: true });

  if (!context) {
    throw new Error("2d context initialization failed");
  }

  context.flush();
  const [glslCodeFormula, pow] = fractalFormulaToGLSLCode(formula);

  const powPlaceholder = pow >= 2 ? `powZ = ${pow}.0;` : "";
  const glslFormula = `z = ${glslCodeFormula};`;
  const vertexShader = createShader(context, context.VERTEX_SHADER, vertex);
  const fragmentShader = createShader(
    context,
    context.FRAGMENT_SHADER,
    fragment
      .replace("//@FORMULA_PLACEHOLDER@", glslFormula)
      .replace("//@FORMULA_POW_PLACEHOLDER@", powPlaceholder)
  );

  const shaderProgram = createProgram(context, vertexShader, fragmentShader);

  if (!shaderProgram) {
    throw new Error("Shader program is undefined");
  }

  const positionBuffer = context.createBuffer();

  context.bindBuffer(context.ARRAY_BUFFER, positionBuffer);

  const pos_vertex_attr_array = context.getAttribLocation(
    shaderProgram,
    "a_position"
  );

  return {
    context,
    pos_vertex_attr_array,
    uniforms: setupUniformLocations(context, shaderProgram),
    positionBuffer,
    shaderProgram,
  };
};

export type FractalCanvasParams = ReturnType<typeof initFractalCanvas>;
