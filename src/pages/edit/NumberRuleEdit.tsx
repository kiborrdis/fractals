import { Stack, Group, ActionIcon, Tooltip, Button } from "@mantine/core";
import { memo, ReactNode, useCallback } from "react";
import {
  NumberBuildRule,
  RuleType,
  StepNumberRule,
} from "@/features/fractals/types";
import { EditorNumberInput } from "@/shared/ui/EditorNumberInput";
import { TbMathMaxMin, TbLine } from "react-icons/tb";
import { changeRulePeriod } from "@/features/fractals";

export const NumberRuleEdit = memo(
  ({
    name,
    label,
    max,
    min,
    minRange,
    step,
    value,
    onChange,
    decimalScale = 7,
  }: {
    name: string;
    label?: string;
    max: number;
    min: number;
    minRange: number;
    step: number;
    value: NumberBuildRule;
    decimalScale?: number;
    onChange: (name: string, value: NumberBuildRule) => void;
  }) => {
    let content: ReactNode = null;

    const onChangeStaticValue = useCallback(
      (newValue: number) => {
        onChange(name, {
          t: RuleType.StaticNumber,
          value: Number(newValue),
        });
      },
      [name, onChange]
    );

    if (value.t === RuleType.StaticNumber) {
      content = (
        <EditorNumberInput
          label={
            <>
              <span>
                <Tooltip label="Const">
                  <ActionIcon
                    size={12}
                    variant="transparent"
                    onClick={() => {
                      onChange(name, {
                        t: RuleType.RangeNumber,
                        range: [
                          Math.max(value.value - 10 * minRange, min),
                          Math.min(value.value + 10 * minRange, max),
                        ],
                        cycleSeconds: 1,
                        phaseSeconds: 0,
                      });
                    }}
                  >
                    <TbLine />
                  </ActionIcon>
                </Tooltip>

                {label}
              </span>
            </>
          }
          decimalScale={decimalScale}
          value={value.value}
          onChange={onChangeStaticValue}
          min={min}
          max={max}
          step={step}
        />
      );
    }

    if (value.t === RuleType.PatchNumber) {
      content = (
        <Button onClick={() => onChangeStaticValue((max - min) / 2 + min)}>
          Reset
        </Button>
      );
    }

    if (value.t === RuleType.StepNumber) {
      content = (
        <Stack>
          <Group gap="xs" justify="space-between" wrap="nowrap">
            <EditorNumberInput
              label={
                <>
                  <Tooltip label="Convert to static" openDelay={750}>
                    <ActionIcon
                      size={12}
                      variant="transparent"
                      onClick={(newValue) => {
                        onChange(name, {
                          ...value,
                          range: [Number(newValue), value.range[1]],
                        } satisfies StepNumberRule);
                      }}
                    >
                      <TbMathMaxMin />
                    </ActionIcon>
                  </Tooltip>
                  {label} (from)
                </>
              }
              decimalScale={decimalScale}
              value={value.range[0]}
              onChange={(newValue) => {
                onChange(name, {
                  ...value,
                  range: [Number(newValue), value.range[1]],
                } satisfies StepNumberRule);
              }}
              min={min}
              max={max}
              step={step}
            />
            <EditorNumberInput
              label={`${label} (to)`}
              decimalScale={decimalScale}
              value={value.range[1]}
              onChange={(newValue) => {
                onChange(name, {
                  ...value,
                  range: [value.range[0], Number(newValue)],
                } satisfies StepNumberRule);
              }}
              min={min}
              max={max}
              step={step}
            />
          </Group>

          <EditorNumberInput
            label={`${label} (period)`}
            decimalScale={decimalScale}
            value={value.transitions.reduce((a, b) => a + b.len, 0)}
            onChange={(newValue) => {
              if (newValue === 0) {
                return;
              }

              onChange(name, changeRulePeriod(value, Number(newValue)));
            }}
            min={min}
            max={max}
            step={step}
          />
        </Stack>
      );
    }

    if (value.t === RuleType.RangeNumber) {
      content = (
        <>
          <Group gap="xs" justify="space-between" wrap="nowrap">
            <EditorNumberInput
              label={
                <>
                  <Tooltip label="Range">
                    <ActionIcon
                      size={12}
                      variant="transparent"
                      onClick={() => {
                        onChange(name, {
                          t: RuleType.StaticNumber,
                          value: (value.range[0] + value.range[1]) / 2,
                        });
                      }}
                    >
                      <TbMathMaxMin />
                    </ActionIcon>
                  </Tooltip>
                  {label} start
                </>
              }
              decimalScale={decimalScale}
              value={value.range[0]}
              onChange={(newValue) => {
                onChange(name, {
                  t: RuleType.RangeNumber,
                  range: [Number(newValue), value.range[1]],
                  cycleSeconds: value.cycleSeconds,
                  phaseSeconds: value.phaseSeconds,
                });
              }}
              min={min}
              max={max}
              step={step}
            />
            <EditorNumberInput
              label={`${label} end`}
              decimalScale={decimalScale}
              value={value.range[1]}
              onChange={(newValue) => {
                onChange(name, {
                  t: RuleType.RangeNumber,
                  range: [value.range[0], Number(newValue)],
                  cycleSeconds: value.cycleSeconds,
                  phaseSeconds: value.phaseSeconds,
                });
              }}
              min={min}
              max={max}
              step={step}
            />
          </Group>

          <Group gap="xs" justify="space-between" wrap="nowrap">
            <EditorNumberInput
              label="Half period (s)"
              decimalScale={0}
              value={value.cycleSeconds}
              onChange={(newValue) => {
                const newCycle = Number(newValue);

                onChange(name, {
                  t: RuleType.RangeNumber,
                  range: value.range,
                  cycleSeconds: newCycle,
                  phaseSeconds: value.phaseSeconds % (newCycle * 2),
                });
              }}
              step={1}
            />

            <EditorNumberInput
              label="Start phase (s)"
              decimalScale={1}
              value={value.phaseSeconds}
              onChange={(newValue) => {
                const newPhase = Number(newValue);

                onChange(name, {
                  t: RuleType.RangeNumber,
                  range: value.range,
                  cycleSeconds: value.cycleSeconds,
                  phaseSeconds: newPhase % (value.cycleSeconds * 2),
                });
              }}
              step={0.1}
            />
          </Group>
        </>
      );
    }

    return <Stack gap="xs">{content}</Stack>;
  }
);
NumberRuleEdit.displayName = "NumberRuleEdit";
