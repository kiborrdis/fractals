import { useRecordingStore } from "../provider";

export const useRecordingProgress = () => {
  const progress = useRecordingStore((state) => state.progress);

  return progress;
};
