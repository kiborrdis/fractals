import {
  Button,
  Collapse,
  Divider,
  Group,
  Paper,
  Stack,
  Switch,
  Tabs,
  Text,
  ThemeIcon,
  Tooltip,
} from "@mantine/core";
import React, { ReactNode, useState } from "react";
import { StaticRuleEdit } from "../../fields/StaticRuleEdit/StaticRuleEdit";
import { DynamicRuleEdit } from "../../fields/DynamicRuleEdit/DynamicRuleEdit";
import { useStaticRule } from "../../stores/editStore/data/useStaticRule";
import { useActions } from "../../stores/editStore/data/useActions";
import { CustomVariables } from "../../fields/CustomVariables/CustomVariables";
import {
  TbAdjustments,
  TbCircle,
  TbFlipHorizontal,
  TbMathFunction,
  TbPalette,
  TbRepeat,
} from "react-icons/tb";
import { ModeEdit } from "../../fields/ModeEdit/ModeEdit";
import { PresetModal } from "./PresetModal";
import { EditorLabel } from "../../ui/EditorLabel";
import styles from "./SidebarSettings.module.css";
import { EditorDocTooltip } from "../../ui/EditorDocTooltip";
import { mergeDocKeys } from "@/shared/ui/DocTooltip";
import { BlendMode, ColoringEntry, ColoringMode } from "@/features/fractals";
import { BlendingModes } from "./BlendingModes";
import { useSetting } from "../../stores/settings";

const defaultColoring: ColoringEntry[] = [
  { type: ColoringMode.Iterations, blend: BlendMode.Normal },
];

const TrapColoringSettings = () => {
  const [coloring] = useStaticRule("coloring");
  const trapEnabled = (coloring ?? defaultColoring).some(
    (c) => c.type === ColoringMode.Trap,
  );

  if (!trapEnabled) {
    return null;
  }

  return (
    <>
      <StaticRuleEdit name='traps' />
      <StaticRuleEdit name='trapIntensity' />
      <StaticRuleEdit name='trapGradient' />
    </>
  );
};

const coloringTypeToMode = {
  gradient: ColoringMode.Iterations,
  border: ColoringMode.Border,
  trap: ColoringMode.Trap,
} as const;

const coloringLabels = {
  gradient: "Gradient Coloring",
  border: "Border Coloring",
  trap: "Trap Coloring",
};

