import {
  createProgram,
  createShader,
  createUniformApplier,
  UniformApplierMemory,
} from "@/shared/libs/webgl";
import {
  createCameraUniformApplier,
} from "./prepareFractalUniforms";
import vertex from "./fractalvertex.glsl?raw";
import fragment from "./mapcolorshader.glsl?raw";
import { Vector2 } from "@/shared/libs/vectors";

const createDataApplier = (
  ctx: WebGL2RenderingContext,
  program: WebGLProgram,
  memory: UniformApplierMemory,
) =>
  createUniformApplier<{
    resolution: Vector2;
    detailLevel: number;
    data: WebGLTexture;
  }>(ctx, program, memory, [
    ["texture", "u_fractal_data1", (data) => data.data],
    ["2f", "u_resolution", (data) => data.resolution],
    ["1i", "u_sample_target_detail_level", (data) => data.detailLevel],
  ]);

export const createMapColoringShader = (context: WebGL2RenderingContext) => {
  const vertexShader = createShader(context, context.VERTEX_SHADER, vertex);
  const fragmentShader = createShader(
    context,
    context.FRAGMENT_SHADER,
    fragment,
  );

  const shaderProgram = createProgram(context, vertexShader, fragmentShader);

  if (!shaderProgram) {
    throw new Error("Shader program is undefined");
  }

  const memory = new UniformApplierMemory();
  const applyCameraParams = createCameraUniformApplier(
    context,
    shaderProgram,
    memory,
  );

  return {
    program: shaderProgram,
    applyColorParams: createDataApplier(context, shaderProgram, memory),
    applyCameraParams,
    cleanup: () => {
      context.deleteProgram(shaderProgram);

      if (vertexShader) {
        context.deleteShader(vertexShader);
      }
      if (fragmentShader) {
        context.deleteShader(fragmentShader);
      }
    },
  };
};

export type MapColoringShader = ReturnType<typeof createMapColoringShader>;
