import { useEffect, useRef, useState } from "react";
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
import {
  FractalParamsBuildRules,
  serializeBuildRules,
} from "@/features/fractals";
import { FaPause, FaPlay } from "react-icons/fa";
import { EditStoreProvider, useEditStore } from "./stores/editStore/provider";
import { createEditStore } from "./stores/editStore/editStore";
import { useActions } from "./stores/editStore/data/useActions";
import { useAnimationData } from "./stores/editStore/data/useAnimationData";
import { TimelineTool } from "./layout/Timeline/TimelineTool";
import { ShapeParams } from "./layout/SidebarSettings/SidebarSettings";
import { FiShare2 } from "react-icons/fi";
import styles from "./EditFractal.module.css";
import { DocModalProvider } from "@/shared/ui/DocTooltip";
import { TbVideo } from "react-icons/tb";
import { RecordingScreen } from "./Recording/RecordingScreen";
import { SettingsProvider } from "./stores/settings";
import { ContentArea } from "./layout/ContentArea/ContentArea";

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
          <EditFractalLoaded />
        </EditStoreProvider>
      </DocModalProvider>
    </SettingsProvider>
  );
}

export const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text).catch((err) => {
    console.error("Could not copy text: ", err);
  });
};

export function EditFractalLoaded() {
  const [isRecordingMode, setIsRecordingMode] = useState(false);
  const { play, timeMultiplier } = useAnimationData();
  const { toggleAnimation, changeAnimationSpeed } = useActions();

  const handleExitRecording = () => {
    setIsRecordingMode(false);
    changeAnimationSpeed("1.0x");
  };

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
              <ShareButton />
            </Group>
          </Group>
          <ShapeParams />
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

const ShareButton = () => {
  const fractal = useEditStore((state) => state.fractal);

  return (
    <ActionIcon
      variant='subtle'
      onClick={async () => {
        const encoded = await serializeBuildRules(fractal);
        copyToClipboard(
          window.location.origin + "/view?s=" + encodeURIComponent(encoded),
        );
      }}
    >
      <FiShare2 />
    </ActionIcon>
  );
};
