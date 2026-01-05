import { useEditStore } from "../provider";

export const useAnimationData = () => {
  const play = useEditStore((state) => state.play);
  const timeMultiplier = useEditStore((state) => state.timeMultiplier);

  return {
    play,
    timeMultiplier,
  };
};
