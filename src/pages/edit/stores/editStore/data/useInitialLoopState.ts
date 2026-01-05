import { useEditStore } from "../provider";

export const useInitialLoopState = () => {
  return useEditStore((state) => state.initialLoopState);
};
