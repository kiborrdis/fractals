import {
  Button,
  Divider,
  Group,
  Stack,
  Tabs,
  ThemeIcon,
  Tooltip,
} from "@mantine/core";
import React, { ReactNode, useState } from "react";
import { StaticRuleEdit } from "../../fields/StaticRuleEdit/StaticRuleEdit";
import { DynamicRuleEdit } from "../../fields/DynamicRuleEdit/DynamicRuleEdit";
import { useStaticRule } from "../../stores/editStore/data/useStaticRule";
import { useActions } from "../../stores/editStore/data/useActions";
import { useTrapEditMode } from "../../stores/editStore/data/useTrapEditMode";
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

const BORDER_COLORING_ENABLED = true;

const TrapColoringSettings = () => {
  const [trapColoringEnabled] = useStaticRule("trapColoringEnabled");
  const trapEditMode = useTrapEditMode();
  const { toggleTrapEditMode } = useActions();

  if (!trapColoringEnabled) {
    return null;
  }

  return (
    <>
      <Button
        size='xs'
        variant={trapEditMode ? "filled" : "light"}
        color={trapEditMode ? "red" : undefined}
        onClick={toggleTrapEditMode}
      >
        {trapEditMode ? "Exit trap edit mode" : "Edit traps"}
      </Button>
      <StaticRuleEdit name='traps' />
      <StaticRuleEdit name='trapIntensity' />
      <StaticRuleEdit name='trapGradient' />
    </>
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
            {BORDER_COLORING_ENABLED && (
              <StaticRuleEdit name='gradientColoringEnabled' />
            )}
            <StaticRuleEdit name='gradient' />
            <StaticRuleEdit name='bandSmoothing' />
            {BORDER_COLORING_ENABLED && (
              <>
                <StaticRuleEdit name='borderColoringEnabled' />
                <StaticRuleEdit name='borderColor' />
                <StaticRuleEdit name='borderIntensity' />
              </>
            )}
            <Divider />
            <StaticRuleEdit name='trapColoringEnabled' />
            <TrapColoringSettings />
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
