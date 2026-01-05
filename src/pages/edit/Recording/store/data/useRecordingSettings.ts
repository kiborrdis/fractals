import { useRecordingStore } from "../provider";

export const useRecordingSettings = () => {
  const settings = useRecordingStore((state) => state.settings);

  return settings;
};
