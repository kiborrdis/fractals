import {
  BlendMode,
  ColoringBuildRule,
  ColoringMode,
  FractalParamsBuildRules,
  COLORING_MODE_GRADIENT_COUNT,
  COLORING_MODE_DEFAULT_PARAMS,
  COLORING_MODE_DEFAULT_GRADIENT,
} from "@/features/fractals";
import { NumberBuildRule, RuleType } from "@/shared/libs/numberRule";
import { StateCreator } from "zustand";

export type ColoringSlice = {
  actions: {
    addColoringMode: (mode: ColoringMode) => void;
    removeColoringMode: (coloringIndex: number) => void;
    replaceColoringMode: (coloringIndex: number, newMode: ColoringMode) => void;
    editColoringParams: (
      coloringIndex: number,
      paramIndex: number,
      rule: NumberBuildRule,
    ) => void;
    editColoringBlend: (coloringIndex: number, blend: BlendMode) => void;
    moveColoringLayer: (index: number, direction: "up" | "down") => void;
  };
};

export const createColoringSlice =
  <
    Slice extends ColoringSlice & { fractal: FractalParamsBuildRules },
  >(): StateCreator<Slice, [["zustand/immer", never]], [], ColoringSlice> =>
  (set, get) => ({
    actions: {
      addColoringMode: (mode: ColoringMode) => {
        set((prev) => {
          const coloring = prev.fractal.dynamic.coloring;
          const gradients = prev.fractal.gradients;
          const neededGradCount = COLORING_MODE_GRADIENT_COUNT[mode];
          const newGradIds: number[] = [];

          for (let i = 0; i < neededGradCount; i++) {
            newGradIds.push(gradients.length);
            gradients.push([...COLORING_MODE_DEFAULT_GRADIENT[mode]]);
          }
          const paramRules = COLORING_MODE_DEFAULT_PARAMS[mode].map((v) => ({
            t: RuleType.StaticNumber as const,
            value: v,
          }));
          coloring.push([
            mode,
            newGradIds,
            paramRules,
            BlendMode.Normal,
          ] as unknown as ColoringBuildRule);
        });
      },

      removeColoringMode: (coloringIndex: number) => {
        set((prev) => {
          const coloring = prev.fractal.dynamic.coloring;
          if (coloringIndex < 0 || coloringIndex >= coloring.length) return;
          const removedGradIds = [
            ...(coloring[coloringIndex][1] as number[]),
          ].sort((a, b) => b - a);
          coloring.splice(coloringIndex, 1);

          const gradients = prev.fractal.gradients;
          for (const id of removedGradIds) {
            gradients.splice(id, 1);
          }

          for (const entry of coloring) {
            const gradIds = entry[1];
            for (let i = 0; i < gradIds.length; i++) {
              gradIds[i] -= removedGradIds.filter(
                (rid) => rid < gradIds[i],
              ).length;
            }
          }
        });
      },

      replaceColoringMode: (coloringIndex: number, newMode: ColoringMode) => {
        const { actions } = get();
        actions.addColoringMode(newMode);
        actions.removeColoringMode(coloringIndex);
      },

      editColoringParams: (
        coloringIndex: number,
        paramIndex: number,
        rule: NumberBuildRule,
      ) => {
        set((prev) => {
          const coloring = prev.fractal.dynamic.coloring;
          const entry = coloring[coloringIndex];
          if (!entry) return;
          entry[2][paramIndex] = rule;
        });
      },

      editColoringBlend: (coloringIndex: number, blend: BlendMode) => {
        set((prev) => {
          const coloring = prev.fractal.dynamic.coloring;
          const entry = coloring[coloringIndex];
          if (!entry) return;
          entry[3] = blend;
        });
      },

      moveColoringLayer: (index: number, direction: "up" | "down") => {
        set((prev) => {
          const coloring = prev.fractal.dynamic.coloring;
          const targetIndex = direction === "up" ? index - 1 : index + 1;
          if (targetIndex < 0 || targetIndex >= coloring.length) return;
          [coloring[index], coloring[targetIndex]] = [
            coloring[targetIndex],
            coloring[index],
          ];
        });
      },
    },
  });
