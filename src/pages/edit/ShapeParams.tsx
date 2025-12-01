import {
  Accordion,
  Button,
  Group,
  Stack,
} from "@mantine/core";
import React, { ReactNode } from "react";
import { StaticRuleEdit } from "./StaticRuleEdit";
import { DynamicRuleEdit } from "./DynamicRuleEdit";
import { useActions } from "./store/data/useActions";
import { useStaticRule } from "./store/data/useStaticRule";
import { useSelectAreaActive } from "./store/data/useSelectAreaActive";

const SettingsCollapsibleSection = ({
  children,
  label,
  id,
  disabled,
}: {
  label: string;
  children: ReactNode;
  id: string;
  disabled?: boolean;
}) => {
  return (
    <Accordion.Item key={id} value={id}>
      <Accordion.Control disabled={disabled}>{label}</Accordion.Control>
      <Accordion.Panel>
        <Stack gap="md">{children}</Stack>
      </Accordion.Panel>
    </Accordion.Item>
  );
};

const SettingsSection = ({ children }: { children: ReactNode }) => {
  return (
    <Stack p="md" gap="md">
      {children}
    </Stack>
  );
};

const filterListPerMirroringType = {
  off: ["radial", "linear", "hex"],
  square: ["hex"],
  hex: ["linear"],
};

export const ShapeParams = React.memo(() => {
    const [opened, setOpened] = React.useState<string[]>([]);
    const { resetViewport, toggleAreaSelection, magnifyViewport } = useActions();
    const [mirroringType] = useStaticRule('mirroringType');
    const selectAreaActive = useSelectAreaActive();

    const realOpened = opened.filter(
      (item) => !filterListPerMirroringType[mirroringType].includes(item)
    );

    return (
      <Stack gap="sm">
        <Accordion multiple value={realOpened} onChange={setOpened}>
          <SettingsSection>
            <StaticRuleEdit name="formula" />
            
            <StaticRuleEdit name='invert' />
          </SettingsSection>
          <SettingsCollapsibleSection id="C" label="C">
            <DynamicRuleEdit name="c" />

            <DynamicRuleEdit name="cxPerDistChange" />

            <DynamicRuleEdit name="cyPerDistChange" />
          </SettingsCollapsibleSection>

          <SettingsCollapsibleSection id="R" label="R">
            <DynamicRuleEdit name="r" />

            <DynamicRuleEdit name="rPerDistChange" />
          </SettingsCollapsibleSection>

          <SettingsCollapsibleSection id="Iterations" label="Iterations">
            <DynamicRuleEdit name="maxIterations" />

            <DynamicRuleEdit name="iterationsPerDistChange" />
          </SettingsCollapsibleSection>

          <SettingsSection>
            <StaticRuleEdit name="mirroringType" />
          </SettingsSection>
          <SettingsCollapsibleSection
            id="linear"
            label="Linear mirroring"
            disabled={mirroringType !== "square"}
          >
            <DynamicRuleEdit name="linearMirroringFactor" />

            <DynamicRuleEdit name="linearMirroringPerDistChange" />
          </SettingsCollapsibleSection>

          <SettingsCollapsibleSection
            disabled={mirroringType !== "hex"}
            id="hex"
            label="Hex mirroring"
          >
            <DynamicRuleEdit name="hexMirroringFactor" />
          </SettingsCollapsibleSection>

          <SettingsCollapsibleSection
            id="radial"
            label="Radial mirroring"
            disabled={mirroringType === "off"}
          >
            <DynamicRuleEdit name="radialMirroringAngle" />

            <DynamicRuleEdit name="radialMirroringPerDistChange" />
          </SettingsCollapsibleSection>

          <SettingsCollapsibleSection id="viewport" label="Viewport">
            <Group>
              <Button
                size="xs"
                variant="outline"
                onClick={resetViewport}
              >
                Reset
              </Button>
              <Button
                size="xs"
                variant="outline"
                onClick={() => magnifyViewport(0.5)}
              >
                x0.5
              </Button>
              <Button
                size="xs"
                variant="outline"
                onClick={() => magnifyViewport(2)}
              >
                x2
              </Button>
              <Button
                size="xs"
                variant="outline"
                color="green"
                onClick={toggleAreaSelection}
              >
                {selectAreaActive ? "Selecting area" : "Select area"}
              </Button>
            </Group>
            <DynamicRuleEdit name="rlVisibleRange" />
            <DynamicRuleEdit name="imVisibleRange" />
          </SettingsCollapsibleSection>
          <SettingsCollapsibleSection id="colors" label="Colors">
            <StaticRuleEdit name="gradient" />
          </SettingsCollapsibleSection>
        </Accordion>
      </Stack>
    );
  }
);
ShapeParams.displayName = "ShapeParams";
