import { FractalParams, ColoringMode, ColoringEntry } from "../types";
import {
  encodeGradientsInTexture,
  encodeTrapsAsUniforms,
  MAX_BLEND,
} from "./texture";
import {
  createUniformApplier,
  UniformApplierMemory,
} from "@/shared/libs/webgl";

const getColoring = (data: FractalParams): ColoringEntry[] => {
  const c = data.dynamic.coloring;
  if (c && c.length > 0) return c;
  return [[ColoringMode.Iterations, [0], [], 1] as ColoringEntry];
};

export const createResolutionUniformApplier = (
  ctx: WebGL2RenderingContext,
  program: WebGLProgram,
  memory: UniformApplierMemory,
) =>
  createUniformApplier<{
    fullResolution: [number, number];
    renderResolution: [number, number];
  }>(ctx, program, memory, [
    ["2f", "u_resolution", (data) => data.fullResolution],
    ["2f", "u_resolution2", (data) => data.renderResolution],
  ]);

export const createResolutionUniformApplier2 = (
  ctx: WebGL2RenderingContext,
  program: WebGLProgram,
  memory: UniformApplierMemory,
) =>
  createUniformApplier<{
    fullResolution: [number, number];
    renderResolution: [number, number];
  }>(ctx, program, memory, [
    ["2f", "u_resolution", (data) => data.fullResolution],
  ]);

export const createCameraUniformApplier = (
  ctx: WebGL2RenderingContext,
  program: WebGLProgram,
  memory: UniformApplierMemory,
) =>
  createUniformApplier<{
    offset: [number, number];
    scale: number;
  }>(ctx, program, memory, [
    ["2f", "u_camera_offset", (data) => data.offset],
    ["1f", "u_camera_scale", (data) => data.scale],
  ]);

export const createMapParamsUniformApplier = (
  ctx: WebGL2RenderingContext,
  program: WebGLProgram,
  memory: UniformApplierMemory,
) =>
  createUniformApplier<{
    axisSizes: [number, number];
    offset: [number, number];
    targetDetailLevel: number;
    prevDetailLevel: number;
    prevData: WebGLTexture;
  }>(ctx, program, memory, [
    ["texture", "u_prev_data", (data) => data.prevData],
    ["2f", "u_axis_sizes", (data) => data.axisSizes],
    ["2f", "u_offset", (data) => data.offset],
    ["1i", "u_target_detail_level", (data) => data.targetDetailLevel],
    ["1i", "u_prev_detail_level", (data) => data.prevDetailLevel],
  ]);

export const createMapFractalUniformApplier = (
  ctx: WebGL2RenderingContext,
  program: WebGLProgram,
  memory: UniformApplierMemory,
) =>
  createUniformApplier<FractalParams>(ctx, program, memory, [
    ["2f", "u_fractal_c", (data) => data.dynamic.c],
    ["1f", "u_fractal_r", (data) => data.dynamic.r],
    ["1f", "u_max_iterations", (data) => data.dynamic.maxIterations],
    [
      "2f",
      "u_fractal_r_range_start",
      (data) =>
        [
          data.dynamic.rlVisibleRange[0],
          data.dynamic.imVisibleRange[0],
        ] as const,
    ],
    [
      "2f",
      "u_fractal_r_range_end",
      (data) =>
        [
          data.dynamic.rlVisibleRange[1],
          data.dynamic.imVisibleRange[1],
        ] as const,
    ],
  ]);

