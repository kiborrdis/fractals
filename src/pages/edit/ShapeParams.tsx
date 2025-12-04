import { Button, Group, Stack, Tabs } from "@mantine/core";
import React, { ReactNode } from "react";
import { StaticRuleEdit } from "./StaticRuleEdit";
import { DynamicRuleEdit } from "./DynamicRuleEdit";
import { useActions } from "./store/data/useActions";
import { useStaticRule } from "./store/data/useStaticRule";
import { useSelectAreaActive } from "./store/data/useSelectAreaActive";
import { CustomVariables } from "./CustomVariables";

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
          <Tabs.Tab size='xs' value='c'>
            C
          </Tabs.Tab>
          <Tabs.Tab size='xs' value='r'>
            R
          </Tabs.Tab>
          <Tabs.Tab size='xs' value='Iterations'>
            Iterations
          </Tabs.Tab>
          <Tabs.Tab size='xs' value='Mirroring'>
            Mirroring
          </Tabs.Tab>
          <Tabs.Tab size='xs' value='Viewport'>
            Viewport
          </Tabs.Tab>
          <Tabs.Tab size='xs' value='Coloring'>
            Coloring
          </Tabs.Tab>
          <Tabs.Tab size='xs' value='Custom'>
            Custom
          </Tabs.Tab>
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
