import { ReactNode, useCallback, useEffect, useRef, useState } from "react";
import {
  ActionIcon,
  AppShell,
  AppShellAside,
  AppShellMain,
  Box,
  Group,
  Paper,
  SegmentedControl,
  Stack,
  Text,
} from "@mantine/core";
import {
  DisplayFractal,
  FractalParamsBuildRules,
  getDefaultFractalRules,
} from "@/features/fractals";
import { useQueryPersistentValue } from "@/shared/hooks/useQueryPersistense";
import { FaPause, FaPlay } from "react-icons/fa";
import { EditStoreProvider } from "./store/provider";
import { createEditStore } from "./store/editStore";
import { useActions } from "./store/data/useActions";
import { useAnimationData } from "./store/data/useAnimationData";
import { useSelectAreaActive } from "./store/data/useSelectAreaActive";
import { useFractalParamsData } from "./store/data/useFractalParamsData";
import { TimelineTool } from "./TimelineTool/TimelineTool";
import { useInitialLoopState } from "./store/data/useInitialLoopState";
import { Vector2 } from "@/shared/libs/vectors";
import { ShapeParams } from "./ShapeParams";

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
          <Box style={{ position: "sticky", top: 0, zIndex: 5 }} bg='dark.7'>
            <Paper withBorder p='md'>
              <Stack gap='sm'>
                <Text size='sm'>Animation</Text>
                <Group gap='md'>
                  <ActionIcon
                    size='lg'
                    onClick={toggleAnimation}
                    color={play ? "green" : "red"}
                  >
                    {play ? <FaPlay /> : <FaPause />}
                  </ActionIcon>

                  <SegmentedControl
                    value={timeMultiplier}
                    data={["0.5x", "1.0x", "2.0x", "5.0x", "10.0x"]}
                    size='sm'
                    onChange={changeAnimationSpeed}
                  />
                </Group>
              </Stack>
            </Paper>
          </Box>
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
        formula={fractal.formula}
        params={fractal}
        play={play}
        timeMultiplier={parseFloat(timeMultiplier)}
        initialLoopState={initialLoopState}
        onRender={updateCurrentTime}
      />
    </SelectArea>
  );
};

const SelectArea = ({
  enable = false,
  children,
  onSelect,
}: {
  enable?: boolean;
  children: ReactNode;
  onSelect: (
    startCoord: Vector2,
    size: Vector2,
    containerSize: Vector2,
  ) => void;
}) => {
  const [startCoords, setStartCoord] = useState<Vector2>([0, 0]);
  const [dims, setDims] = useState<Vector2>([0, 0]);
  const [containerOffset, setContainerOffset] = useState<Vector2>([0, 0]);
  const [containerSize, setContainerSize] = useState<Vector2>([0, 0]);

  const [selectionInProgress, setSelectionInProgress] = useState(false);

  return (
    <div
      ref={useCallback((el: HTMLDivElement) => {
        if (!el) {
          return;
        }

        const bound = el.getBoundingClientRect();

        setContainerOffset([bound.left, bound.top]);
        setContainerSize([bound.width, bound.height]);
      }, [])}
      onMouseDown={
        enable
          ? (e) => {
              setStartCoord([
                e.clientX - containerOffset[0],
                e.clientY - containerOffset[1],
              ]);
              setDims([0, 0]);
              setSelectionInProgress(true);
            }
          : undefined
      }
      onMouseMove={(e) => {
        if (!selectionInProgress) {
          return;
        }
        const newWidth = e.clientX - containerOffset[0] - startCoords[0];
        const newHeight = e.clientY - containerOffset[1] - startCoords[1];
        const biggestSide = Math.max(Math.abs(newWidth), Math.abs(newHeight));

        setDims([
          Math.sign(newWidth) * biggestSide,
          Math.sign(newHeight) * biggestSide,
        ]);
      }}
      onMouseUp={() => {
        if (!selectionInProgress) {
          return;
        }

        setSelectionInProgress(false);
        const { pos, dims: dimensions } = transformToPositiveDims(
          startCoords,
          dims,
        );
        onSelect(pos, dimensions, containerSize);
      }}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
      }}
    >
      {selectionInProgress && (
        <div
          style={{
            position: "absolute",
            ...calcStyleForSquare(startCoords, dims),
            border: "1px dashed rgba(82, 0, 204, 0.5)",
            backgroundColor: "rgba(112, 0, 204, 0.1)",
            pointerEvents: "none",
            zIndex: 1,
          }}
        />
      )}
      {children}
    </div>
  );
};

const transformToPositiveDims = (startCoord: Vector2, dimensions: Vector2) => {
  const pos: Vector2 = [...startCoord];
  const dims: Vector2 = [...dimensions];
  if (dims[0] < 0) {
    pos[0] = pos[0] + dims[0];
    dims[0] = -dims[0];
  }

  if (dims[1] < 0) {
    pos[1] = pos[1] + dims[1];
    dims[1] = -dims[1];
  }

  return { pos, dims };
};

const calcStyleForSquare = (startCoord: Vector2, dimensions: Vector2) => {
  const { pos, dims } = transformToPositiveDims(startCoord, dimensions);

  return {
    top: pos[1],
    left: pos[0],
    width: dims[0],
    height: dims[1],
  };
};

// const findAllRangeRules = (
//   rules: FractalParamsBuildRules
// ): RangeNumberRule[] => {
//   return Object.values(rules.dynamic).reduce((acc, value) => {
//     if (Array.isArray(value)) {
//       acc.push(...value.filter((v) => v.t === RuleType.RangeNumber));
//     } else if (value.t === RuleType.RangeNumber) {
//       acc.push(value);
//     }
//     return acc;
//   }, [] as RangeNumberRule[]);
// };