export const createFractalUniformApplier = (
  ctx: WebGL2RenderingContext,
  program: WebGLProgram,
  memory: UniformApplierMemory,
) =>
  createUniformApplier<FractalParams>(ctx, program, memory, [
    ["2f", "u_fractal_c", (data) => data.dynamic.c],
    ["1f", "u_fractal_r", (data) => data.dynamic.r],
    ["1f", "u_max_iterations", (data) => data.dynamic.maxIterations],
    [
      "2f",
      "u_fractal_r_range_start",
      (data) =>
        [
          data.dynamic.rlVisibleRange[0],
          data.dynamic.imVisibleRange[0],
        ] as const,
    ],
    [
      "2f",
      "u_fractal_r_range_end",
      (data) =>
        [
          data.dynamic.rlVisibleRange[1],
          data.dynamic.imVisibleRange[1],
        ] as const,
    ],

    [
      "1i",
      "u_mirroring_passes_size",
      (data) => data.dynamic.mirroringPasses.length,
    ],
    [
      "4fv",
      "u_mirroring_passes",
      (data) => {
        const passes = data.dynamic.mirroringPasses;
        if (passes.length === 0) return null;
        const arr = new Float32Array(8 * 4);
        passes.forEach(([type, factor, variation], i) => {
          arr[i * 4] = type;
          arr[i * 4 + 1] = factor;
          arr[i * 4 + 2] = variation;
          arr[i * 4 + 3] = 0;
        });
        return arr;
      },
    ],

    ["2f", "u_c_dist_variation", (data) => data.dynamic.cDistVariation],
    ["1f", "u_r_dist_variation", (data) => data.dynamic.rDistVariation],
    [
      "1f",
      "u_iterations_dist_variation",
      (data) => data.dynamic.iterationsDistVariation,
    ],

    ["1i", "u_smooth_pow", (data) => data.bandSmoothing ?? 0],
    [
      "1i",
      "u_derivative_enabled",
      (data) =>
        getColoring(data).some(
          (c) =>
            (c as ColoringEntry)[0] === ColoringMode.Border ||
            (c as ColoringEntry)[0] === ColoringMode.Normal,
        )
          ? 1
          : 0,
    ],
    ["1i", "u_supersampling_level", (data) => data.antialiasingLevel ?? 1],

    [
      "1i",
      "u_trap_calculation_enabled",
      (data) =>
        getColoring(data).some(
          (c) => (c as ColoringEntry)[0] === ColoringMode.Trap,
        )
          ? 1
          : 0,
    ],

    [
      "1i",
      "u_stripe_enabled",
      (data) =>
        data.dynamic.coloring?.some(
          (c) => (c as ColoringEntry)[0] === ColoringMode.StripesAverage,
        )
          ? 1
          : 0,
    ],

    [
      "1i",
      "u_traps_size",
      (data) => {
        const trapEnabled = getColoring(data).some(
          (c) => (c as ColoringEntry)[0] === ColoringMode.Trap,
        );
        const trapsLength = data.traps?.length ?? 0;
        return trapEnabled && trapsLength > 0 ? trapsLength : 0;
      },
    ],
    [
      "1iv",
      "u_trap_types",
      (data) => {
        const trapEnabled = getColoring(data).some(
          (c) => (c as ColoringEntry)[0] === ColoringMode.Trap,
        );
        const traps = data.traps ?? [];
        if (!trapEnabled || traps.length === 0) return null;
        return encodeTrapsAsUniforms(traps).types;
      },
    ],
    [
      "4fv",
      "u_trap_data",
      (data) => {
        const trapEnabled = getColoring(data).some(
          (c) => (c as ColoringEntry)[0] === ColoringMode.Trap,
        );
        const traps = data.traps ?? [];
        if (!trapEnabled || traps.length === 0) return null;
        return encodeTrapsAsUniforms(traps).data;
      },
    ],
  ]);

const memoizedGradientsEncoder = (texture: WebGLTexture) => {
  let prevGradients: FractalParams["gradients"] | null = null;

  return (
    { gradients }: Pick<FractalParams, "gradients">,
    ctx: WebGL2RenderingContext,
  ) => {
    if (prevGradients === gradients && texture) {
      return texture;
    }

    prevGradients = gradients;
    encodeGradientsInTexture(ctx, texture, gradients);
    return texture;
  };
};

export const createColoringUniformApplier = (
  ctx: WebGL2RenderingContext,
  program: WebGLProgram,
  gradientTexture: WebGLTexture,
  memory: UniformApplierMemory,
) =>
  createUniformApplier<FractalParams>(ctx, program, memory, [
    ["1f", "u_max_iterations", (data) => data.dynamic.maxIterations],

    [
      "texture",
      "u_gradients_sampler",
      memoizedGradientsEncoder(gradientTexture),
    ],
    [
      "1iv",
      "u_gradient_wls",
      (data) => {
        const arr = new Int32Array(MAX_BLEND);
        data.gradients.forEach((grad, i) => {
          if (i < MAX_BLEND) arr[i] = grad?.length ?? 0;
        });
        return arr;
      },
    ],

    [
      "4iv",
      "u_blend_configs",
      (data) => {
        const coloring = getColoring(data);
        const arr = new Int32Array(MAX_BLEND * 4);
        coloring.forEach((entry, i) => {
          const [mode, gradIds, , blend] = entry as [
            number,
            number[],
            unknown[],
            number,
          ];
          arr[i * 4 + 0] = mode;
          arr[i * 4 + 1] = blend;
          arr[i * 4 + 2] = gradIds[0] ?? 0;
          arr[i * 4 + 3] = 0;
        });
        return arr;
      },
    ],

    [
      "4fv",
      "u_blend_params",
      (data) => {
        const coloring = getColoring(data);
        const arr = new Float32Array(MAX_BLEND * 4);
        coloring.forEach((entry, i) => {
          const params = (entry as unknown[])[2] as number[];
          arr[i * 4 + 0] = params[0] ?? 0;
          arr[i * 4 + 1] = params[1] ?? 0;
          arr[i * 4 + 2] = 0;
          arr[i * 4 + 3] = 0;
        });
        return arr;
      },
    ],

    ["1i", "u_blend_configs_size", (data) => getColoring(data).length],
  ]);

export const createTimeUniformApplier = (
  ctx: WebGL2RenderingContext,
  program: WebGLProgram,
  memory: UniformApplierMemory,
) =>
  createUniformApplier<number>(ctx, program, memory, [
    ["1f", "u_time", (data) => data],
  ]);
