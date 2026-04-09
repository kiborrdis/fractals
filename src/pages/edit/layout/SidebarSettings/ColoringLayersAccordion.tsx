import {
  Accordion,
  ActionIcon,
  Group,
  Menu,
  Select,
  Stack,
  Text,
} from "@mantine/core";
import { ReactNode } from "react";
import {
  TbArrowDown,
  TbArrowUp,
  TbDots,
  TbPlus,
  TbTrash,
} from "react-icons/tb";
import {
  BlendMode,
  ColoringBuildRule,
  ColoringMode,
} from "@/features/fractals";
import { mergeDocKeys } from "@/shared/ui/DocTooltip";
import { useActions } from "../../stores/editStore/data/useActions";
import { useColoringRules } from "../../stores/editStore/data/useColoringRules";
import { EditorLabel } from "../../ui/EditorLabel";
import { InterationColoringEdit } from "../../fields/IterationColoringEdit/InterationColoringEdit";
import { TrapColoringEdit } from "../../fields/TrapColoringEdit/TrapColoringEdit";
import { BorderColoringEdit } from "../../fields/BorderColoringEdit/BorderColoringEdit";
import { SettingsSection } from "./SettingsSection";

const coloringModeLabels: Record<ColoringMode, string> = {
  [ColoringMode.Iterations]: "Gradient",
  [ColoringMode.Border]: "Border",
  [ColoringMode.Trap]: "Trap",
  [ColoringMode.Normal]: "Normal",
  [ColoringMode.StripesAverage]: "Stripes Average",
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

const allColoringModes: ColoringMode[] = [
  ColoringMode.Iterations,
  ColoringMode.Border,
  ColoringMode.Trap,
  ColoringMode.Normal,
  ColoringMode.StripesAverage,
];

export const ColoringLayersAccordion = () => {
  const coloring = useColoringRules();
  const {
    editColoringBlend,
    moveColoringLayer,
    addColoringMode,
    removeColoringMode,
  } = useActions();

  const renderColoringSettings = (
    entry: ColoringBuildRule,
    index: number,
  ): ReactNode => {
    const mode = entry[0];
    switch (mode) {
      case ColoringMode.Iterations:
        return <InterationColoringEdit coloringIndex={index} />;
      case ColoringMode.Border:
        return <BorderColoringEdit coloringIndex={index} />;
      case ColoringMode.Trap:
        return <TrapColoringEdit coloringIndex={index} />;
      default:
        return null;
    }
  };

  const availableModes = allColoringModes.filter(
    (mode) => !coloring.some((c) => c[0] === mode),
  );

  return (
    <Stack gap='xs'>
      <SettingsSection>
        <Group justify='space-between' align='center'>
          <EditorLabel docKeys={mergeDocKeys("coloring-layers")}>
            Coloring layers
          </EditorLabel>
          <Menu withinPortal disabled={availableModes.length === 0}>
            <Menu.Target>
              <ActionIcon
                size='sm'
                variant='subtle'
                disabled={availableModes.length === 0}
                aria-label='Add coloring layer'
              >
                <TbPlus size={16} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              {availableModes.map((mode) => (
                <Menu.Item key={mode} onClick={() => addColoringMode(mode)}>
                  {coloringModeLabels[mode]}
                </Menu.Item>
              ))}
            </Menu.Dropdown>
          </Menu>
        </Group>
      </SettingsSection>

      <Accordion variant='default' chevron={null}>
        {coloring.map((entry, index) => (
          <Accordion.Item key={String(entry[0])} value={String(entry[0])}>
            <Group gap={0} wrap='nowrap' style={{ position: "relative" }}>
              <Accordion.Control
                style={{ position: "absolute", left: 0, right: 0 }}
              >
                <Text size='sm' fw={500}>
                  {coloringModeLabels[entry[0]]}
                </Text>
              </Accordion.Control>
              <Accordion.Control
                disabled
                style={{ flex: 1, opacity: 0, pointerEvents: "none" }}
              >
                <Text size='sm' fw={500}>
                  {coloringModeLabels[entry[0]]}
                </Text>
              </Accordion.Control>
              <Group gap={4} wrap='nowrap' pr='xs'>
                <Select
                  size='xs'
                  w={100}
                  disabled={index === 0}
                  value={String(entry[3])}
                  onChange={(val) =>
                    val && editColoringBlend(index, Number(val) as BlendMode)
                  }
                  data={blendModeOptions}
                  allowDeselect={false}
                />
                <Menu withinPortal position='bottom-end'>
                  <Menu.Target>
                    <ActionIcon
                      size='sm'
                      variant='subtle'
                      aria-label='Layer options'
                    >
                      <TbDots size={16} />
                    </ActionIcon>
                  </Menu.Target>
                  <Menu.Dropdown>
                    <Menu.Item
                      disabled={index === 0}
                      leftSection={<TbArrowUp size={14} />}
                      onClick={() => moveColoringLayer(index, "up")}
                    >
                      Move up
                    </Menu.Item>
                    <Menu.Item
                      disabled={index === coloring.length - 1}
                      leftSection={<TbArrowDown size={14} />}
                      onClick={() => moveColoringLayer(index, "down")}
                    >
                      Move down
                    </Menu.Item>
                    <Menu.Divider />
                    <Menu.Item
                      color='red'
                      disabled={coloring.length <= 1}
                      leftSection={<TbTrash size={14} />}
                      onClick={() => removeColoringMode(index)}
                    >
                      Delete layer
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              </Group>
            </Group>
            <Accordion.Panel>
              <Stack gap='md' mt='sm'>
                {renderColoringSettings(entry, index)}
              </Stack>
            </Accordion.Panel>
          </Accordion.Item>
        ))}
      </Accordion>
    </Stack>
  );
};
