import { Vector2 } from "@/shared/libs/vectors";
import { FractalCanvasParams } from "./initFractalCanvas";
import { FractalShaderDescrition } from "./createFractalShader";
import { FractalParams } from "../types";
import { prepareFractalUniforms } from "./prepareFractalUniforms";

export const renderFractalOnCanvas = (
  { context, positionBuffer }: FractalCanvasParams,
  canvasSize: Vector2,
  shader: FractalShaderDescrition,
  //** @desciption top left and bottom right corners of the area to render. From 0 to 1
  size: readonly [Vector2, Vector2],
  params: FractalParams,
) => {
  context.useProgram(shader.program);

  prepareFractalUniforms(context, shader, params);

  const positions = [
    // First triangle
    // top left
    canvasSize[0] * size[0][0],
    canvasSize[1] * size[0][1],
    0,

    // bottom left
    canvasSize[0] * size[0][0],
    canvasSize[1] * size[1][1],
    0,

    // top right
    canvasSize[0] * size[1][0],
    canvasSize[1] * size[0][1],
    0,

    // Second triangle
    // bottom right
    canvasSize[0] * size[1][0],
    canvasSize[1] * size[1][1],
    0,

    // bottom left
    canvasSize[0] * size[0][0],
    canvasSize[1] * size[1][1],
    0,

    // top right
    canvasSize[0] * size[1][0],
    canvasSize[1] * size[0][1],
    0,
  ];

  const textureCoordBuffer = context.createBuffer();
  context.bindBuffer(context.ARRAY_BUFFER, textureCoordBuffer);

  const textureCoordinates = [
    0.0, 0.0, 0.0, 1.0, 1.0, 0.0,

    1.0, 1.0, 0.0, 1.0, 1.0, 0.0,
  ];

  context.bufferData(
    context.ARRAY_BUFFER,
    new Float32Array(textureCoordinates),
    context.STATIC_DRAW,
  );

  context.bindBuffer(context.ARRAY_BUFFER, textureCoordBuffer);
  context.vertexAttribPointer(
    context.getAttribLocation(shader.program, "a_texture_coord"),
    2, // every coordinate composed of 2 values
    context.FLOAT, // the data in the buffer is 32-bit float
    false, // don't normalize
    0, // how many bytes to get from one set to the next
    0, // how many bytes inside the buffer to start from
  );
  context.enableVertexAttribArray(
    context.getAttribLocation(shader.program, "a_texture_coord"),
  );

  context.bindBuffer(context.ARRAY_BUFFER, positionBuffer);

  context.bufferData(
    context.ARRAY_BUFFER,
    new Float32Array(positions),
    context.STATIC_DRAW,
  );

  context.enableVertexAttribArray(shader.pos_vertex_attr_array);
  context.uniform2f(
    shader.uniforms.resolution_u2f,
    canvasSize[0],
    canvasSize[1],
  );

  context.uniform2f(
    shader.uniforms.resolution2_u2f,
    (size[1][0] - size[0][0]) * canvasSize[0],
    (size[1][1] - size[0][1]) * canvasSize[1],
  );

  context.bindBuffer(context.ARRAY_BUFFER, positionBuffer);

  context.vertexAttribPointer(
    shader.pos_vertex_attr_array,
    3, // 3 components per iteration
    context.FLOAT, // the data is 32bit floats
    false, // don't normalize the data
    0, // 0 = move forward size * sizeof(type) each iteration to get the next position
    0, // start at the beginning of the buffer
  );

  const primitiveType = context.TRIANGLES;
  const offset2 = 0;
  const count2 = 6;

  context.drawArrays(primitiveType, offset2, count2);
};
