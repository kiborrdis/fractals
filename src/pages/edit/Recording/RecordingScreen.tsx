import { AppShell, AppShellAside, AppShellMain, Stack } from "@mantine/core";
import { RecordingStoreProvider } from "./store/provider";
import { useRecordingActions } from "./store/data/useRecordingActions";
import { useRecordingSettings } from "./store/data/useRecordingSettings";
import { useRecordingStatus } from "./store/data/useRecordingStatus";
import { useFractalParamsData } from "../stores/editStore/data/useFractalParamsData";
import { useAnimationData } from "../stores/editStore/data/useAnimationData";
import { useActions } from "../stores/editStore/data/useActions";
import { RecordingSidebar } from "./Sidebar/RecordingSidebar";
import { RecordingRenderingState } from "./States/RecordingRenderingState";
import { RecordingPreviewState } from "./States/RecordingPreviewState";
import { RecordingTimelineTool } from "./RecordingTimelineTool/RecordingTimelineTool";
import styles from "./RecordingScreen.module.css";
import { useInitialTime } from "../stores/editStore/data/useCurrentTime";
import { useMemo } from "react";

const RecordingScreenContent = ({ onExit }: { onExit: () => void }) => {
  const recordingActions = useRecordingActions();
  const status = useRecordingStatus();
  const time = useInitialTime();

  const initialLoopState = useMemo(() => {
    return { time: time ?? 0 };
  }, [time]);

  const settings = useRecordingSettings();
  const fractal = useFractalParamsData();
  const { play } = useAnimationData();
  const { toggleAnimation, changeAnimationSpeed, updateCurrentTime } =
    useActions();

  const isRecording = status === "recording";

  return (
    <AppShell
      mih='100vh'
      aside={{
        width: "350px",
        breakpoint: "xs",
      }}
    >
      <AppShellAside className={styles.asideWithScroll}>
        <RecordingSidebar
          play={play}
          onBack={() => {
            recordingActions.exitRecordingMode(() => onExit());
          }}
          onToggleAnimation={toggleAnimation}
          onChangeSpeed={(multiplier: number) => {
            recordingActions.updateSettings({ timeMultiplier: multiplier });
            changeAnimationSpeed(multiplier.toFixed(1) + "x");
          }}
          onStartRecording={() => {
            recordingActions.startRecording(fractal);
          }}
        />
      </AppShellAside>
      <AppShellMain h='100vh'>
        <Stack w='100%' h='100%' gap={0}>
          <div className={styles.mainAreaContainer}>
            {isRecording ? (
              <RecordingRenderingState />
            ) : (
              <RecordingPreviewState
                fractal={fractal}
                play={play}
                timeMultiplier={settings.timeMultiplier}
                initialLoopState={initialLoopState}
                onRender={updateCurrentTime}
              />
            )}
          </div>
          <RecordingTimelineTool />
        </Stack>
      </AppShellMain>
    </AppShell>
  );
};
export const RecordingScreen = ({ onExit }: { onExit: () => void }) => {
  const time = useInitialTime();

  return (
    <RecordingStoreProvider time={time}>
      <RecordingScreenContent onExit={onExit} />
    </RecordingStoreProvider>
  );
};
