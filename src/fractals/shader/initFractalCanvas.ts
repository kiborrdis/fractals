import { createProgram, createShader } from "./canvasUtils";
import vertex from "./vertexshader.glsl?raw";
import fragment from "./fragmentshader.glsl?raw";
import { Vector2 } from "../types";

export const initFractalCanvas = (
  canvas: HTMLCanvasElement,
  canvasSize: Vector2
) => {
  const context = canvas.getContext("webgl");

  if (!context) {
    throw new Error("2d context initialization failed");
  }

  context.flush();

  const vertexShader = createShader(context, context.VERTEX_SHADER, vertex);
  const fragmentShader = createShader(
    context,
    context.FRAGMENT_SHADER,
    fragment
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
    context.STATIC_DRAW
  );

  const positionAttributeLocation = context.getAttribLocation(
    shaderProgram,
    "a_position"
  );
  const resolutionUniformLocation = context.getUniformLocation(
    shaderProgram,
    "u_resolution"
  );

  const colorStartUniformLocation = context.getUniformLocation(
    shaderProgram,
    "u_color_start"
  );
  const colorEndUniformLocation = context.getUniformLocation(
    shaderProgram,
    "u_color_end"
  );
  const colorOverflowUniformLocation = context.getUniformLocation(
    shaderProgram,
    "u_color_overflow"
  );

  const fractalCLocation = context.getUniformLocation(
    shaderProgram,
    "u_fractal_c"
  );
  const fractalRLocation = context.getUniformLocation(
    shaderProgram,
    "u_fractal_r"
  );

  const fractalTimeLocation = context.getUniformLocation(
    shaderProgram,
    "u_time"
  );

  const fractalRRangeStartLocation = context.getUniformLocation(
    shaderProgram,
    "u_fractal_r_range_start"
  );
  const fractalRRangeEndLocation = context.getUniformLocation(
    shaderProgram,
    "u_fractal_r_range_end"
  );
  const mirrorLocation = context.getUniformLocation(shaderProgram, "u_mirror");

  const linearSplitPerDistChangeLocation = context.getUniformLocation(
    shaderProgram,
    "u_linear_split_per_dist_change"
  );
  const radialSplitPerDistChangeLocation = context.getUniformLocation(
    shaderProgram,
    "u_radial_split_per_dist_change"
  );
  const cxSplitPerDistChangeLocation = context.getUniformLocation(
    shaderProgram,
    "u_cx_split_per_dist_change"
  );
  const cySplitPerDistChangeLocation = context.getUniformLocation(
    shaderProgram,
    "u_cy_split_per_dist_change"
  );
  const rSplitPerDistChangeLocation = context.getUniformLocation(
    shaderProgram,
    "u_r_split_per_dist_change"
  );
  const iterationsSplitPerDistChangeLocation = context.getUniformLocation(
    shaderProgram,
    "u_iterations_split_per_dist_change"
  );

  const linearSplitLocation = context.getUniformLocation(
    shaderProgram,
    "u_linear_split"
  );
  const radialSplitLocation = context.getUniformLocation(
    shaderProgram,
    "u_radial_split"
  );
  const radialSplitAngleBaseVectorLocation = context.getUniformLocation(
    shaderProgram,
    "u_radial_split_angle_base_vector"
  );
  const maxIterationsLocation = context.getUniformLocation(
    shaderProgram,
    "u_max_iterations"
  );


  const invertLocation = context.getUniformLocation(
    shaderProgram,
    "u_invert"
  );
  return {
    context,
    pos_vertex_attr_array: positionAttributeLocation,
    resolution_u2f: resolutionUniformLocation,
    colorStart_u3f: colorStartUniformLocation,
    colorEnd_u3f: colorEndUniformLocation,
    colorOverflow_u3f: colorOverflowUniformLocation,
    fractalC_u2f: fractalCLocation,
    fractalR_u1f: fractalRLocation,
    linearSplit_u1f: linearSplitLocation,
    radialSplit_u1f: radialSplitLocation,
    radialSplitAngleBaseVector_u2f: radialSplitAngleBaseVectorLocation,
    time_u1f: fractalTimeLocation,
    fractalRRangeStart_u2f: fractalRRangeStartLocation,
    fractalRRangeEnd_u2f: fractalRRangeEndLocation,
    maxIterations_u1f: maxIterationsLocation,
    mirror_u1i: mirrorLocation,
    linearSplitPerDistChange_u2f: linearSplitPerDistChangeLocation,
    radialSplitPerDistChange_u2f: radialSplitPerDistChangeLocation,
    cxSplitPerDistChange_u2f: cxSplitPerDistChangeLocation,
    cySplitPerDistChange_u2f: cySplitPerDistChangeLocation,
    rSplitPerDistChange_u2f: rSplitPerDistChangeLocation,
    iterationsSplitPerDistChange_u2f: iterationsSplitPerDistChangeLocation,
    invertLocation_u1i: invertLocation,
    positionBuffer,
    shaderProgram,
  };
};

export type FractalCanvasParams = ReturnType<typeof initFractalCanvas>;
