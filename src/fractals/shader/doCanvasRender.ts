import { FractalCanvasParams } from "./initFractalCanvas";

export const doCanvasRender = ({ context }: FractalCanvasParams) => {
  const primitiveType = context.TRIANGLES;
  const offset2 = 0;
  const count2 = 6;
  context.drawArrays(primitiveType, offset2, count2);
};
