import { useEffect, useRef } from "react";
import {
  ActionIcon,
  AppShell,
  AppShellAside,
  AppShellMain,
  Group,
  SegmentedControl,
  Stack,
} from "@mantine/core";
import {
  DisplayFractal,
  FractalParamsBuildRules,
  getDefaultFractalRules,
} from "@/features/fractals";
import {
  defaultStringify,
  useQueryPersistentValue,
} from "@/shared/hooks/useQueryPersistense";
import { FaPause, FaPlay } from "react-icons/fa";
import { EditStoreProvider, useEditStore } from "./store/provider";
import { createEditStore } from "./store/editStore";
import { useActions } from "./store/data/useActions";
import { useAnimationData } from "./store/data/useAnimationData";
import { useSelectAreaActive } from "./store/data/useSelectAreaActive";
import { useFractalParamsData } from "./store/data/useFractalParamsData";
import { TimelineTool } from "./TimelineTool/TimelineTool";
import { useInitialLoopState } from "./store/data/useInitialLoopState";
import { ShapeParams } from "./SidebarSettings/SidebarSettings";
import { FiShare2 } from "react-icons/fi";
import { SelectArea } from "./SelectArea";

const defaultRules = getDefaultFractalRules();

export function EditFractal({
  onSave,
  extractParam,
}: {
  extractParam?: (key: string) => string | null | undefined;
  onSave?: (k: string, s: string) => void;
}) {
  const [value, saveValue] = useQueryPersistentValue<FractalParamsBuildRules>(
    "s",
    defaultRules,
    {
      extract: extractParam,
      save: onSave,
    },
  );
  const storeRef = useRef<ReturnType<typeof createEditStore>>(null);

  if (!storeRef.current) {
    storeRef.current = createEditStore(value);
  }

  useEffect(() => {
    if (!storeRef.current) {
      return;
    }

    return storeRef.current.subscribe((state) => {
      saveValue(state.fractal);
    });
  }, [saveValue]);

  return (
    <EditStoreProvider store={storeRef.current}>
      <EditFractalLoaded />
    </EditStoreProvider>
  );
}

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text).catch((err) => {
    console.error("Could not copy text: ", err);
  });
};

export const ShareButton = () => {
  const fractal = useEditStore((state) => state.fractal);

  return (
    <ActionIcon
      variant='subtle'
      onClick={() => {
        copyToClipboard(window.location.origin + "/view?s=" + defaultStringify(fractal));
      }}
    >
      <FiShare2 />
    </ActionIcon>
  );
};

export function EditFractalLoaded() {
  const { play, timeMultiplier } = useAnimationData();
  const { toggleAnimation, changeAnimationSpeed } = useActions();

  return (
    <>
      <AppShell
        mih='100vh'
        aside={{
          width: "350px",
          breakpoint: "xs",
        }}
      >
        <AppShellAside style={{ overflowY: "auto" }}>
          <Group
            bg='dark.8'
            p='sm'
            justify='space-between'
            style={{ position: "sticky", top: 0, zIndex: 10 }}
          >
            <Group gap='sm' >
              <ActionIcon variant='subtle' onClick={toggleAnimation}>
                {play ? <FaPause /> : <FaPlay />}
              </ActionIcon>
              <SegmentedControl
                size='xs'
                value={timeMultiplier}
                data={["0.5x", "1x", "2x", "10x"]}
                onChange={changeAnimationSpeed}
              />
            </Group>
            <Group gap='sm'>
              <ShareButton />
            </Group>
          </Group>
          <ShapeParams />
        </AppShellAside>
        <AppShellMain h='100vh'>
          <Stack w='100%' h='100%' gap={0}>
            <div style={{ flex: 1, overflow: "hidden" }}>
              <DisplayEditFractal />
            </div>
            <TimelineTool />
          </Stack>
        </AppShellMain>
      </AppShell>
    </>
  );
}

const DisplayEditFractal = () => {
  const selectAreaActive = useSelectAreaActive();
  const { play, timeMultiplier } = useAnimationData();
  const fractal = useFractalParamsData();
  const initialLoopState = useInitialLoopState();

  const { zoomToArea, updateCurrentTime } = useActions();

  return (
    <SelectArea enable={selectAreaActive} onSelect={zoomToArea}>
      <DisplayFractal
        params={fractal}
        play={play}
        timeMultiplier={parseFloat(timeMultiplier)}
        initialLoopState={initialLoopState}
        onRender={updateCurrentTime}
      />
    </SelectArea>
  );
};

