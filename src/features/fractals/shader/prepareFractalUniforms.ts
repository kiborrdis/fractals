import { FractalParams, ColoringMode, BlendMode, ColoringEntry } from "../types";
import { encodeGradientsInTexture, encodeTrapsAsUniforms } from "./texture";
import {
  createUniformApplier,
  UniformApplierMemory,
} from "@/shared/libs/webgl";

const defaultColoring: ColoringEntry[] = [
  { type: ColoringMode.Iterations, blend: BlendMode.Normal },
];

const getColoring = (data: FractalParams): ColoringEntry[] =>
  data.coloring ?? defaultColoring;

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

    ["1i", "u_mirroring_passes_size", (data) => data.dynamic.mirroringPasses.length],
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
        getColoring(data).some((c) => c.type === ColoringMode.Border || c.type === ColoringMode.Normal) ? 1 : 0,
    ],
    ["1i", "u_supersampling_level", (data) => data.antialiasingLevel ?? 1],

    [
      "1i",
      "u_trap_calculation_enabled",
      (data) =>
        getColoring(data).some((c) => c.type === ColoringMode.Trap) ? 1 : 0,
    ],

    ["1i", "u_stripe_enabled", (data) => data.coloring?.some((c) => c.type === ColoringMode.StripesAverage) ? 1 : 0],

    [
      "1i",
      "u_traps_size",
      (data) => {
        const trapEnabled = getColoring(data).some(
          (c) => c.type === ColoringMode.Trap,
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
          (c) => c.type === ColoringMode.Trap,
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
          (c) => c.type === ColoringMode.Trap,
        );
        const traps = data.traps ?? [];
        if (!trapEnabled || traps.length === 0) return null;
        return encodeTrapsAsUniforms(traps).data;
      },
    ],
  ]);

export const createColoringUniformApplier = (
  ctx: WebGL2RenderingContext,
  program: WebGLProgram,
  gradientTexture: WebGLTexture,
  memory: UniformApplierMemory,
) =>
  createUniformApplier<FractalParams>(ctx, program, memory, [
    ["1f", "u_max_iterations", (data) => data.dynamic.maxIterations],
     
    ["1f", "u_border_intensity", (data) => data.borderIntensity ?? 10],
    [
      "4f",
      "u_border_color",
      (data): readonly [number, number, number, number] =>
        data.borderColor ?? [1, 1, 1, 0],
    ],

    ["1f", "u_trap_intensity", (data) => data.trapIntensity ?? 0],
    
    [
      "texture",
      "u_gradients_sampler",
      (data, ctx) => {
        const trapGradient = data.trapGradient;
        const iterationGradient = data.gradient;
        
        const texture = encodeGradientsInTexture(ctx, gradientTexture, iterationGradient, trapGradient || []);
        return texture;
      },
    ],
    ["1i", "u_sampler_wl", (data) => data.gradient.length],
    [
      "1i",
      "u_trap_gradient_wl",
      (data) => {
        if (!getColoring(data).some((c) => c.type === ColoringMode.Trap)) {
          return 0;
        }
        return (
          data.trapGradient ?? [
            [0, 1, 1, 1, 1],
            [100, 0, 0, 0, 1],
          ]
        ).length;
      },
    ],

    [
      "2iv",
      "u_blend_types",
      (data) => {
        const coloring = getColoring(data);
        const arr = new Int32Array(coloring.length * 2);
        coloring.forEach((entry, i) => {
          arr[i * 2] = entry.type;
          arr[i * 2 + 1] = entry.blend;
        });
        return arr;
      },
    ],
    ["1i", "u_blend_types_size", (data) => getColoring(data).length],
  ]);


export const createTimeUniformApplier = (
  ctx: WebGL2RenderingContext,
  program: WebGLProgram,
  memory: UniformApplierMemory,
) =>
  createUniformApplier<number>(ctx, program, memory, [
    ["1f", "u_time", (data) => data],
  ]);