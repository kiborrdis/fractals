import {
  FractalCustomRules,
  FractalDynamicParamsBuildRules,
  FractalParamsBuildRules,
} from "@/features/fractals";
import { NumberBuildRule, Vector2BulidRule } from "@/shared/libs/numberRule";
import { StateCreator } from "zustand";
import { AnimationSlice } from "./animationSlice";
import { OverridesSlice } from "./overrideSlice";
import { fractalPresets } from "../presets";

export type FractalRulesSlice = {
  fractal: FractalParamsBuildRules;
  initialLoopState: {
    time: number;
  };

  actions: {
    presetPicked: (presetId: string) => void;
    staticRuleChange: (
      name: keyof Omit<FractalParamsBuildRules, "dynamic">,
      value: FractalParamsBuildRules[keyof Omit<
        FractalParamsBuildRules,
        "dynamic"
      >],
    ) => void;
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
    initialLoopStateChange: (time: number) => void;
  };
};

export const createFractalRulesSlice =
  <Slice extends FractalRulesSlice & OverridesSlice & AnimationSlice>(
    fractalRules: FractalParamsBuildRules,
  ): StateCreator<Slice, [["zustand/immer", never]], [], FractalRulesSlice> =>
  (set) => ({
    fractal: fractalRules,
    initialLoopState: {
      time: fractalRules.initialTime ?? 0,
    },

    actions: {
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

      staticRuleChange: (name, value) => {
        set((prev) => {
          (prev.fractal as Record<string, unknown>)[name] = value;
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

      initialLoopStateChange: (time: number) => {
        set((prev) => {
          prev.initialLoopState = { time };
        });
      },
    },
  });
