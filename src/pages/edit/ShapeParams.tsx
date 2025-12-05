import { Button, Group, Stack, Tabs, Tooltip } from "@mantine/core";
import React, { ReactNode } from "react";
import { StaticRuleEdit } from "./StaticRuleEdit";
import { DynamicRuleEdit } from "./DynamicRuleEdit";
import { useActions } from "./store/data/useActions";
import { useStaticRule } from "./store/data/useStaticRule";
import { useSelectAreaActive } from "./store/data/useSelectAreaActive";
import { CustomVariables } from "./CustomVariables";
import { TbAdjustments, TbCircle, TbFlipHorizontal, TbMathFunction, TbPalette, TbRepeat, TbZoomScan } from "react-icons/tb";

const SettingsSection = ({ children }: { children: ReactNode }) => {
  return (
    <Stack p='md' gap='md'>
      {children}
    </Stack>
  );
};

export const ShapeParams = React.memo(() => {
  const { resetViewport, toggleAreaSelection, magnifyViewport } = useActions();
  const [mirroringType] = useStaticRule("mirroringType");
  const selectAreaActive = useSelectAreaActive();

  return (
    <Stack gap='sm'>
      <SettingsSection>
        <StaticRuleEdit name='formula' />

        <StaticRuleEdit name='invert' />
      </SettingsSection>
      <Tabs defaultValue='c'>
        <Tabs.List>
          <Tooltip label='Complex constant (c)' position='right'>
            <Tabs.Tab value='c' leftSection={<TbMathFunction size={16} />} />
          </Tooltip>
          <Tooltip label='Escape radius' position='right'>
            <Tabs.Tab value='r' leftSection={<TbCircle size={16} />} />
          </Tooltip>
          <Tooltip label='Max iterations' position='bottom' withArrow>
            <Tabs.Tab value='Iterations'>
              <TbRepeat size={18} />
            </Tabs.Tab>
          </Tooltip>
          <Tooltip label='Mirroring & symmetry' position='bottom' withArrow>
            <Tabs.Tab value='Mirroring'>
              <TbFlipHorizontal size={18} />
            </Tabs.Tab>
          </Tooltip>
          <Tooltip label='Viewport & zoom' position='bottom' withArrow>
            <Tabs.Tab value='Viewport'>
              <TbZoomScan size={18} />
            </Tabs.Tab>
          </Tooltip>
          <Tooltip label='Coloring & gradient' position='bottom' withArrow>
            <Tabs.Tab value='Coloring'>
              <TbPalette size={18} />
            </Tabs.Tab>
          </Tooltip>
          <Tooltip label='Custom variables' position='bottom' withArrow>
            <Tabs.Tab value='Custom'>
              <TbAdjustments size={18} />
            </Tabs.Tab>
          </Tooltip>
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
