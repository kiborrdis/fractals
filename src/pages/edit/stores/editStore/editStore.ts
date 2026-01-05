import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import {
  FractalCustomRules,
  FractalDynamicParamsBuildRules,
  FractalParams,
  FractalParamsBuildRules,
  FractalTrap,
} from "@/features/fractals";
import { Vector2 } from "@/shared/libs/vectors";
import {
  makeArrayFromRules,
  NumberBuildRule,
  RuleType,
  Vector2BulidRule,
} from "@/shared/libs/numberRule";
import { fractalPresets } from "./presets";

type DeepPartial<T> = T extends object
  ? {
      [K in keyof T]?: DeepPartial<T[K]>;
    }
  : T;

export type EditStoreData = {
  fractal: FractalParamsBuildRules;
  fractalOverrides: DeepPartial<FractalParams>;
  play: boolean;
  initialLoopState: {
    time: number;
  };
  timeMultiplier: string;
  trapEditMode: boolean;
  currentTime: number;
};

export type EditStoreActions = {
  presetPicked: (presetId: string) => void;
  dynamicRuleChange: <K extends keyof FractalDynamicParamsBuildRules>(
    name: K,
    value: FractalDynamicParamsBuildRules[K],
  ) => void;
  dynamicRuleChangeByRoute: (
    route: string[],
    value: FractalDynamicParamsBuildRules[keyof FractalDynamicParamsBuildRules],
  ) => void;

  customRuleChange: (
    route: string[],
    value: NumberBuildRule | Vector2BulidRule,
  ) => void;

  customVariableCreate: (name: string, type: "number" | "vector2") => void;
  customVariableDelete: (name: string) => void;

  customParamOverride: (route: string[], value: unknown) => void;
  dynamicParamOverride: (route: string[], value: unknown) => void;
  staticParamOverride: (
    name: keyof Omit<FractalParamsBuildRules, "dynamic" | "custom">,
    value: unknown,
  ) => void;

  staticRuleChange: (
    name: keyof Omit<FractalParamsBuildRules, "dynamic">,
    value: FractalParamsBuildRules[keyof Omit<
      FractalParamsBuildRules,
      "dynamic"
    >],
  ) => void;
  toggleAnimation: () => void;
  changeAnimationSpeed: (speed: string) => void;
  zoomToArea: (startCoord: [number, number], size: [number, number]) => void;
  resetViewport: () => void;
  magnifyViewport: (factor: number) => void;
  panAndZoomViewport: (axisRangeSizes: Vector2, offset: Vector2) => void;
  /**
   * @description amountPerc - percent of current visible range to move
   */
  moveViewport: (dir: "l" | "r" | "u" | "d", amountPerc: number) => void;

  updateCurrentTime: (time: number) => void;
  initialLoopStateChange: (time: number) => void;
  toggleTrapEditMode: () => void;
  updateTrap: (index: number, trap: FractalTrap) => void;
};

export type EditStore = EditStoreData & { actions: EditStoreActions };

