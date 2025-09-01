import { FractalCanvasParams } from "./initFractalCanvas";
import { FractalParams } from "../types";
import { loadTexture } from "./texture";

const mirroringTypeToInt = {
  off: 0,
  square: 1,
  hex: 2,
};

export const prepareFractalUniforms = (
  {
    context,
    uniforms: {
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
      sampler2D_tex,
      sampler2D_wl_i1f,
    },
  }: FractalCanvasParams,
  {
    gradient,
    mirroringType,
    dynamic: {
      linearMirroringFactor,
      time,
      c,
      r,
      imVisibleRange,
      rlVisibleRange,
      invert,
      maxIterations,
      linearMirroringPerDistChange = [0, 0],
      radialMirroringPerDistChange = [0, 0],
      cxPerDistChange = [0, 0],
      cyPerDistChange = [0, 0],
      rPerDistChange = [0, 0],
      iterationsPerDistChange = [0, 0],
      hexMirroringFactor,
      hexMirroringPerDistChange,
      radialMirroringAngle,
    },
  }: FractalParams
) => {
  context.uniform1f(linearSplit_u1f, linearMirroringFactor);
  context.uniform1f(radialSplit_u1f, radialMirroringAngle);
  context.uniform2f(radialSplitAngleBaseVector_u2f, ...[1, 0]);

  context.uniform1f(maxIterations_u1f, maxIterations);
  context.uniform1f(time_u1f, time);

  context.uniform1f(fractalR_u1f, r);
  context.uniform2f(fractalC_u2f, ...c);

  context.uniform2f(
    fractalRRangeStart_u2f,
    rlVisibleRange[0],
    imVisibleRange[0]
  );
  context.uniform2f(fractalRRangeEnd_u2f, rlVisibleRange[1], imVisibleRange[1]);

  context.uniform1i(mirror_u1i, mirroringTypeToInt[mirroringType]);

  context.uniform2f(
    linearSplitPerDistChange_u2f,
    ...linearMirroringPerDistChange
  );
  context.uniform2f(
    radialSplitPerDistChange_u2f,
    ...radialMirroringPerDistChange
  );
  context.uniform2f(cxSplitPerDistChange_u2f, ...cxPerDistChange);
  context.uniform2f(cySplitPerDistChange_u2f, ...cyPerDistChange);
  context.uniform2f(rSplitPerDistChange_u2f, ...rPerDistChange);
  context.uniform2f(
    iterationsSplitPerDistChange_u2f,
    ...iterationsPerDistChange
  );
  context.uniform1i(invertLocation_u1i, invert ? 1 : 0);
  context.uniform1f(hexMirroringFactor_u1f, hexMirroringFactor);
  context.uniform2f(hexMirroringDistChange_u2f, ...hexMirroringPerDistChange);

  context.activeTexture(context.TEXTURE0);

  // Bind the texture to texture unit 0
  context.bindTexture(context.TEXTURE_2D, loadTexture(context, gradient));

  // Tell the shader we bound the texture to texture unit 0
  context.uniform1i(sampler2D_tex, 0);
  context.uniform1i(sampler2D_wl_i1f, gradient.length);
};

export function setupUniformLocations(
  context: WebGLRenderingContext,
  shaderProgram: WebGLProgram
) {
  const resolution_u2f = context.getUniformLocation(
    shaderProgram,
    "u_resolution"
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
  const mirror_u1i = context.getUniformLocation(shaderProgram, "u_mirror_type");

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
    sampler2D_wl_i1f: context.getUniformLocation(shaderProgram, "u_sampler_wl"),
    sampler2D_tex: context.getUniformLocation(shaderProgram, "uSampler"),
  };
}
