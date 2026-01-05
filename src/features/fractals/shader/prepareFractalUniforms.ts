import { FractalParams } from "../types";
import { encodeGradientInTexture, encodeTrapsAsUniforms } from "./texture";
import {
  createUniformApplier,
  UniformApplierMemory,
} from "@/shared/libs/webgl";

const mirroringTypeToInt = {
  off: 0,
  square: 1,
  hex: 2,
  radial: 3,
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

    // --- Mirroring ---
    ["1i", "u_mirror_type", (data) => mirroringTypeToInt[data.mirroringType]],
    ["1f", "u_linear_mirroring", (data) => data.dynamic.linearMirroringFactor],
    ["1f", "u_radial_mirroring", (data) => data.dynamic.radialMirroringAngle],
    ["1f", "u_hex_mirroring_factor", (data) => data.dynamic.hexMirroringFactor],

    // --- Distance variation ---
    [
      "1f",
      "u_linear_mirroring_dist_variation",
      (data) => data.dynamic.linearMirroringDistVariation,
    ],
    [
      "1f",
      "u_radial_mirroring_dist_variation",
      (data) => data.dynamic.radialMirroringDistVariation,
    ],
    ["2f", "u_c_dist_variation", (data) => data.dynamic.cDistVariation],
    ["1f", "u_r_dist_variation", (data) => data.dynamic.rDistVariation],
    [
      "1f",
      "u_iterations_dist_variation",
      (data) => data.dynamic.iterationsDistVariation,
    ],
    [
      "1f",
      "u_hex_mirroring_dist_variation",
      (data) => data.dynamic.hexMirroringDistVariation,
    ],

    // --- Coloring / rendering quality ---
    ["1i", "u_smooth_pow", (data) => data.bandSmoothing ?? 0],
    [
      "1i",
      "u_gradient_coloring",
      (data) =>
        data.gradientColoringEnabled === undefined
          ? 1
          : Number(data.gradientColoringEnabled),
    ],
    [
      "1i",
      "u_border_coloring",
      (data) =>
        data.borderColoringEnabled === undefined
          ? 0
          : Number(data.borderColoringEnabled),
    ],
    ["1f", "u_border_intensity", (data) => data.borderIntensity ?? 10],
    [
      "4f",
      "u_border_color",
      (data): readonly [number, number, number, number] =>
        data.borderColor ?? [1, 1, 1, 0],
    ],
    ["1i", "u_antialiasing_level", (data) => data.antialiasingLevel ?? 1],

    [
      "texture",
      "uSampler",
      (data, ctx) => encodeGradientInTexture(ctx, data.gradient),
    ],
    ["1i", "u_sampler_wl", (data) => data.gradient.length],

    [
      "1i",
      "u_trap_coloring",
      (data) => ((data.trapColoringEnabled ?? false) ? 1 : 0),
    ],
    ["1f", "u_trap_intensity", (data) => data.trapIntensity ?? 0],
    [
      "1i",
      "u_traps_size",
      (data) => {
        const trapEnabled = data.trapColoringEnabled ?? false;
        const trapsLength = data.traps?.length ?? 0;
        return trapEnabled && trapsLength > 0 ? trapsLength : 0;
      },
    ],
    [
      "1iv",
      "u_trap_types",
      (data) => {
        const trapEnabled = data.trapColoringEnabled ?? false;
        const traps = data.traps ?? [];
        if (!trapEnabled || traps.length === 0) return null;
        return encodeTrapsAsUniforms(traps).types;
      },
    ],
    [
      "3fv",
      "u_trap_data",
      (data) => {
        const trapEnabled = data.trapColoringEnabled ?? false;
        const traps = data.traps ?? [];
        if (!trapEnabled || traps.length === 0) return null;
        return encodeTrapsAsUniforms(traps).data;
      },
    ],
    [
      "texture",
      "uTrapGradient",
      (data, ctx) =>
        encodeGradientInTexture(
          ctx,
          data.trapGradient ?? [
            [0, 1, 1, 1, 1],
            [100, 0, 0, 0, 1],
          ],
        ),
    ],
    [
      "1i",
      "u_trap_gradient_wl",
      (data) => {
        if (!(data.trapColoringEnabled ?? false)) return 0;
        return (
          data.trapGradient ?? [
            [0, 1, 1, 1, 1],
            [100, 0, 0, 0, 1],
          ]
        ).length;
      },
    ],

    ["2iv", "u_blend_types", () => new Int32Array([3, 1, 2, 1, 1, 1])],
    ["1i", "u_blend_types_size", () => 3],
  ]);
