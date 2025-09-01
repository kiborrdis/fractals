import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import {
  FractalDynamicParamsBuildRules,
  FractalParamsBuildRules,
  RuleType,
  Vector2,
} from "../../fractals/types";
import { makeArrayFromRules } from "../../ruleConversion";
import { transformToFractalCoord } from "../../fractals/utils";
import { sum } from "../../vectorOperations";

export type EditStoreData = {
  fractal: FractalParamsBuildRules;
  play: boolean;
  timeMultiplier: string;
  selectAreaActive: boolean;
  currentTime: number;
};

export type EditStoreActions = {
  dynamicRuleChange: <K extends keyof FractalDynamicParamsBuildRules>(
    name: K,
    value: FractalDynamicParamsBuildRules[K]
  ) => void;
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
  updateCurrentTime: (time: number) => void;
};

export type EditStore = EditStoreData & { actions: EditStoreActions };

export const createEditStore = (fractalRules: FractalParamsBuildRules) => {
  const store = create<EditStore>()(
    immer(
      (set): EditStore => ({
        fractal: fractalRules,
        play: false,
        timeMultiplier: "1.0x",
        selectAreaActive: false,
        currentTime: 0,
        
        actions: {
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
        },
      })
    )
  );

  return store;
};
