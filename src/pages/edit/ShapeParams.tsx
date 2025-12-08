import { Button, Group, Stack, Tabs, ThemeIcon, Tooltip } from "@mantine/core";
import React, { ReactNode } from "react";
import { StaticRuleEdit } from "./StaticRuleEdit";
import { DynamicRuleEdit } from "./DynamicRuleEdit";
import { useActions } from "./store/data/useActions";
import { useStaticRule } from "./store/data/useStaticRule";
import { useSelectAreaActive } from "./store/data/useSelectAreaActive";
import { CustomVariables } from "./CustomVariables";
import {
  TbAdjustments,
  TbCircle,
  TbFlipHorizontal,
  TbMathFunction,
  TbPalette,
  TbRepeat,
  TbZoomScan,
} from "react-icons/tb";

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
      style={{
        textAlign: 'center'
      }}
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

export const ShapeParams = React.memo(() => {
  const { resetViewport, toggleAreaSelection, magnifyViewport } = useActions();
  const [mirroringType] = useStaticRule("mirroringType");
  const selectAreaActive = useSelectAreaActive();
  const [activeTab, setActiveTab] = React.useState<string | null>("c");

  return (
    <Stack gap='sm'>
      <SettingsSection>
        <StaticRuleEdit name='formula' />

        <StaticRuleEdit name='invert' />
      </SettingsSection>
      <Tabs value={activeTab} onChange={setActiveTab}>
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
            value='Viewport'
            label='Viewport & zoom'
            icon={TbZoomScan}
            activeTab={activeTab}
          />
          <TabWithIcon
            value='Coloring'
            label='Coloring & gradient'
            icon={TbPalette}
            activeTab={activeTab}
          />
          <TabWithIcon
            value='Custom'
            label='Custom variables'
            icon={TbAdjustments}
            activeTab={activeTab}
          />
        </Tabs.List>
        <Tabs.Panel value='c'>
          <SettingsSection>
            <DynamicRuleEdit name='c' />

            <DynamicRuleEdit name='cxPerDistChange' />

            <DynamicRuleEdit name='cyPerDistChange' />
          </SettingsSection>
        </Tabs.Panel>
        <Tabs.Panel value='r'>
          <SettingsSection>
            <DynamicRuleEdit name='r' />

            <DynamicRuleEdit name='rPerDistChange' />
          </SettingsSection>
        </Tabs.Panel>
        <Tabs.Panel value='Iterations'>
          <SettingsSection>
            <DynamicRuleEdit name='maxIterations' />

            <DynamicRuleEdit name='iterationsPerDistChange' />
          </SettingsSection>
        </Tabs.Panel>

        <Tabs.Panel value='Mirroring'>
          <SettingsSection>
            <StaticRuleEdit name='mirroringType' />
          </SettingsSection>

          {mirroringType === "square" && (
            <SettingsSection>
              <DynamicRuleEdit name='linearMirroringFactor' />

              <DynamicRuleEdit name='linearMirroringPerDistChange' />
            </SettingsSection>
          )}

          {mirroringType === "hex" && (
            <SettingsSection>
              <DynamicRuleEdit name='hexMirroringFactor' />
              <DynamicRuleEdit name='hexMirroringPerDistChange' />
            </SettingsSection>
          )}

          {mirroringType !== "off" && (
            <SettingsSection>
              <DynamicRuleEdit name='radialMirroringAngle' />

              <DynamicRuleEdit name='radialMirroringPerDistChange' />
            </SettingsSection>
          )}
        </Tabs.Panel>
        <Tabs.Panel value='Viewport'>
          <SettingsSection>
            <Group>
              <Button size='xs' variant='outline' onClick={resetViewport}>
                Reset
              </Button>
              <Button
                size='xs'
                variant='outline'
                onClick={() => magnifyViewport(0.5)}
              >
                x0.5
              </Button>
              <Button
                size='xs'
                variant='outline'
                onClick={() => magnifyViewport(2)}
              >
                x2
              </Button>
              <Button
                size='xs'
                variant='outline'
                color='green'
                onClick={toggleAreaSelection}
              >
                {selectAreaActive ? "Selecting area" : "Select area"}
              </Button>
            </Group>
            <DynamicRuleEdit name='rlVisibleRange' />
            <DynamicRuleEdit name='imVisibleRange' />
          </SettingsSection>
        </Tabs.Panel>
        <Tabs.Panel value='Coloring'>
          <SettingsSection>
            <StaticRuleEdit name='gradient' />
            <StaticRuleEdit name='bandSmoothing' />
          </SettingsSection>
        </Tabs.Panel>
        <Tabs.Panel value='Custom'>
          <SettingsSection>
            <CustomVariables />
          </SettingsSection>
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );
});
ShapeParams.displayName = "ShapeParams";
