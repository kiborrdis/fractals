import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { FractalParamsBuildRules } from "@/features/fractals";
import { createOverrideSlice, OverridesSlice } from "./slices/overrideSlice";
import { createAnimationSlice, AnimationSlice } from "./slices/animationSlice";
import {
  createCustomVariableSlice,
  CustomVariableSlice,
} from "./slices/customVariableSlice";
import { createTrapSlice, TrapSlice } from "./slices/trapSlice";
import { createColoringSlice, ColoringSlice } from "./slices/coloringSlice";
import { createViewportSlice, ViewportSlice } from "./slices/viewportSlice";
import {
  createFractalRulesSlice,
  FractalRulesSlice,
} from "./slices/fractalRulesSlice";
import { combineSlices, CombineSlices } from "@/shared/libs/zustand-slices";

export type EditStore = CombineSlices<
  [
    AnimationSlice,
    OverridesSlice,
    CustomVariableSlice,
    TrapSlice,
    ColoringSlice,
    ViewportSlice,
    FractalRulesSlice,
  ]
>;

export const createEditStore = (fractalRules: FractalParamsBuildRules) => {
  const store = create<EditStore>()(
    immer(
      (...args): EditStore =>
        combineSlices(
          createAnimationSlice<EditStore>()(...args),
          createOverrideSlice<EditStore>()(...args),
          createCustomVariableSlice<EditStore>()(...args),
          createTrapSlice<EditStore>()(...args),
          createColoringSlice<EditStore>()(...args),
          createViewportSlice<EditStore>()(...args),
          createFractalRulesSlice<EditStore>(fractalRules)(...args),
        ),
    ),
  );

  return store;
};
