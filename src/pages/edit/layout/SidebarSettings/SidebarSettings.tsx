import {
  ActionIcon,
  Divider,
  Group,
  Menu,
  Stack,
  Tabs,
  ThemeIcon,
  Tooltip,
} from "@mantine/core";
import React, { useState } from "react";
import { SettingsSection } from "./SettingsSection";
import { StaticRuleEdit } from "../../fields/StaticRuleEdit/StaticRuleEdit";
import { DynamicRuleEdit } from "../../fields/DynamicRuleEdit/DynamicRuleEdit";
import { CustomVariables } from "../../fields/CustomVariables/CustomVariables";
import {
  TbAdjustments,
  TbFlipHorizontal,
  TbMathFunction,
  TbPalette,
  TbRepeat,
} from "react-icons/tb";
import { ModeEdit } from "../../fields/ModeEdit/ModeEdit";
import { PresetModal } from "./PresetModal";
import { EditorLabel } from "../../ui/EditorLabel";
import styles from "./SidebarSettings.module.css";
import { useSetting } from "../../stores/settings";
import { BasicMirroringEdit } from "../../fields/MirroringEdit/BasicMirroringEdit";
import { AdvancedMirroringEdit } from "../../fields/MirroringEdit/AdvancedMirroringEdit";
import { ColoringSettings } from "./ColoringSettings";
import { FiMenu } from "react-icons/fi";

export const ShapeParams = React.memo(() => {
  const [activeTab, setActiveTab] = React.useState<string | null>("c");
  const [presetModalOpen, setPresetModalOpen] = useState(false);
  const advancedMirroring = useSetting("advancedMirroringSettings");

  return (
    <Stack gap='sm'>
      <SettingsSection>
        <Group align='center' gap='sm'>
          <div className={styles.formulaContainer}>
            <StaticRuleEdit name='formula' />
          </div>

          <Menu position='bottom-end' shadow='md'>
            <Menu.Target>
              <Tooltip label='Actions' position='left'>
                <ActionIcon size='sm' variant='transparent'>
                  <FiMenu />
                </ActionIcon>
              </Tooltip>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item onClick={() => setPresetModalOpen(true)}>
                Load preset
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
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
            value='stopCondition'
            label='Stop conditions'
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

        <Tabs.Panel value='stopCondition'>
          <SettingsSection>
            <DynamicRuleEdit name='maxIterations' />
            <DynamicRuleEdit name='r' />
          </SettingsSection>
        </Tabs.Panel>

        <Tabs.Panel value='Mirroring'>
          <SettingsSection>
            {advancedMirroring ? (
              <AdvancedMirroringEdit />
            ) : (
              <BasicMirroringEdit />
            )}
          </SettingsSection>
        </Tabs.Panel>
        <Tabs.Panel value='Coloring'>
          <ColoringSettings />
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
