import { ActionIcon, Group, Select, Stack, Text, Tooltip } from "@mantine/core";
import { TbArrowDown, TbArrowUp } from "react-icons/tb";
import { BlendMode, ColoringMode, ColoringEntry } from "@/features/fractals";
import { useStaticRule } from "../../stores/editStore/data/useStaticRule";
import { useActions } from "../../stores/editStore/data/useActions";

const defaultColoring: ColoringEntry[] = [
  { type: ColoringMode.Iterations, blend: BlendMode.Normal },
];

const coloringModeLabels: Record<ColoringMode, string> = {
  [ColoringMode.Iterations]: "Gradient",
  [ColoringMode.Border]: "Border",
  [ColoringMode.Trap]: "Trap",
};

const blendModeOptions = Object.entries({
  [BlendMode.Normal]: "Normal",
  [BlendMode.Add]: "Add",
  [BlendMode.Multiply]: "Multiply",
  [BlendMode.Screen]: "Screen",
  [BlendMode.ColorDodge]: "Color Dodge",
  [BlendMode.ColorBurn]: "Color Burn",
  [BlendMode.Lighten]: "Lighten",
  [BlendMode.Darken]: "Darken",
  [BlendMode.Difference]: "Difference",
  [BlendMode.Exclusion]: "Exclusion",
  [BlendMode.Overlay]: "Overlay",
  [BlendMode.HardLight]: "Hard Light",
  [BlendMode.InvertedOverlay]: "Inverted Overlay",
  [BlendMode.InvertedHardLight]: "Inverted Hard Light",
  [BlendMode.SoftLight]: "Soft Light",
}).map(([value, label]) => ({ value, label }));

export const BlendingModes = () => {
  const [coloring] = useStaticRule("coloring");
  const { staticRuleChange } = useActions();

  const currentColoring = coloring ?? defaultColoring;

  const handleBlendChange = (index: number, blend: BlendMode) => {
    const newColoring = currentColoring.map((entry, i) =>
      i === index ? { ...entry, blend } : entry,
    );
    staticRuleChange("coloring", newColoring);
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newColoring = [...currentColoring];
    [newColoring[index - 1], newColoring[index]] = [
      newColoring[index],
      newColoring[index - 1],
    ];
    staticRuleChange("coloring", newColoring);
  };

  const handleMoveDown = (index: number) => {
    if (index === currentColoring.length - 1) return;
    const newColoring = [...currentColoring];
    [newColoring[index], newColoring[index + 1]] = [
      newColoring[index + 1],
      newColoring[index],
    ];
    staticRuleChange("coloring", newColoring);
  };

  if (currentColoring.length === 0) return null;

  return (
    <Stack gap="xs">
      {currentColoring.map((entry, index) => (
        <Group key={entry.type} justify="space-between" align="center">
          <Text size="sm" fw={500}>
            {coloringModeLabels[entry.type]}
          </Text>
          <Group gap={4}>
            <Tooltip label="Move layer up" position="bottom">
              <ActionIcon
                size="xs"
                variant="subtle"
                disabled={index === 0}
                onClick={() => handleMoveUp(index)}
              >
                <TbArrowUp size={16} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Move layer down" position="bottom">
              <ActionIcon
                size="xs"
                variant="subtle"
                disabled={index === currentColoring.length - 1}
                onClick={() => handleMoveDown(index)}
              >
                <TbArrowDown size={16} />
              </ActionIcon>
            </Tooltip>
            <Select
              size="xs"
              w={130}
              disabled={index === 0}
              value={String(entry.blend)}
              onChange={(val) =>
                val && handleBlendChange(index, Number(val) as BlendMode)
              }
              data={blendModeOptions}
              allowDeselect={false}
            />
          </Group>
        </Group>
      ))}
    </Stack>
  );
};
