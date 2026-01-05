import { useRecordingStore } from "../provider";
import { RecordingStatus } from "../recordingStore";

export const useRecordingStatus = (): RecordingStatus => {
  const status = useRecordingStore((state) => state.status);

  return status;
};

export const useIsRecordingMode = () => {
  const isRecordingMode = useRecordingStore((state) => state.isRecordingMode);

  return isRecordingMode;
};
