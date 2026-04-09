import { FractalParamsBuildRules } from "@/features/fractals";
import {
  convertRuleOrArrayToResult,
  NumberBuildRule,
  RuleType,
} from "@/shared/libs/numberRule";
import { Vector2 } from "@/shared/libs/vectors";
import { StateCreator } from "zustand";

export type ViewportSlice = {
  actions: {
    zoomToArea: (startCoord: Vector2, size: Vector2) => void;
    resetViewport: () => void;
    magnifyViewport: (factor: number) => void;
    panAndZoomViewport: (axisRangeSizes: Vector2, offset: Vector2) => void;
    /**
     * @description amountPerc - percent of current visible range to move
     */
    moveViewport: (dir: "l" | "r" | "u" | "d", amountPerc: number) => void;
  };
};

export const createViewportSlice =
  <
    Slice extends ViewportSlice & { fractal: FractalParamsBuildRules },
  >(): StateCreator<Slice, [["zustand/immer", never]], [], ViewportSlice> =>
  (set) => ({
    actions: {
      zoomToArea: (startCoord: Vector2, size: Vector2) => {
        set((prev) => {
          prev.fractal.dynamic.rlVisibleRange = [
            { t: RuleType.StaticNumber, value: startCoord[0] },
            { t: RuleType.StaticNumber, value: startCoord[0] + size[0] },
          ];

          prev.fractal.dynamic.imVisibleRange = [
            { t: RuleType.StaticNumber, value: startCoord[1] },
            { t: RuleType.StaticNumber, value: startCoord[1] + size[1] },
          ];
        });
      },

      resetViewport: () => {
        set((prev) => {
          prev.fractal.dynamic.rlVisibleRange = [
            { t: RuleType.StaticNumber, value: -1 },
            { t: RuleType.StaticNumber, value: 1 },
          ];

          prev.fractal.dynamic.imVisibleRange = [
            { t: RuleType.StaticNumber, value: -1 },
            { t: RuleType.StaticNumber, value: 1 },
          ];
        });
      },

      magnifyViewport: (factor: number) => {
        set((prev) => {
          const rlRange = prev.fractal.dynamic.rlVisibleRange;
          const imRange = prev.fractal.dynamic.imVisibleRange;

          if (Array.isArray(rlRange)) {
            if (
              rlRange[0].t === RuleType.StaticNumber &&
              rlRange[1].t === RuleType.StaticNumber
            ) {
              const newRlRangeSize =
                Math.abs(rlRange[1].value - rlRange[0].value) * factor;
              const rlCenter = (rlRange[0].value + rlRange[1].value) / 2;

              rlRange[0].value = rlCenter - newRlRangeSize / 2;
              rlRange[1].value = rlCenter + newRlRangeSize / 2;
            }
          }

          if (Array.isArray(imRange)) {
            if (
              imRange[0].t === RuleType.StaticNumber &&
              imRange[1].t === RuleType.StaticNumber
            ) {
              const newImRangeSize =
                Math.abs(imRange[1].value - imRange[0].value) * factor;
              const imCenter = (imRange[0].value + imRange[1].value) / 2;

              imRange[0].value = imCenter - newImRangeSize / 2;
              imRange[1].value = imCenter + newImRangeSize / 2;
            }
          }
        });
      },

      panAndZoomViewport: (axisRangeSizes: Vector2, offset: Vector2) => {
        set((prev) => {
          const centerRe = -offset[0];
          const centerIm = -offset[1];
          const halfRe = axisRangeSizes[0] / 2;
          const halfIm = axisRangeSizes[1] / 2;

          prev.fractal.dynamic.rlVisibleRange = [
            { t: RuleType.StaticNumber, value: centerRe - halfRe },
            { t: RuleType.StaticNumber, value: centerRe + halfRe },
          ];

          prev.fractal.dynamic.imVisibleRange = [
            { t: RuleType.StaticNumber, value: centerIm - halfIm },
            { t: RuleType.StaticNumber, value: centerIm + halfIm },
          ];
        });
      },

      moveViewport: (dir: "l" | "r" | "u" | "d", amountPerc: number) => {
        set((prev) => {
          const rlRange = prev.fractal.dynamic.rlVisibleRange;
          const imRange = prev.fractal.dynamic.imVisibleRange;

          if (!Array.isArray(rlRange) || !Array.isArray(imRange)) {
            return;
          }

          let visibleRange: [NumberBuildRule, NumberBuildRule] = rlRange;
          let dirSign: 1 | -1 = 1;

          switch (dir) {
            case "l":
            case "r": {
              dirSign = dir === "l" ? -1 : 1;
              break;
            }
            case "u":
            case "d": {
              dirSign = dir === "u" ? -1 : 1;
              visibleRange = imRange;
              break;
            }
          }

          const numRange = convertRuleOrArrayToResult(visibleRange, 0);
          const span = Math.abs(numRange[1] - numRange[0]);
          const move = span * amountPerc * dirSign;

          visibleRange.forEach((e) => {
            if (e.t === RuleType.StaticNumber) {
              e.value += move;
            }
          });
        });
      },
    },
  });
