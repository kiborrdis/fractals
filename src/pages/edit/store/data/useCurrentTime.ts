import { useEditStore } from "../provider";

export const useCurrentTime = () => {
  const currentTime = useEditStore((state) => state.currentTime);

  return currentTime;
};
