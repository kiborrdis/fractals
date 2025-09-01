import { createProgram, createShader } from "./canvasUtils";
import vertex from "./vertexshader.glsl?raw";
import fragment from "./fragmentshader.glsl?raw";
import { Vector2 } from "../types";
import { setupUniformLocations } from "./prepareFractalUniforms";
import { CalcNode, CalcNodeType } from "../../formula/CalcNode";
import { parseFormula } from "../../formula/parseFormula";

const transformToGLSLCode = (node: CalcNode): string => {
  switch (node.t) {
    case CalcNodeType.Number:
      return String(node.v).includes('.') ? String(node.v) : `${String(node.v)}.0`;
    case CalcNodeType.Variable:
      return `${node.v}`;
    case CalcNodeType.Operation:
      return `${operationToFnMap[node.v]}(${transformToGLSLCode(
        node.c[0]
      )}, ${transformToGLSLCode(node.c[1])})`;
    case CalcNodeType.FuncCall:
      return `${node.n}(${node.o.map(transformCalcNodeToString).join(", ")})`;
    case CalcNodeType.Error:
      throw new Error("CalcNodeError met during GLSL code generation");
  }
};

const operationToFnMap: Record<string, string> = {
  "+": "complexAdd",
  "-": "complexSub",
  "*": "complexMul",
  "/": "complexDiv",
  "^": "complexPow"
};

const transformCalcNodeToString = (node: CalcNode): string => {
  switch (node.t) {
    case CalcNodeType.Number:
      return node.v.toString();
    case CalcNodeType.Variable:
      return `${node.v}`;
    case CalcNodeType.Operation:
      return `(${transformCalcNodeToString(node.c[0])}${
        node.v
      }${transformCalcNodeToString(node.c[1])})`;
    case CalcNodeType.FuncCall:
      return `${node.n}(${node.o.map(transformCalcNodeToString).join(", ")})`;
    case CalcNodeType.Error:
      return `Error: ${node.expT}`;
  }
};
export const initFractalCanvas = (
  formula: string,
  canvas: HTMLCanvasElement,
  canvasSize: Vector2
) => {
  const context = canvas.getContext("webgl");

  if (!context) {
    throw new Error("2d context initialization failed");
  }

  context.flush();
  const calcNode = parseFormula(formula);
  const glslFormula = `z = ${transformToGLSLCode(calcNode)};`;
  const vertexShader = createShader(context, context.VERTEX_SHADER, vertex);
  const fragmentShader = createShader(
    context,
    context.FRAGMENT_SHADER,
    fragment.replace("//@FORMULA_PLACEHOLDER@", glslFormula)
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
