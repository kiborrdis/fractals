import { ColoringMode } from "@/features/fractals";
import { mergeDocKeys } from "@/shared/ui/DocTooltip";
import { Stack, Paper, Group, Text, Switch, Collapse } from "@mantine/core";
import { ReactNode } from "react";
import { useActions } from "../../stores/editStore/data/useActions";
import { useColoringRules } from "../../stores/editStore/data/useColoringRules";
import { useSetting } from "../../stores/settings";
import { EditorDocTooltip } from "../../ui/EditorDocTooltip";

const coloringTypeToMode = {
  gradient: ColoringMode.Iterations,
  border: ColoringMode.Border,
  trap: ColoringMode.Trap,
  normal: ColoringMode.Normal,
  stripesAverage: ColoringMode.StripesAverage,
} as const;
const coloringLabels = {
  gradient: "Gradient Coloring",
  border: "Border Coloring",
  trap: "Trap Coloring",
  normal: "Normal Coloring",
  stripesAverage: "Stripes Average Coloring",
};
export const ColoringBlock = ({
  coloringType,
  children,
}: {
  coloringType: "gradient" | "border" | "trap" | "normal" | "stripesAverage";
  children: ReactNode;
}) => {
  const coloring = useColoringRules();
  const { addColoringMode, removeColoringMode } = useActions();
  const coloringLayers = useSetting("coloringLayers");

  const thisMode = coloringTypeToMode[coloringType];
  const modeIndex = coloring.findIndex((c) => c[0] === thisMode);
  const isEnabled = modeIndex !== -1;

  const handleToggle = () => {
    if (coloringLayers) {
      if (isEnabled) {
        if (coloring.length > 1) {
          removeColoringMode(modeIndex);
        }
      } else {
        addColoringMode(thisMode);
      }
    } else {
      if (!isEnabled) {
        addColoringMode(thisMode);
      }
    }
  };

  return (
    <Stack gap='lg'>
      <Paper
        withBorder
        p='xs'
        style={{ cursor: "pointer" }}
        onClick={handleToggle}
      >
        <Group justify='space-between'>
          <Group gap={0}>
            <Text size='sm' fw={600}>
              {coloringLabels[coloringType]}
            </Text>
            <EditorDocTooltip
              docKeys={mergeDocKeys(`coloring-${coloringType}`)}
            />
          </Group>
          <Switch checked={isEnabled} onClick={(e) => e.stopPropagation()} />
        </Group>
      </Paper>
      <Collapse keepMounted={false} in={isEnabled}>
        <Stack gap='md' px='0'>
          {children}
        </Stack>
      </Collapse>
    </Stack>
  );
};