export const createEditStore = (fractalRules: FractalParamsBuildRules) => {
  const store = create<EditStore>()(
    immer(
      (set): EditStore => ({
        fractal: fractalRules,
        fractalOverrides: {},
        play: false,
        timeMultiplier: "1.0x",
        trapEditMode: false,
        currentTime: 0,
        initialLoopState: {
          time: fractalRules.initialTime ?? 0,
        },
        actions: {
          customVariableCreate: (name: string, type: "number" | "vector2") => {
            set((prev) => {
              if (type === "number") {
                prev.fractal.custom[name] = {
                  t: RuleType.StaticNumber,
                  value: 0,
                };
              } else if (type === "vector2") {
                prev.fractal.custom[name] = [
                  { t: RuleType.StaticNumber, value: 0 },
                  { t: RuleType.StaticNumber, value: 0 },
                ];
              }
            });
          },

          customVariableDelete: (name: string) => {
            set((prev) => {
              delete prev.fractal.custom[name];
            });
          },

          initialLoopStateChange: (time: number) => {
            set((prev) => {
              prev.initialLoopState = {
                time: time,
              };
            });
          },

          toggleTrapEditMode: () => {
            set((prev) => {
              prev.trapEditMode = !prev.trapEditMode;
            });
          },

          updateTrap: (index: number, trap: FractalTrap) => {
            set((prev) => {
              const traps = (prev.fractal as Record<string, unknown>).traps as
                | FractalTrap[]
                | undefined;
              if (traps && index >= 0 && index < traps.length) {
                traps[index] = trap;
              }
            });
          },

          customRuleChange: (
            route: string[],
            value: NumberBuildRule | Vector2BulidRule,
          ) => {
            set((prev) => {
              const target: FractalCustomRules = prev.fractal.custom;

              if (route.length === 1 && route[0] in target) {
                target[route[0]] = value;
                return;
              }

              if (route.length === 2 && route[0] in target) {
                const vecRule = target[route[0]];

                if (Array.isArray(vecRule)) {
                  vecRule[Number(route[1])] = value as NumberBuildRule;
                }

                return;
              }
            });
          },

          updateCurrentTime: (time: number) => {
            set((prev) => {
              prev.currentTime = time;
            });
          },

          dynamicRuleChange: <K extends keyof FractalDynamicParamsBuildRules>(
            name: K,
            value: FractalDynamicParamsBuildRules[K],
          ) => {
            set((prev) => {
              prev.fractal.dynamic[name] = value;
            });
          },

          dynamicRuleChangeByRoute: (
            route: string[],
            value: FractalDynamicParamsBuildRules[keyof FractalDynamicParamsBuildRules],
          ) => {
            set((prev) => {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              let target: any = prev.fractal.dynamic;

              for (let i = 0; i < route.length - 1; i++) {
                const part = route[i];

                if (isNaN(Number(part))) {
                  if (target[part] === undefined) {
                    return;
                  }

                  target = target[part];
                } else {
                  if (target[part] === undefined) {
                    return;
                  }

                  target = target[part];
                }
              }

              target[route[route.length - 1]] = value;
            });
          },

          customParamOverride: (route: string[], value: unknown) => {
            set((prev) => {
              if (prev.fractalOverrides.custom === undefined) {
                prev.fractalOverrides.custom = {};
              }
              const overrides = prev.fractalOverrides.custom;
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              let target: any = overrides;

              for (let i = 0; i < route.length - 1; i++) {
                const part = route[i];

                if (isNaN(Number(part))) {
                  if (target[part] === undefined) {
                    target[part] = [];
                  }

                  target = target[part];
                } else {
                  if (target[part] === undefined) {
                    target[part] = {};
                  }

                  target = target[part];
                }
              }

              target[route[route.length - 1]] = value;
            });
          },

          dynamicParamOverride: (route: string[], value: unknown) => {
            set((prev) => {
              if (prev.fractalOverrides.dynamic === undefined) {
                prev.fractalOverrides.dynamic = {};
              }

              const overrides = prev.fractalOverrides.dynamic;
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              let target: any = overrides;

              for (let i = 0; i < route.length - 1; i++) {
                const part = route[i];

                if (isNaN(Number(part))) {
                  if (target[part] === undefined) {
                    target[part] = [];
                  }

                  target = target[part];
                } else {
                  if (target[part] === undefined) {
                    target[part] = {};
                  }

                  target = target[part];
                }
              }

              target[route[route.length - 1]] = value;
            });
          },

          staticParamOverride: (name, value) => {
            set((prev) => {
              if (value === undefined) {
                delete (prev.fractalOverrides as Record<string, unknown>)[name];
              } else {
                (prev.fractalOverrides as Record<string, unknown>)[name] =
                  value;
              }
            });
          },

          staticRuleChange: (name, value) => {
            set((prev) => {
              // Use index signature to safely assign to fractal properties
              (prev.fractal as Record<string, unknown>)[name] = value;
            });
          },

          toggleAnimation: () => {
            set((prev) => {
              prev.play = !prev.play;
            });
          },

          changeAnimationSpeed: (speed) => {
            set((prev) => {
              prev.timeMultiplier = speed;
            });
          },

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
          presetPicked: (presetId: string) => {
            set((prev) => {
              const preset = fractalPresets[presetId];
              if (preset) {
                prev.fractal = preset;
                prev.fractalOverrides = {};
                prev.play = false;
                prev.currentTime = 0;
                prev.initialLoopState = { time: 0 };
              }
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

              const numRange = makeArrayFromRules(visibleRange, 0);
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
      }),
    ),
  );

  return store;
};
