import { createProgram, createShader } from "./canvasUtils";
import vertex from "./vertexshader.glsl?raw";
import fragment from "./fragmentshader.glsl?raw";
import { Vector2 } from "../types";
import { setupUniformLocations } from "./prepareFractalUniforms";

export const initFractalCanvas = (
  canvas: HTMLCanvasElement,
  canvasSize: Vector2
) => {
  const context = canvas.getContext("webgl");

  if (!context) {
    throw new Error("2d context initialization failed");
  }

  context.flush();

  const vertexShader = createShader(context, context.VERTEX_SHADER, vertex);
  const fragmentShader = createShader(
    context,
    context.FRAGMENT_SHADER,
    fragment
  );

  const shaderProgram = createProgram(context, vertexShader, fragmentShader);

  if (!shaderProgram) {
    throw new Error("Shader program is undefined");
  }

  const positionBuffer = context.createBuffer();

  context.bindBuffer(context.ARRAY_BUFFER, positionBuffer);

  const positions = [
    0,
    0,
    0,
    canvasSize[1],
    canvasSize[0],
    0,
    ...canvasSize,
    0,
    canvasSize[1],
    canvasSize[0],
    0,
  ];
  context.bufferData(
    context.ARRAY_BUFFER,
    new Float32Array(positions),
    context.STATIC_DRAW
  );

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


