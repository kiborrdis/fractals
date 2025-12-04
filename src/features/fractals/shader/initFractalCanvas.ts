
export const initFractalCanvas = (
  context: WebGL2RenderingContext,
) => {
  const positionBuffer = context.createBuffer();

  context.bindBuffer(context.ARRAY_BUFFER, positionBuffer);

  return {
    context,
    positionBuffer,
  };
};

export type FractalCanvasParams = ReturnType<typeof initFractalCanvas>;
