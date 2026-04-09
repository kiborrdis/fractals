import {
  FractalParams,
  FractalParamsBuildRules,
  GradientStop,
} from "@/features/fractals";
import { StateCreator } from "zustand";

type DeepPartial<T> = T extends object
  ? {
      [K in keyof T]?: DeepPartial<T[K]>;
    }
  : T;

export type OverridesSlice = {
  fractalOverrides: DeepPartial<FractalParams>;

  actions: {
    customParamOverride: (route: string[], value: unknown) => void;
    dynamicParamOverride: (route: string[], value: unknown) => void;
    staticParamOverride: (
      name: keyof Omit<FractalParamsBuildRules, "dynamic" | "custom">,
      value: unknown,
    ) => void;
    gradientsOverride: (
      index: number,
      value: GradientStop[] | undefined,
    ) => void;
  };
};

export const createOverrideSlice =
  <Slice extends OverridesSlice>(): StateCreator<
    Slice,
    [["zustand/immer", never]],
    [],
    OverridesSlice
  > =>
  (set) => ({
    fractalOverrides: {},
    actions: {
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

            if (route[i + 1] !== undefined) {
              const isNextNumberPart = !isNaN(Number(route[i + 1]));

              if (isNextNumberPart) {
                if (target[part] === undefined) {
                  target[part] = [];
                }
              } else {
                if (target[part] === undefined) {
                  target[part] = {};
                }
              }
            }

            target = target[part];
          }

          target[route[route.length - 1]] = value;
        });
      },

      staticParamOverride: (name, value) => {
        set((prev) => {
          if (value === undefined) {
            delete (prev.fractalOverrides as Record<string, unknown>)[name];
          } else {
            (prev.fractalOverrides as Record<string, unknown>)[name] = value;
          }
        });
      },

      gradientsOverride: (index, value) => {
        set((prev) => {
          if (!prev.fractalOverrides.gradients) {
            prev.fractalOverrides.gradients = [];
          }
          const gradients = prev.fractalOverrides.gradients as (
            | GradientStop[]
            | undefined
          )[];
          if (value === undefined) {
            gradients[index] = undefined;
            if (gradients.every((g) => g === undefined)) {
              delete (prev.fractalOverrides as Record<string, unknown>)
                .gradients;
            }
          } else {
            gradients[index] = value;
          }
        });
      },
    },
  });
