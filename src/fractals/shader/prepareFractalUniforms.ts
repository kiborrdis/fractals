import { FractalCanvasParams } from "./initFractalCanvas";
import { FractalParams } from "../types";

export const prepareFractalUniforms = (
  {
    context,
    colorEnd_u3f,
    colorStart_u3f,
    colorOverflow_u3f,
    fractalC_u2f,
    fractalR_u1f,
    linearSplit_u1f,
    radialSplit_u1f,
    radialSplitAngleBaseVector_u2f,
    fractalRRangeStart_u2f,
    fractalRRangeEnd_u2f,
    maxIterations_u1f,
    mirror_u1i,
    time_u1f,
    linearSplitPerDistChange_u2f,
    radialSplitPerDistChange_u2f,
    cxSplitPerDistChange_u2f,
    cySplitPerDistChange_u2f,
    rSplitPerDistChange_u2f,
    iterationsSplitPerDistChange_u2f,
    invertLocation_u1i,
  }: FractalCanvasParams,
  {
    colorStart,
    colorEnd,
    colorOverflow,
    splitNumber,
    time,
    c,
    r,
    rRangeStart,
    rRangeEnd,
    invert,
    mirror = true, // Default to true if not provided
    maxIterations,
    linearSplitPerDistChange = [0, 0],
    radialSplitPerDistChange = [0, 0],
    cxSplitPerDistChange = [0, 0],
    cySplitPerDistChange = [0, 0],
    rSplitPerDistChange = [0, 0],
    iterationsSplitPerDistChange = [0, 0],
    angularSplitNumber,
  }: FractalParams
) => {
  context.uniform3f(colorStart_u3f, ...colorStart);
  context.uniform3f(colorEnd_u3f, ...colorEnd);
  context.uniform3f(colorOverflow_u3f, ...colorOverflow);

  context.uniform1f(linearSplit_u1f, splitNumber);
  context.uniform1f(radialSplit_u1f, angularSplitNumber);
  context.uniform2f(radialSplitAngleBaseVector_u2f, ...[1, 0]);

  context.uniform1f(maxIterations_u1f, maxIterations);
  context.uniform1f(time_u1f, time);

  context.uniform1f(fractalR_u1f, r);
  context.uniform2f(fractalC_u2f, ...c);

  context.uniform2f(fractalRRangeStart_u2f, ...rRangeStart);
  context.uniform2f(fractalRRangeEnd_u2f, ...rRangeEnd);

  context.uniform1i(mirror_u1i, mirror ? 1 : 0);

  context.uniform2f(linearSplitPerDistChange_u2f, ...linearSplitPerDistChange);
  context.uniform2f(radialSplitPerDistChange_u2f, ...radialSplitPerDistChange);
  context.uniform2f(cxSplitPerDistChange_u2f, ...cxSplitPerDistChange);
  context.uniform2f(cySplitPerDistChange_u2f, ...cySplitPerDistChange);
  context.uniform2f(rSplitPerDistChange_u2f, ...rSplitPerDistChange);
  context.uniform2f(iterationsSplitPerDistChange_u2f, ...iterationsSplitPerDistChange);
  context.uniform1i(invertLocation_u1i, invert ? 1 : 0);
};