const ColoringBlock = ({
  coloringType,
  children,
}: {
  coloringType: "gradient" | "border" | "trap";
  children: ReactNode;
}) => {
  const [coloring] = useStaticRule("coloring");
  const { staticRuleChange } = useActions();
  const coloringLayers = useSetting("coloringLayers");
  console.log("coloring", coloring);
  const currentColoring = coloring ?? defaultColoring;
  const thisMode = coloringTypeToMode[coloringType];
  const isEnabled = currentColoring.some((c) => c.type === thisMode);

  const handleToggle = () => {
    if (coloringLayers) {
      if (isEnabled) {
        if (currentColoring.length > 1) {
          staticRuleChange(
            "coloring",
            currentColoring.filter((c) => c.type !== thisMode),
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
      <Paper withBorder p='xs' style={{ cursor: "pointer" }} onClick={handleToggle}>
        <Group justify='space-between'>
          <Group gap={0}>
            <Text size='sm' fw={600}>{coloringLabels[coloringType]}</Text>
            <EditorDocTooltip docKeys={mergeDocKeys(`coloring-${coloringType}`)} />
          </Group>
          <Switch
            checked={isEnabled}
            onClick={(e) => e.stopPropagation()}
          />
        </Group>
      </Paper>
      <Collapse in={isEnabled}>
        <Stack gap='md' px='0'>{children}</Stack>
      </Collapse>
    </Stack>
  );
};

const ColoringSettings = () => {
  const coloringLayers = useSetting("coloringLayers");

  return (
    <Stack gap='md'>
      {coloringLayers && (
        <>
          <BlendingModes />
          <Divider />
        </>
      )}
      <ColoringBlock coloringType='gradient'>
        <StaticRuleEdit name='gradient' />
        <StaticRuleEdit name='bandSmoothing' />
      </ColoringBlock>
      <Divider />
      <ColoringBlock coloringType='border'>
        <StaticRuleEdit name='borderColor' />
        <StaticRuleEdit name='borderIntensity' />
      </ColoringBlock>
      <Divider />
      <ColoringBlock coloringType='trap'>
        <TrapColoringSettings />
      </ColoringBlock>
    </Stack>
  );
};

export const ShapeParams = React.memo(() => {
  const [mirroringType] = useStaticRule("mirroringType");
  const [activeTab, setActiveTab] = React.useState<string | null>("c");
  const [presetModalOpen, setPresetModalOpen] = useState(false);

  return (
    <Stack gap='sm'>
      <SettingsSection>
        <Group align='flex-start' gap='sm'>
          <div className={styles.formulaContainer}>
            <StaticRuleEdit name='formula' />
          </div>
          <Button
            size='sm'
            variant='light'
            onClick={() => setPresetModalOpen(true)}
          >
            Presets
          </Button>
        </Group>

        <ModeEdit />
      </SettingsSection>
      <Tabs keepMounted={false} value={activeTab} onChange={setActiveTab}>
        <Tabs.List grow>
          <TabWithIcon
            value='c'
            label='Complex constant (c)'
            icon={TbMathFunction}
            activeTab={activeTab}
          />
          <TabWithIcon
            value='r'
            label='Escape radius'
            icon={TbCircle}
            activeTab={activeTab}
          />
          <TabWithIcon
            value='Iterations'
            label='Max iterations'
            icon={TbRepeat}
            activeTab={activeTab}
          />
          <TabWithIcon
            value='Mirroring'
            label='Mirroring & symmetry'
            icon={TbFlipHorizontal}
            activeTab={activeTab}
          />
          <TabWithIcon
            value='Coloring'
            label='Coloring & gradient'
            icon={TbPalette}
            activeTab={activeTab}
          />
          <TabWithIcon
            value='Rest'
            label='Other settings'
            icon={TbAdjustments}
            activeTab={activeTab}
          />
        </Tabs.List>
        <Tabs.Panel value='c'>
          <SettingsSection>
            <DynamicRuleEdit name='c' />

            <Divider />

            <DynamicRuleEdit name='cDistVariation' />
          </SettingsSection>
        </Tabs.Panel>
        <Tabs.Panel value='r'>
          <SettingsSection>
            <DynamicRuleEdit name='r' />

            <DynamicRuleEdit name='rDistVariation' />
          </SettingsSection>
        </Tabs.Panel>
        <Tabs.Panel value='Iterations'>
          <SettingsSection>
            <DynamicRuleEdit name='maxIterations' />

            <DynamicRuleEdit name='iterationsDistVariation' />
          </SettingsSection>
        </Tabs.Panel>

        <Tabs.Panel value='Mirroring'>
          <SettingsSection>
            <StaticRuleEdit name='mirroringType' />

            {mirroringType === "square" && (
              <>
                <DynamicRuleEdit name='linearMirroringFactor' />

                <DynamicRuleEdit name='linearMirroringDistVariation' />
              </>
            )}

            {mirroringType === "hex" && (
              <>
                <DynamicRuleEdit name='hexMirroringFactor' />
                <DynamicRuleEdit name='hexMirroringDistVariation' />
              </>
            )}

            {mirroringType !== "off" && (
              <>
                <DynamicRuleEdit name='radialMirroringAngle' />

                <DynamicRuleEdit name='radialMirroringDistVariation' />
              </>
            )}
          </SettingsSection>
        </Tabs.Panel>
        <Tabs.Panel value='Coloring'>
          <SettingsSection>
            <ColoringSettings />
          </SettingsSection>
        </Tabs.Panel>
        <Tabs.Panel value='Rest'>
          <SettingsSection>
            <EditorLabel>Antialiazing</EditorLabel>
            <StaticRuleEdit name='antialiasingLevel' />

            <Divider />

            <StaticRuleEdit name='initialTime' />
            <Divider />
            <CustomVariables />
          </SettingsSection>
        </Tabs.Panel>
      </Tabs>

      <PresetModal
        opened={presetModalOpen}
        onClose={() => setPresetModalOpen(false)}
      />
    </Stack>
  );
});
ShapeParams.displayName = "ShapeParams";

const SettingsSection = ({ children }: { children: ReactNode }) => {
  return (
    <Stack p='md' gap='md'>
      {children}
    </Stack>
  );
};

const TabWithIcon = ({
  value,
  label,
  icon: Icon,
  activeTab,
}: {
  value: string;
  label: string;
  icon: React.ElementType;
  activeTab: string | null;
}) => (
  <Tooltip label={label} position='bottom' withArrow>
    <Tabs.Tab
      value={value}
      size='xs'
      px='sm'
      py='xs'
      className={styles.tabWithIcon}
    >
      <ThemeIcon
        p={0}
        size='xs'
        color={activeTab !== value ? "gray" : undefined}
        variant='transparent'
      >
        <Icon size={14} />
      </ThemeIcon>
    </Tabs.Tab>
  </Tooltip>
);
