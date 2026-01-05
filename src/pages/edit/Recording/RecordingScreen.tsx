import { AppShell, AppShellAside, AppShellMain, Stack } from "@mantine/core";
import { RecordingStoreProvider } from "./store/provider";
import { useRecordingActions } from "./store/data/useRecordingActions";
import { useRecordingSettings } from "./store/data/useRecordingSettings";
import { useRecordingStatus } from "./store/data/useRecordingStatus";
import { useFractalParamsData } from "../stores/editStore/data/useFractalParamsData";
import { useAnimationData } from "../stores/editStore/data/useAnimationData";
import { useActions } from "../stores/editStore/data/useActions";
import { useEditStore } from "../stores/editStore/provider";
import { RecordingSidebar } from "./Sidebar/RecordingSidebar";
import { RecordingRenderingState } from "./States/RecordingRenderingState";
import { RecordingPreviewState } from "./States/RecordingPreviewState";
import { RecordingTimelineTool } from "./RecordingTimelineTool/RecordingTimelineTool";
import styles from "./RecordingScreen.module.css";

const initialLoopStateDefault = { time: 0 };

const RecordingScreenContent = ({ onExit }: { onExit: () => void }) => {
  const recordingActions = useRecordingActions();
  const status = useRecordingStatus();
  const settings = useRecordingSettings();
  const { play } = useAnimationData();
  const { toggleAnimation, changeAnimationSpeed, updateCurrentTime } =
    useActions();
  const fractal = useFractalParamsData();
  const currentTime = useEditStore(
    (state: { currentTime: number }) => state.currentTime,
  );
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
                initialLoopState={initialLoopStateDefault}
                onRender={updateCurrentTime}
              />
            )}
          </div>
          <RecordingTimelineTool currentTime={currentTime} />
        </Stack>
      </AppShellMain>
    </AppShell>
  );
};
export const RecordingScreen = ({ onExit }: { onExit: () => void }) => (
  <RecordingStoreProvider>
    <RecordingScreenContent onExit={onExit} />
  </RecordingStoreProvider>
);
