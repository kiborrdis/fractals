import { useRecordingStore } from "../provider";

export const useRecordingActions = () => {
  const actions = useRecordingStore((state) => state.actions);

  return actions;
};
