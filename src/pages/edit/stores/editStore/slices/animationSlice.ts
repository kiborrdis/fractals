import { StateCreator } from "zustand";

export type AnimationSlice = {
  play: boolean;
  timeMultiplier: string;
  currentTime: number;

  actions: {
    toggleAnimation: () => void;
    changeAnimationSpeed: (speed: string) => void;
    updateCurrentTime: (time: number) => void;
  };
};

export const createAnimationSlice =
  <Slice extends AnimationSlice>(): StateCreator<
    Slice,
    [["zustand/immer", never]],
    [],
    AnimationSlice
  > =>
  (set) => ({
    play: false,
    timeMultiplier: "1.0x",
    currentTime: 0,

    actions: {
      toggleAnimation: () => {
        set((prev) => {
          prev.play = !prev.play;
        });
      },
      changeAnimationSpeed: (speed: string) => {
        set((prev) => {
          prev.timeMultiplier = speed;
        });
      },
      updateCurrentTime: (time: number) => {
        set((prev) => {
          prev.currentTime = time;
        });
      },
    },
  });
