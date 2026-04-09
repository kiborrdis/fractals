import { memo } from "react";
import {
  Button,
  Tooltip,
  Group,
  Stack,
  ActionIcon,
  Badge,
  Divider,
  Text,
  SimpleGrid,
} from "@mantine/core";
import { FiCircle, FiMinus, FiArrowRight, FiX } from "react-icons/fi";
import { FractalTrap } from "@/features/fractals";
import { Vector2 } from "@/shared/libs/vectors";
import { useActions } from "../../stores/editStore/data/useActions";
import { FloatingPanel } from "../../ui/FloatingPanel/FloatingPanel";
import { DocTooltip, mergeDocKeys } from "@/shared/ui/DocTooltip";
import { BiQuestionMark } from "react-icons/bi";

const getTrapTypeIndices = (traps: FractalTrap[]) => {
  const typeCounters: Record<string, number> = {};
  return traps.map((trap) => {
    const count = typeCounters[trap.type] ?? 0;
    typeCounters[trap.type] = count + 1;
    return count;
  });
};

const getTrapLabel = (trap: FractalTrap, typeIndex: number) =>
  `${trap.type.charAt(0).toUpperCase()}${trap.type.slice(1)} ${typeIndex}`;

export const TrapEditModePanel = memo(
  ({
    traps,
    offset,
    axisRangeSizes,
    highlightedTrapIndex,
    onHighlightChange,
  }: {
    traps: FractalTrap[];
    offset: Vector2;
    axisRangeSizes: Vector2;
    highlightedTrapIndex: number | null;
    onHighlightChange: (index: number | null) => void;
  }) => {
    const { toggleTrapEditMode, addTrap, removeTrap } = useActions();

    const cx = -offset[0];
    const cy = -offset[1];

    const handleAddLine = () => {
      addTrap({ type: "line", a: 0, b: 1, c: -cy });
    };

    const handleAddCircle = () => {
      addTrap({
        type: "circle",
        center: [cx, cy],
        radius: axisRangeSizes[0] * 0.1,
      });
    };

    const handleAddSegment = () => {
      const hw = axisRangeSizes[0] * 0.2;
      addTrap({ type: "segment", p1: [cx - hw, cy], p2: [cx + hw, cy] });
    };

    const typeIndices = getTrapTypeIndices(traps);

    return (
      <FloatingPanel>
        <Stack gap='xs'>
          <Text size='xs' fw={600} c='dimmed'>
            Add trap
          </Text>
          <Group gap={4}>
            <Tooltip label='Add line trap' position='bottom' withArrow>
              <ActionIcon size='sm' variant='light' onClick={handleAddLine}>
                <FiMinus />
              </ActionIcon>
            </Tooltip>
            <Tooltip label='Add circle trap' position='bottom' withArrow>
              <ActionIcon size='sm' variant='light' onClick={handleAddCircle}>
                <FiCircle />
              </ActionIcon>
            </Tooltip>
            <Tooltip label='Add segment trap' position='bottom' withArrow>
              <ActionIcon size='sm' variant='light' onClick={handleAddSegment}>
                <FiArrowRight />
              </ActionIcon>
            </Tooltip>
          </Group>

          {traps.length > 0 && (
            <>
              <Divider />
              <Text size='xs' fw={600} c='dimmed'>
                Traps
              </Text>
              <SimpleGrid cols={3} spacing='xs'>
                {traps.map((trap, i) => (
                  <Badge
                    key={i}
                    size='xs'
                    variant={highlightedTrapIndex === i ? "filled" : "light"}
                    rightSection={
                      <ActionIcon
                        size={10}
                        variant='transparent'
                        color='red'
                        onClick={() => removeTrap(i)}
                      >
                        <FiX size={8} />
                      </ActionIcon>
                    }
                    onMouseEnter={() => onHighlightChange(i)}
                    onMouseLeave={() => onHighlightChange(null)}
                    style={{ cursor: "default" }}
                  >
                    {getTrapLabel(trap, typeIndices[i])}
                  </Badge>
                ))}
              </SimpleGrid>
            </>
          )}

          <Divider />
          <Group wrap='nowrap'>
            <DocTooltip
              docKeys={mergeDocKeys("trap-edit-mode")}
              anchor={
                <ActionIcon size='sm' variant='outline' color='gray'>
                  <BiQuestionMark />
                </ActionIcon>
              }
            />
            <Tooltip label='Exit trap edit mode' position='bottom' withArrow>
              <Button
                size='compact-xs'
                color='red'
                variant='outline'
                fullWidth
                onClick={toggleTrapEditMode}
              >
                Exit mode
              </Button>
            </Tooltip>
          </Group>
        </Stack>
      </FloatingPanel>
    );
  },
);

TrapEditModePanel.displayName = "TrapEditModePanel";
