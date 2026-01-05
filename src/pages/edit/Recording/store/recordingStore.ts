import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import {
  recordFractal,
  RecordingController,
  RecordingSettings,
} from "@/features/fractals/recordFractal";
import { FractalParamsBuildRules } from "@/features/fractals";

export type RecordingStatus =
  | "idle"
  | "ready"
  | "recording"
  | "completed"
  | "error";

export type RecordingStoreData = {
  isRecordingMode: boolean;
  status: RecordingStatus;
  settings: RecordingSettings;
  progress: {
    framesRendered: number;
    totalFrames: number;
  };
  videoUrl: string | null;
  errorMessage: string | null;
};

export type RecordingStoreActions = {
  enterRecordingMode: () => void;
  exitRecordingMode: (resetTimeMultiplier?: () => void) => void;
  updateSettings: (settings: Partial<RecordingSettings>) => void;
  startRecording: (params: FractalParamsBuildRules) => void;
  stopRecording: () => void;
  downloadVideo: () => void;
  resetRecording: () => void;
};

export type RecordingStore = RecordingStoreData & {
  actions: RecordingStoreActions;
};

const defaultSettings: RecordingSettings = {
  width: 1920,
  height: 1080,
  offset: [0, -10],
  scale: 1,
  fps: 60,
  duration: 10000, // 10 seconds in ms
  timeMultiplier: 1,
  startTime: 0,
};

export const createRecordingStore = () => {
  let recordingController: RecordingController | null = null;

  return create<RecordingStore>()(
    immer((set, get) => ({
      isRecordingMode: false,
      status: "idle",
      settings: defaultSettings,
      progress: {
        framesRendered: 0,
        totalFrames: 0,
      },
      videoUrl: null,
      errorMessage: null,
      actions: {
        enterRecordingMode: () => {
          set((state) => {
            state.isRecordingMode = true;
            state.status = "ready";
            state.videoUrl = null;
            state.errorMessage = null;
            state.progress = { framesRendered: 0, totalFrames: 0 };
          });
        },

        exitRecordingMode: (resetTimeMultiplier) => {
          const { status } = get();
          // Can only exit if not currently recording
          if (status === "recording") {
            return;
          }

          // Clean up video URL if exists
          const { videoUrl } = get();
          if (videoUrl) {
            URL.revokeObjectURL(videoUrl);
          }

          // Reset time multiplier to 1x when exiting
          if (resetTimeMultiplier) {
            resetTimeMultiplier();
          }

          set((state) => {
            state.isRecordingMode = false;
            state.status = "idle";
            state.videoUrl = null;
            state.errorMessage = null;
            state.progress = { framesRendered: 0, totalFrames: 0 };
          });
        },

        updateSettings: (newSettings) => {
          set((state) => {
            state.settings = { ...state.settings, ...newSettings };
          });
        },

        startRecording: (params) => {
          const { settings } = get();

          set((state) => {
            state.status = "recording";
            state.progress = {
              framesRendered: 0,
              totalFrames: 0,
            };
            state.videoUrl = null;
            state.errorMessage = null;
          });

          recordingController = recordFractal({
            params,
            settings,
            callbacks: {
              onProgress: (framesRendered, totalFrames) => {
                set((state) => {
                  state.progress = { framesRendered, totalFrames };
                });
              },
              onComplete: (videoUrl) => {
                set((state) => {
                  state.status = "completed";
                  state.videoUrl = videoUrl;
                });
                recordingController = null;
              },
              onError: (message) => {
                set((state) => {
                  state.status = "error";
                  state.errorMessage = message;
                });
                recordingController = null;
              },
            },
          });
        },

        stopRecording: () => {
          if (recordingController) {
            recordingController.stop();
            recordingController = null;
          }

          set((state) => {
            state.status = "ready";
            state.progress = { framesRendered: 0, totalFrames: 0 };
          });
        },

        downloadVideo: () => {
          const { videoUrl } = get();
          if (!videoUrl) return;

          const link = document.createElement("a");
          link.href = videoUrl;
          link.download = `fractal-${Date.now()}.mp4`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        },

        resetRecording: () => {
          const { videoUrl } = get();
          if (videoUrl) {
            URL.revokeObjectURL(videoUrl);
          }

          set((state) => {
            state.status = "ready";
            state.videoUrl = null;
            state.errorMessage = null;
            state.progress = { framesRendered: 0, totalFrames: 0 };
          });
        },
      },
    })),
  );
};
