import { Slider, RangeSlider, Stack, Group, Text, Chip } from "@mantine/core";
import { ReactNode } from "react";
import { NumberBuildRule, RuleType } from "../fractals/types";

export const NumberRuleEdit = ({
  label, max, min, minRange, step, value, onChange,
}: {
  label?: string;
  max: number;
  min: number;
  minRange: number;
  step: number;
  value: NumberBuildRule;
  onChange: (value: NumberBuildRule) => void;
}) => {
  let content: ReactNode = null;

  if (value.t === RuleType.StaticNumber) {
    content = (
      <Slider
        value={value.value}
        onChange={(value) => {
          onChange({
            t: RuleType.StaticNumber,
            value,
          });
        }}
        min={min}
        max={max}
        step={step} />
    );
  }

  if (value.t === RuleType.RangeNumber) {
    content = (
      <>
        <RangeSlider
          value={value.range}
          onChange={(range) => {
            onChange({
              t: RuleType.RangeNumber,
              range,
              cycleSeconds: value.cycleSeconds,
            });
          }}
          min={min}
          max={max}
          step={step}
          minRange={minRange} />
        <Slider
          value={value.cycleSeconds}
          onChange={(newCycle) => {
            onChange({
              t: RuleType.RangeNumber,
              range: value.range,
              cycleSeconds: newCycle,
            });
          }}
          min={0.1}
          max={120}
          step={0.1} />
      </>
    );
  }

  return (
    <Stack gap="xs" justify="center">
      <Group gap="xs" justify="space-between">
        {label && <Text size="sm">{label}</Text>}
        <Chip
          size="xs"
          checked
          onClick={() => {
            if (value.t === RuleType.StaticNumber) {
              onChange({
                t: RuleType.RangeNumber,
                range: [
                  Math.max(value.value - 10 * minRange, min),
                  Math.min(value.value + 10 * minRange, max),
                ],
                cycleSeconds: 1,
              });
            } else {
              onChange({
                t: RuleType.StaticNumber,
                value: (value.range[0] + value.range[1]) / 2,
              });
            }
          }}
        >
          {value.t === RuleType.StaticNumber ? "Static" : "Range"}
        </Chip>
      </Group>
      {content}
    </Stack>
  );
};
