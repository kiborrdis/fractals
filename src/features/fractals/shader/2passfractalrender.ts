import { FractalParams, Vector2 } from "../types";
import { FractalCanvasParams } from "./initFractalCanvas";
import {
  loadFractalTexture,
  loadIterDataTexture,
  loadTexture,
} from "./texture";

export const prepareCanvasToRender = (
  {
    context,
    pos_vertex_attr_array,
    uniforms: { resolution_u2f },
    shaderProgram,
    coloringProgram,
    positionBuffer,
  }: FractalCanvasParams,
  canvasSize: Vector2,
  params: FractalParams
) => {
  context.viewport(0, 0, ...canvasSize);
  context.clearColor(1, 1, 1, 1);
  context.clear(context.COLOR_BUFFER_BIT);
  // context.enable(context.BLEND);
  // context.blendFunc(context.SRC_ALPHA, context.ONE_MINUS_SRC_ALPHA);
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
  // const fb = context.createFramebuffer();
  // context.bindFramebuffer(context.FRAMEBUFFER, fb);

  // const colorTexture = context.createTexture();
  // context.bindTexture(context.TEXTURE_2D, colorTexture);
  // context.texImage2D(
  //   context.TEXTURE_2D,
  //   0,
  //   context.RGBA,
  //   ...canvasSize,
  //   0,
  //   context.RGBA,
  //   context.UNSIGNED_BYTE,
  //   null
  // );
  // context.texParameteri(
  //   context.TEXTURE_2D,
  //   context.TEXTURE_MIN_FILTER,
  //   context.LINEAR
  // );
  // context.framebufferTexture2D(
  //   context.FRAMEBUFFER,
  //   context.COLOR_ATTACHMENT0,
  //   context.TEXTURE_2D,
  //   colorTexture,
  //   0
  // );

  

  const primitiveType = context.TRIANGLES;
  const offset2 = 0;
  const count2 = 6;
  context.drawArrays(primitiveType, offset2, count2);
  const pixels = new Uint8Array(canvasSize[0] * canvasSize[1] * 4);
  context.readPixels(
    0,
    0,
    ...canvasSize,
    context.RGBA,
    context.UNSIGNED_BYTE,
    pixels
  );

  const iterMinMax: Record<number, Vector2> = {};
  const uPixels: number[] = [];
  for (let i = 0; i < pixels.length; i += 4) {
    const iter0 = pixels[i];
    const iter1 = pixels[i + 1];
    const iter = iter0 + iter1 * 255;
    const distToR = pixels[i + 2] + pixels[i + 3] * 255;

    if (iter === 2) {
      uPixels.push(distToR);
    }

    if (!iterMinMax[iter]) {
      iterMinMax[iter] = [distToR, distToR];
    } else {
      iterMinMax[iter][0] = Math.min(iterMinMax[iter][0], distToR);
      iterMinMax[iter][1] = Math.max(iterMinMax[iter][1], distToR);
    }
  }

  console.log(iterMinMax);

  context.viewport(0, 0, ...canvasSize);
  context.clearColor(1, 1, 1, 0.0);
  context.clear(context.COLOR_BUFFER_BIT);
  context.useProgram(coloringProgram);

  context.activeTexture(context.TEXTURE1);
  context.bindTexture(
    context.TEXTURE_2D,
    loadTexture(context, params.gradient)
  );
  context.uniform1i(context.getUniformLocation(coloringProgram, "uSampler"), 1);
  context.uniform1i(
    context.getUniformLocation(coloringProgram, "u_sampler_wl"),
    params.gradient.length
  );

  context.activeTexture(context.TEXTURE2);
  context.bindTexture(
    context.TEXTURE_2D,
    loadIterDataTexture(context, iterMinMax, params.dynamic.maxIterations)
  );
  context.uniform1i(
    context.getUniformLocation(coloringProgram, "uSamplerIterData"),
    2
  );

  context.activeTexture(context.TEXTURE3);
  context.bindTexture(
    context.TEXTURE_2D,
    loadFractalTexture(context, pixels, canvasSize)
  );
  context.uniform1i(
    context.getUniformLocation(coloringProgram, "uSamplerFractal"),
    3
  );

  context.uniform1i(
    context.getUniformLocation(coloringProgram, "u_max_iterations"),
    params.dynamic.maxIterations
  );

  const positions2 = [
    0,
    0,
    -1,

    0,
    canvasSize[1],
    -1,

    canvasSize[0],
    0,
    -1,

    ...canvasSize,
    -1,

    0,
    canvasSize[1],
    -1,

    canvasSize[0],
    0,
    -1,
  ];

  const positionBuffer2 = context.createBuffer();

  context.bindBuffer(context.ARRAY_BUFFER, positionBuffer2);

  context.bufferData(
    context.ARRAY_BUFFER,
    new Float32Array(positions2),
    context.STATIC_DRAW
  );

  context.enableVertexAttribArray(
    context.getAttribLocation(coloringProgram, "a_position")
  );
  context.uniform2f(
    context.getUniformLocation(coloringProgram, "u_resolution"),
    context.canvas.width,
    context.canvas.height
  );

  context.vertexAttribPointer(
    context.getAttribLocation(coloringProgram, "a_position"),
    3,
    context.FLOAT,
    false,
    0,
    0
  );

  context.drawArrays(primitiveType, 0, 6);
};
