import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import {
  FractalDynamicParamsBuildRules,
  FractalParams,
  FractalParamsBuildRules,
  transformToFractalCoord,
} from "@/features/fractals";
import { sum, Vector2 } from "@/shared/libs/vectors";
import { makeArrayFromRules, RuleType } from "@/shared/libs/numberRule";

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
    time: number,
  },
  timeMultiplier: string;
  selectAreaActive: boolean;
  currentTime: number;
};

export type EditStoreActions = {
  dynamicRuleChange: <K extends keyof FractalDynamicParamsBuildRules>(
    name: K,
    value: FractalDynamicParamsBuildRules[K]
  ) => void;
  dynamicRuleChangeByRoute: (
    route: string[],
    value: FractalDynamicParamsBuildRules[keyof FractalDynamicParamsBuildRules]
  ) => void;

  dynamicParamOverride: (route: string[], value: unknown) => void;

  staticRuleChange: (
    name: keyof Omit<FractalParamsBuildRules, "dynamic">,
    value: FractalParamsBuildRules[keyof Omit<
      FractalParamsBuildRules,
      "dynamic"
    >]
  ) => void;
  toggleAnimation: () => void;
  changeAnimationSpeed: (speed: string) => void;
  toggleAreaSelection: () => void;
  zoomToArea: (
    startCoord: [number, number],
    size: [number, number],
    containerSize: [number, number]
  ) => void;
  resetViewport: () => void;
  magnifyViewport: (factor: number) => void;

  updateCurrentTime: (time: number) => void;
  initialLoopStateChange: (time: number) => void;
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
        selectAreaActive: false,
        currentTime: 0,
        initialLoopState: {
          time: 0,
        },
        actions: {
          initialLoopStateChange: (time: number) => {
            set((prev) => {
              prev.initialLoopState = { time };
            });
          },

          updateCurrentTime: (time: number) => {
            set((prev) => {
              prev.currentTime = time;
            });
          },

          dynamicRuleChange: <K extends keyof FractalDynamicParamsBuildRules>(
            name: K,
            value: FractalDynamicParamsBuildRules[K]
          ) => {
            set((prev) => {
              prev.fractal.dynamic[name] = value;
            });
          },

          dynamicRuleChangeByRoute: (
            route: string[],
            value: FractalDynamicParamsBuildRules[keyof FractalDynamicParamsBuildRules]
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

          toggleAreaSelection: () => {
            set((prev) => {
              prev.selectAreaActive = !prev.selectAreaActive;
            });
          },

          zoomToArea: (startCoord, size, containerSize) => {
            set((prev) => {
              const end: Vector2 = sum(startCoord, size);

              const rl: Vector2 = makeArrayFromRules(
                prev.fractal.dynamic.rlVisibleRange,
                0
              );
              const im: Vector2 = makeArrayFromRules(
                prev.fractal.dynamic.imVisibleRange,
                0
              );

              const fractalStart = transformToFractalCoord(
                startCoord,
                containerSize,
                rl,
                im
              );
              const fractalEnd = transformToFractalCoord(
                end,
                containerSize,
                rl,
                im
              );

              prev.fractal.dynamic.rlVisibleRange = [
                { t: RuleType.StaticNumber, value: fractalStart[0] },
                { t: RuleType.StaticNumber, value: fractalEnd[0] },
              ];

              prev.fractal.dynamic.imVisibleRange = [
                { t: RuleType.StaticNumber, value: fractalEnd[1] },
                { t: RuleType.StaticNumber, value: fractalStart[1] },
              ];

              prev.selectAreaActive = false;
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
              prev.fractal.dynamic.rlVisibleRange.forEach((e) => {
                if (e.t === RuleType.StaticNumber) {
                  e.value *= factor
                }
              });

              prev.fractal.dynamic.imVisibleRange.forEach((e) => {
                if (e.t === RuleType.StaticNumber) {
                  e.value *= factor
                }
              });
            });
          },
        },
      })
    )
  );

  return store;
};
