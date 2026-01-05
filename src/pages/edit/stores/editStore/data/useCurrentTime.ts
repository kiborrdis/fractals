import { useEditStore } from "../provider";

export const useCurrentTime = () => {
  const currentTime = useEditStore((state) => state.currentTime);

  return currentTime;
};

export const useInitialTime = () => {
  const initialTime = useEditStore((state) => state.fractal.initialTime ?? 0);

  return initialTime;
};
