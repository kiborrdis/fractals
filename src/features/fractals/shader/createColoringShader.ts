import {
  createProgram,
  createShader,
  createUniformApplier,
  UniformApplierMemory,
} from "@/shared/libs/webgl";
import {
  createCameraUniformApplier,
  createColoringUniformApplier,
  createResolutionUniformApplier,
  createTimeUniformApplier,
} from "./prepareFractalUniforms";
import vertex from "./fractalvertex.glsl?raw";
import fragment from "./colorshader.glsl?raw";
import { createGradientTexture } from "./texture";
import { WebGLError } from "../errors";

export const createColoringShader = (context: WebGL2RenderingContext) => {
  const vertexShader = createShader(context, context.VERTEX_SHADER, vertex);
  const fragmentShader = createShader(
    context,
    context.FRAGMENT_SHADER,
    fragment,
  );

  const shaderProgram = createProgram(context, vertexShader, fragmentShader);

  if (!shaderProgram) {
    throw new WebGLError("Shader program is undefined");
  }

  const memory = new UniformApplierMemory();
  const gradientTexture = createGradientTexture(context);

  const applyFractalData = createUniformApplier<{
    fractalData1: WebGLTexture;
    fractalData2: WebGLTexture;
  }>(context, shaderProgram, memory, [
    ["texture", "u_fractal_data1", (data) => data.fractalData1],
    ["texture", "u_fractal_data2", (data) => data.fractalData2],
  ]);
  const applyFractalParams = createColoringUniformApplier(
    context,
    shaderProgram,
    gradientTexture,
    memory,
  );
  const applyCameraParams = createCameraUniformApplier(
    context,
    shaderProgram,
    memory,
  );
  const applyResolutionParams = createResolutionUniformApplier(
    context,
    shaderProgram,
    memory,
  );

  return {
    program: shaderProgram,
    applyFractalParams,
    applyCameraParams,
    applyResolutionParams,
    applyFractalData,
    applyTime: createTimeUniformApplier(context, shaderProgram, memory),
    cleanup: () => {
      context.deleteProgram(shaderProgram);

      if (vertexShader) {
        context.deleteShader(vertexShader);
      }
      if (fragmentShader) {
        context.deleteShader(fragmentShader);
      }

      context.deleteTexture(gradientTexture);
    },
  };
};

export type ColoringShader = ReturnType<typeof createColoringShader>;
