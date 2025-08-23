import { FractalCanvasParams } from "./initFractalCanvas";
import { FractalParams } from "../types";

export const prepareFractalUniforms = (
  {
    context,
    uniforms: {
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
      hexMirroringDistChange_u2f,
      hexMirroringFactor_u1f,
    },
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
    hexMirroringFactor,
    hexMirroringPerDistChange,
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
  context.uniform2f(
    iterationsSplitPerDistChange_u2f,
    ...iterationsSplitPerDistChange
  );
  context.uniform1i(invertLocation_u1i, invert ? 1 : 0);
  context.uniform1f(hexMirroringFactor_u1f, hexMirroringFactor);
  context.uniform2f(hexMirroringDistChange_u2f, ...hexMirroringPerDistChange);
};

export function setupUniformLocations(
  context: WebGLRenderingContext,
  shaderProgram: WebGLProgram
) {
  const resolution_u2f = context.getUniformLocation(
    shaderProgram,
    "u_resolution"
  );

  const colorStart_u3f = context.getUniformLocation(
    shaderProgram,
    "u_color_start"
  );
  const colorEnd_u3f = context.getUniformLocation(shaderProgram, "u_color_end");
  const colorOverflow_u3f = context.getUniformLocation(
    shaderProgram,
    "u_color_overflow"
  );

  const fractalC_u2f = context.getUniformLocation(shaderProgram, "u_fractal_c");
  const fractalR_u1f = context.getUniformLocation(shaderProgram, "u_fractal_r");

  const time_u1f = context.getUniformLocation(shaderProgram, "u_time");

  const fractalRRangeStart_u2f = context.getUniformLocation(
    shaderProgram,
    "u_fractal_r_range_start"
  );
  const fractalRRangeEnd_u2f = context.getUniformLocation(
    shaderProgram,
    "u_fractal_r_range_end"
  );
  const mirror_u1i = context.getUniformLocation(shaderProgram, "u_mirror");

  const linearSplitPerDistChange_u2f = context.getUniformLocation(
    shaderProgram,
    "u_linear_split_per_dist_change"
  );
  const radialSplitPerDistChange_u2f = context.getUniformLocation(
    shaderProgram,
    "u_radial_split_per_dist_change"
  );
  const cxSplitPerDistChange_u2f = context.getUniformLocation(
    shaderProgram,
    "u_cx_split_per_dist_change"
  );
  const cySplitPerDistChange_u2f = context.getUniformLocation(
    shaderProgram,
    "u_cy_split_per_dist_change"
  );
  const rSplitPerDistChange_u2f = context.getUniformLocation(
    shaderProgram,
    "u_r_split_per_dist_change"
  );
  const iterationsSplitPerDistChange_u2f = context.getUniformLocation(
    shaderProgram,
    "u_iterations_split_per_dist_change"
  );

  const linearSplit_u1f = context.getUniformLocation(
    shaderProgram,
    "u_linear_split"
  );
  const radialSplit_u1f = context.getUniformLocation(
    shaderProgram,
    "u_radial_split"
  );
  const radialSplitAngleBaseVector_u2f = context.getUniformLocation(
    shaderProgram,
    "u_radial_split_angle_base_vector"
  );
  const maxIterations_u1f = context.getUniformLocation(
    shaderProgram,
    "u_max_iterations"
  );

  const invertLocation_u1i = context.getUniformLocation(
    shaderProgram,
    "u_invert"
  );

  const hexMirroringFactor_u1f = context.getUniformLocation(
    shaderProgram,
    "u_hex_mirroring_factor"
  );

  const hexMirroringDistChange_u2f = context.getUniformLocation(
    shaderProgram,
    "U_hex_mirroring_dist_change"
  );
  return {
    resolution_u2f,
    colorStart_u3f,
    colorEnd_u3f,
    colorOverflow_u3f,
    fractalC_u2f,
    fractalR_u1f,
    linearSplit_u1f,
    radialSplit_u1f,
    radialSplitAngleBaseVector_u2f,
    time_u1f,
    fractalRRangeStart_u2f,
    fractalRRangeEnd_u2f,
    maxIterations_u1f,
    mirror_u1i,
    linearSplitPerDistChange_u2f,
    radialSplitPerDistChange_u2f,
    cxSplitPerDistChange_u2f,
    cySplitPerDistChange_u2f,
    rSplitPerDistChange_u2f,
    iterationsSplitPerDistChange_u2f,
    invertLocation_u1i,
    hexMirroringFactor_u1f,
    hexMirroringDistChange_u2f,
  };
}
