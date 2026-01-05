import { Stack } from "@mantine/core";
import { FractalParamsBuildRules } from "@/features/fractals";
import { RecordingRenderingState } from "./States/RecordingRenderingState";
import { RecordingPreviewState } from "./States/RecordingPreviewState";
import { useRecordingStatus } from "./store/data/useRecordingStatus";
import { RecordingTimelineTool } from "./RecordingTimelineTool/RecordingTimelineTool";
import styles from "./RecordingScreen.module.css";

export const RecordingMainArea = ({
  fractal,
  play,
  timeMultiplier,
  initialLoopState,
  onRender,
  currentTime,
}: {
  fractal: FractalParamsBuildRules;
  play: boolean;
  timeMultiplier: number;
  initialLoopState: { time: number };
  onRender: (time: number) => void;
  currentTime: number;
}) => {
  const status = useRecordingStatus();
  const isRecording = status === "recording";

  return (
    <Stack
      w='100%'
      h='100%'
      gap={0}
      className={styles.mainAreaStackWithPosition}
    >
      <div className={styles.mainAreaContainer}>
        {isRecording ? (
          <RecordingRenderingState />
        ) : (
          <RecordingPreviewState
            fractal={fractal}
            play={play}
            timeMultiplier={timeMultiplier}
            initialLoopState={initialLoopState}
            onRender={onRender}
          />
        )}
      </div>
      <RecordingTimelineTool currentTime={currentTime} />
    </Stack>
  );
};
