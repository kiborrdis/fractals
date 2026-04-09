import { FractalParams } from "@/features/fractals";
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
  };
};

export const createOverrideSlice = <Slice extends OverridesSlice>(): StateCreator<
  Slice,
  [["zustand/immer", never]],
  [],
  OverridesSlice
> => (set) => ({
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
  },
});