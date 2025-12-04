import vertex from "./vertexshader.glsl?raw";
import fragment from "./fragmentshader.glsl?raw";
import { useEffect, useState } from "react";
import { createProgram, createShader } from "@/shared/libs/webgl";
import { DisplayCanvas } from "@/shared/ui/DisplayCanvas/DisplayCanvas";
import { Vector2 } from "@/shared/libs/vectors";

const toTriangleMatrix: Vector2[] = [
  [0.6641741461862876, -0.7475778912847248], // 1, 0
  [0.7475778912847248, 0.6641741461862876], // 0, 1
];

const toBasisMatrix: Vector2[] = [
  [0.6641741461862876, 0.7475778912847248], // 1, 0
  [-0.7475778912847248, 0.6641741461862876], // 0, 1
];
const rotate = (angle: number, vector: Vector2): Vector2 => {
  const cos = Math.cos((angle * 180) / Math.PI);
  const sin = Math.sin((angle * 180) / Math.PI);
  return [vector[0] * cos - vector[1] * sin, vector[0] * sin + vector[1] * cos];
};

const matrixMultiply = (matrix: Vector2[], vector: Vector2): Vector2 => {
  return [
    matrix[0][0] * vector[0] + matrix[0][1] * vector[1],
    matrix[1][0] * vector[0] + matrix[1][1] * vector[1],
  ];
};

export const Simulation = () => {
  console.log("x", rotate(60, [1, 0]));
  console.log("y", rotate(60, [0, 1]));

  console.log("res", matrixMultiply(toTriangleMatrix, [1, 0]));
  console.log("res2", matrixMultiply(toTriangleMatrix, [0, 1]));

  console.log("res", matrixMultiply(toTriangleMatrix, [1, 0]));
  console.log("res2", matrixMultiply(toTriangleMatrix, [0, 1]));
  console.log(
    "res3",
    matrixMultiply(toBasisMatrix, matrixMultiply(toTriangleMatrix, [1, 0])),
  );
  console.log(
    "res4",
    matrixMultiply(toBasisMatrix, matrixMultiply(toTriangleMatrix, [0, 1])),
  );
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!canvas) return;
    const params = initCanvas(canvas, [600, 600]);
    renderCanvas(params, [600, 600]);
  }, [canvas]);

  const [texts, setTexts] = useState(["Light", "Dark"]);

  return (
    <>
      <button
        onClick={() => {
          setTexts((t) =>
            t[0] === "Light" ? ["Dark", "Light"] : ["Light", "Dark"],
          );
        }}
      >
        switch
      </button>
      {texts.map((t) => (
        <Test key={t} text={t} />
      ))}
      <DisplayCanvas width={600} height={600} ref={setCanvas} />
    </>
  );
};

const Test = ({ text }: { text: string }) => {
  const [t, setT] = useState(false);

  return (
    <div
      onClick={() => setT(!t)}
      style={{
        padding: 8,
        backgroundColor: t ? "green" : "red",
        color: "white",
      }}
    >
      {text}
    </div>
  );
};

const initCanvas = (canvas: HTMLCanvasElement, canvasSize: Vector2) => {
  const context = canvas.getContext("webgl");

  if (!context) {
    throw new Error("2d context initialization failed");
  }

  const vertexShader = createShader(context, context.VERTEX_SHADER, vertex);
  const fragmentShader = createShader(
    context,
    context.FRAGMENT_SHADER,
    fragment,
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
    context.STATIC_DRAW,
  );

  const positionAttributeLocation = context.getAttribLocation(
    shaderProgram,
    "a_position",
  );

  const resolutionUniformLocation = context.getUniformLocation(
    shaderProgram,
    "u_resolution",
  );

  return {
    context,
    pos_vertex_attr_array: positionAttributeLocation,
    resolution_u2f: resolutionUniformLocation,
    positionBuffer,
    shaderProgram,
  };
};

type CanvasParams = ReturnType<typeof initCanvas>;

const renderCanvas = (
  {
    context,
    pos_vertex_attr_array,
    resolution_u2f,
    positionBuffer,
    shaderProgram,
  }: CanvasParams,
  res: Vector2,
) => {
  context.viewport(0, 0, ...res);
  context.clearColor(1, 1, 1, 1);
  context.clear(context.COLOR_BUFFER_BIT);
  context.useProgram(shaderProgram);
  context.enableVertexAttribArray(pos_vertex_attr_array);
  context.uniform2f(
    resolution_u2f,
    context.canvas.width,
    context.canvas.height,
  );

  context.bindBuffer(context.ARRAY_BUFFER, positionBuffer);

  const size = 2; // 2 components per iteration
  const type = context.FLOAT; // the data is 32bit floats
  const normalize = false; // don't normalize the data
  const stride = 0; // 0 = move forward size * sizeof(type) each iteration to get the next position
  const offset = 0; // start at the beginning of the buffer
  context.vertexAttribPointer(
    pos_vertex_attr_array,
    size,
    type,
    normalize,
    stride,
    offset,
  );
  const primitiveType = context.TRIANGLES;
  const offset2 = 0;
  const count2 = 6;
  context.drawArrays(primitiveType, offset2, count2);
};
