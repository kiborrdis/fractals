import { FractalParamsBuildRules, FractalTrap } from "@/features/fractals";
import { StateCreator } from "zustand";

export type TrapSlice = {
  trapEditMode: boolean;

  actions: {
    toggleTrapEditMode: () => void;
    updateTrap: (index: number, trap: FractalTrap) => void;
    addTrap: (trap: FractalTrap) => void;
    removeTrap: (index: number) => void;
  };
};

export const createTrapSlice =
  <
    Slice extends TrapSlice & { fractal: FractalParamsBuildRules },
  >(): StateCreator<Slice, [["zustand/immer", never]], [], TrapSlice> =>
  (set) => ({
    trapEditMode: false,

    actions: {
      toggleTrapEditMode: () => {
        set((prev) => {
          prev.trapEditMode = !prev.trapEditMode;
        });
      },

      updateTrap: (index: number, trap: FractalTrap) => {
        set((prev) => {
          const traps = prev.fractal.traps;
          if (traps && index >= 0 && index < traps.length) {
            traps[index] = trap;
          }
        });
      },

      addTrap: (trap: FractalTrap) => {
        set((prev) => {
          const fractal = prev.fractal;
          const traps = prev.fractal.traps;
          if (traps) {
            traps.push(trap);
          } else {
            fractal.traps = [trap];
          }
        });
      },

      removeTrap: (index: number) => {
        set((prev) => {
          const traps = prev.fractal.traps;

          if (traps && index >= 0 && index < traps.length) {
            traps.splice(index, 1);
          }
        });
      },
    },
  });
