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
import { BlendMode, ColoringEntry, ColoringMode } from "@/features/fractals";
import { mergeDocKeys } from "@/shared/ui/DocTooltip";
import { StaticRuleEdit } from "../../fields/StaticRuleEdit/StaticRuleEdit";
import { DynamicRuleEdit } from "../../fields/DynamicRuleEdit/DynamicRuleEdit";
import { useActions } from "../../stores/editStore/data/useActions";
import { useStaticRule } from "../../stores/editStore/data/useStaticRule";
import { EditorLabel } from "../../ui/EditorLabel";
import { InterationColoringSettings } from "./InterationColoringSettings";
import { TrapColoringSettings } from "./TrapColoringSettings";
import { SettingsSection } from "./SettingsSection";

const defaultColoring: ColoringEntry[] = [
  { type: ColoringMode.Iterations, blend: BlendMode.Normal },
];

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

const coloringSettings: Partial<Record<ColoringMode, ReactNode>> = {
  [ColoringMode.Iterations]: <InterationColoringSettings />,
  [ColoringMode.Border]: (
    <>
      <StaticRuleEdit name='borderColor' />
      <DynamicRuleEdit name='borderDistMult' />
      <DynamicRuleEdit name='borderDistPow' />
    </>
  ),
  [ColoringMode.Trap]: <TrapColoringSettings />,
};

export const ColoringLayersAccordion = () => {
  const [coloring] = useStaticRule("coloring");
  const { staticRuleChange } = useActions();

  const currentColoring = coloring ?? defaultColoring;

  const handleBlendChange = (index: number, blend: BlendMode) => {
    staticRuleChange(
      "coloring",
      currentColoring.map((entry, i) =>
        i === index ? { ...entry, blend } : entry,
      ),
    );
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const next = [...currentColoring];
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
    staticRuleChange("coloring", next);
  };

  const handleMoveDown = (index: number) => {
    if (index === currentColoring.length - 1) return;
    const next = [...currentColoring];
    [next[index], next[index + 1]] = [next[index + 1], next[index]];
    staticRuleChange("coloring", next);
  };

  const handleAdd = (mode: ColoringMode) => {
    staticRuleChange("coloring", [
      ...currentColoring,
      { type: mode, blend: BlendMode.Normal },
    ]);
  };

  const handleDelete = (index: number) => {
    staticRuleChange(
      "coloring",
      currentColoring.filter((_, i) => i !== index),
    );
  };

  const availableModes = allColoringModes.filter(
    (mode) => !currentColoring.some((c) => c.type === mode),
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
                <Menu.Item key={mode} onClick={() => handleAdd(mode)}>
                  {coloringModeLabels[mode]}
                </Menu.Item>
              ))}
            </Menu.Dropdown>
          </Menu>
        </Group>
      </SettingsSection>

      <Accordion variant='default' chevron={null}>
        {currentColoring.map((entry, index) => (
          <Accordion.Item key={String(entry.type)} value={String(entry.type)}>
            <Group gap={0} wrap='nowrap' style={{ position: 'relative' }}>
              <Accordion.Control style={{ position: 'absolute', left: 0, right: 0 }}>
                <Text size='sm' fw={500}>
                  {coloringModeLabels[entry.type]}
                </Text>
              </Accordion.Control>
              <Accordion.Control disabled style={{ flex: 1, opacity: 0, pointerEvents: 'none' }}>
                <Text size='sm' fw={500}>
                  {coloringModeLabels[entry.type]}
                </Text>
              </Accordion.Control>
              <Group gap={4} wrap='nowrap' pr='xs'>
                <Select
                  size='xs'
                  w={100}
                  disabled={index === 0}
                  value={String(entry.blend)}
                  onChange={(val) =>
                    val && handleBlendChange(index, Number(val) as BlendMode)
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
                      onClick={() => handleMoveUp(index)}
                    >
                      Move up
                    </Menu.Item>
                    <Menu.Item
                      disabled={index === currentColoring.length - 1}
                      leftSection={<TbArrowDown size={14} />}
                      onClick={() => handleMoveDown(index)}
                    >
                      Move down
                    </Menu.Item>
                    <Menu.Divider />
                    <Menu.Item
                      color='red'
                      disabled={currentColoring.length <= 1}
                      leftSection={<TbTrash size={14} />}
                      onClick={() => handleDelete(index)}
                    >
                      Delete layer
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              </Group>
            </Group>
            <Accordion.Panel>
              <Stack gap='md' mt='sm'>
               {coloringSettings[entry.type] ?? null}
              </Stack>  
            </Accordion.Panel>
          </Accordion.Item>
        ))}
      </Accordion>
    </Stack>
  );
};
