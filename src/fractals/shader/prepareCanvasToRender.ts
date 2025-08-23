import { Vector2 } from "../types";
import { FractalCanvasParams } from "./initFractalCanvas";

export const prepareCanvasToRender = (
  {
    context,
    pos_vertex_attr_array,
    uniforms: { resolution_u2f },
    shaderProgram,
    positionBuffer,
  }: FractalCanvasParams,
  canvasSize: Vector2
) => {
  context.viewport(0, 0, ...canvasSize);
  context.clearColor(1, 1, 1, 1);
  context.clear(context.COLOR_BUFFER_BIT);
  context.useProgram(shaderProgram);
  context.enableVertexAttribArray(pos_vertex_attr_array);
  context.uniform2f(
    resolution_u2f,
    context.canvas.width,
    context.canvas.height
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
    offset
  );
};
