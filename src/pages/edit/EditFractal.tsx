import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActionIcon,
  AppShell,
  AppShellAside,
  AppShellMain,
  Group,
  SegmentedControl,
  Stack,
  Tooltip,
} from "@mantine/core";
import { FractalParamsBuildRules } from "@/features/fractals";
import { FaPause, FaPlay } from "react-icons/fa";
import { EditStoreProvider } from "./stores/editStore/provider";
import { createEditStore } from "./stores/editStore/editStore";
import { useActions } from "./stores/editStore/data/useActions";
import { useAnimationData } from "./stores/editStore/data/useAnimationData";
import { TimelineTool } from "./layout/Timeline/TimelineTool";
import { ShapeParams } from "./layout/SidebarSettings/SidebarSettings";
import styles from "./EditFractal.module.css";
import { DocModalProvider } from "@/shared/ui/DocTooltip";
import { TbSettings, TbVideo } from "react-icons/tb";
import { RecordingScreen } from "./Recording/RecordingScreen";
import { SettingsProvider } from "./stores/settings";
import { ContentArea } from "./layout/ContentArea/ContentArea";
import { EditorSettings } from "./layout/EditorSettings/EditorSettings";
import { ShareButton } from "./ShareButton";
import { GraphMapParamProvider } from "./stores/graphMapState";

export function EditFractal({
  data,
  onSave,
}: {
  data: FractalParamsBuildRules;
  onSave?: (data: FractalParamsBuildRules) => void;
}) {
  const storeRef = useRef<ReturnType<typeof createEditStore>>(null);

  if (!storeRef.current) {
    storeRef.current = createEditStore(data);
  }

  useEffect(() => {
    if (!storeRef.current) {
      return;
    }

    return storeRef.current.subscribe((state) => {
      if (onSave) {
        onSave(state.fractal);
      }
    });
  }, [onSave]);

  return (
    <SettingsProvider>
      <DocModalProvider>
        <EditStoreProvider store={storeRef.current}>
          <GraphMapParamProvider>
            <EditFractalLoaded />
          </GraphMapParamProvider>
        </EditStoreProvider>
      </DocModalProvider>
    </SettingsProvider>
  );
}

export function EditFractalLoaded() {
  const [isRecordingMode, setIsRecordingMode] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { play, timeMultiplier } = useAnimationData();
  const { toggleAnimation, changeAnimationSpeed } = useActions();

  const handleExitRecording = useCallback(() => {
    setIsRecordingMode(false);
    changeAnimationSpeed("1.0x");
  }, [changeAnimationSpeed]);

  if (isRecordingMode) {
    return (
      <div className={styles.editFractalLoaded}>
        <RecordingScreen onExit={handleExitRecording} />
      </div>
    );
  }

  return (
    <div className={styles.editFractalLoaded}>
      <AppShell
        mih='100vh'
        aside={{
          width: "350px",
          breakpoint: "xs",
        }}
      >
        <AppShellAside className={styles.asideContainer}>
          <Group
            bg='dark.8'
            p='sm'
            justify='space-between'
            className={styles.stickyHeader}
          >
            <Group gap='sm'>
              <ActionIcon variant='subtle' onClick={toggleAnimation}>
                {play ? <FaPause /> : <FaPlay />}
              </ActionIcon>
              <SegmentedControl
                size='xs'
                value={timeMultiplier}
                data={["0.5x", "1.0x", "2.0x", "10x"]}
                onChange={changeAnimationSpeed}
              />
            </Group>
            <Group gap='sm'>
              <Tooltip label='Record Video'>
                <ActionIcon
                  variant='subtle'
                  onClick={() => setIsRecordingMode(true)}
                >
                  <TbVideo />
                </ActionIcon>
              </Tooltip>
              <Tooltip label='Editor Settings'>
                <ActionIcon
                  variant={isSettingsOpen ? "light" : "subtle"}
                  onClick={() => setIsSettingsOpen((v) => !v)}
                >
                  <TbSettings />
                </ActionIcon>
              </Tooltip>
              <ShareButton />
            </Group>
          </Group>
          {isSettingsOpen ? (
            <EditorSettings onClose={() => setIsSettingsOpen(false)} />
          ) : (
            <ShapeParams />
          )}
        </AppShellAside>
        <AppShellMain h='100vh'>
          <Stack w='100%' h='100%' gap={0}>
            <div className={styles.contentContainer}>
              <ContentArea />
            </div>
            <TimelineTool />
          </Stack>
        </AppShellMain>
      </AppShell>
    </div>
  );
}
