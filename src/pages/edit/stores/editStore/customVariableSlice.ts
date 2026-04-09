import { FractalParamsBuildRules } from "@/features/fractals";
import { RuleType } from "@/shared/libs/numberRule";
import { StateCreator } from "zustand";

export type CustomVariableSlice = {
  actions: {
    customVariableCreate: (name: string, type: "number" | "vector2") => void;
    customVariableDelete: (name: string) => void;
  };
};

export const createCustomVariableSlice =
  <
    Slice extends CustomVariableSlice & { fractal: FractalParamsBuildRules },
  >(): StateCreator<
    Slice,
    [["zustand/immer", never]],
    [],
    CustomVariableSlice
  > =>
  (set) => ({
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
    },
  });
