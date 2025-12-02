import { Vector2 } from "@/shared/libs/vectors";
import { FractalCanvasParams } from "./initFractalCanvas";

export const prepareCanvasToRender = (
  {
    context,
    pos_vertex_attr_array,
    uniforms: { resolution_u2f },
    shaderProgram,
    positionBuffer,
  }: FractalCanvasParams,
  canvasSize: Vector2,
) => {
  context.viewport(0, 0, ...canvasSize);
  context.clearColor(1, 1, 1, 1);
  context.clear(context.COLOR_BUFFER_BIT);
  context.enable(context.BLEND);
  context.blendFunc(context.SRC_ALPHA, context.ONE_MINUS_SRC_ALPHA);
  context.useProgram(shaderProgram);

  const positions = [
    0,
    0,
    0,

    0,
    canvasSize[1],
    0,

    canvasSize[0],
    0,
    0,

    ...canvasSize,
    0,

    0,
    canvasSize[1],
    0,

    canvasSize[0],
    0,
    0,
  ];
  context.bindBuffer(context.ARRAY_BUFFER, positionBuffer);

  context.bufferData(
    context.ARRAY_BUFFER,
    new Float32Array(positions),
    context.STATIC_DRAW
  );

  context.enableVertexAttribArray(pos_vertex_attr_array);
  context.uniform2f(
    resolution_u2f,
    context.canvas.width,
    context.canvas.height
  );

  context.bindBuffer(context.ARRAY_BUFFER, positionBuffer);

  context.vertexAttribPointer(
    pos_vertex_attr_array,
    3, // 3 components per iteration
    context.FLOAT, // the data is 32bit floats
    false, // don't normalize the data
    0, // 0 = move forward size * sizeof(type) each iteration to get the next position
    0 // start at the beginning of the buffer
  );
 
  

  const primitiveType = context.TRIANGLES;
  const offset2 = 0;
  const count2 = 6;

  context.drawArrays(primitiveType, offset2, count2);
};
