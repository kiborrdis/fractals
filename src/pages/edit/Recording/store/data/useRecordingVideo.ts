import { useRecordingStore } from "../provider";

export const useRecordingVideo = () => {
  const videoUrl = useRecordingStore((state) => state.videoUrl);
  const errorMessage = useRecordingStore((state) => state.errorMessage);

  return {
    videoUrl,
    errorMessage,
  };
};
