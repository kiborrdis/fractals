import { ColoringEntry, ColoringMode, BlendMode } from "@/features/fractals";
import { mergeDocKeys } from "@/shared/ui/DocTooltip";
import { Stack, Paper, Group, Text, Switch, Collapse } from "@mantine/core";
import { ReactNode } from "react";
import { useActions } from "../../stores/editStore/data/useActions";
import { useStaticRule } from "../../stores/editStore/data/useStaticRule";
import { useSetting } from "../../stores/settings";
import { EditorDocTooltip } from "../../ui/EditorDocTooltip";

const defaultColoring: ColoringEntry[] = [
  { type: ColoringMode.Iterations, blend: BlendMode.Normal },
];
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
  coloringType, children,
}: {
  coloringType: "gradient" | "border" | "trap" | "normal" | "stripesAverage";
  children: ReactNode;
}) => {
  const [coloring] = useStaticRule("coloring");
  const { staticRuleChange } = useActions();
  const coloringLayers = useSetting("coloringLayers");

  const currentColoring = coloring ?? defaultColoring;
  const thisMode = coloringTypeToMode[coloringType];
  const isEnabled = currentColoring.some((c) => c.type === thisMode);

  const handleToggle = () => {
    if (coloringLayers) {
      if (isEnabled) {
        if (currentColoring.length > 1) {
          staticRuleChange(
            "coloring",
            currentColoring.filter((c) => c.type !== thisMode)
          );
        }
      } else {
        staticRuleChange("coloring", [
          ...currentColoring,
          { type: thisMode, blend: BlendMode.Normal },
        ]);
      }
    } else {
      if (!isEnabled) {
        staticRuleChange("coloring", [
          { type: thisMode, blend: BlendMode.Normal },
        ]);
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
              docKeys={mergeDocKeys(`coloring-${coloringType}`)} />
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
