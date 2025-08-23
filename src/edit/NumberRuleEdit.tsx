import {
  Stack,
  Group,
  NumberInput,
  Button,
  Collapse,
} from "@mantine/core";
import { ReactNode, useState } from "react";
import { NumberBuildRule, RuleType } from "../fractals/types";
import { useGlobalKeyMods } from "../useGlobalKeyMods";

const clampToDecimal = (value: number, decimalScale: number) => {
  const factor = Math.pow(10, decimalScale);
  return Math.round(value * factor) / factor;
}

export const NumberRuleEdit = ({
  label,
  max,
  min,
  minRange,
  step,
  value,
  onChange,
  decimalScale = 7,
}: {
  label?: string;
  max: number;
  min: number;
  minRange: number;
  step: number;
  value: NumberBuildRule;
  decimalScale?: number;
  onChange: (value: NumberBuildRule) => void;
}) => {
  const { shift } = useGlobalKeyMods();
  let content: ReactNode = null;

  const [allVisible, setAllVisible] = useState(true);

  let valueDescription = "";

  if (value.t === RuleType.StaticNumber) {
    valueDescription = `(${clampToDecimal(value.value, 2)})`;
  } else if (value.t === RuleType.RangeNumber) {
    valueDescription = `[${clampToDecimal(value.range[0], 2)}, ${clampToDecimal(value.range[1], 2)}] ${value.cycleSeconds}s`;
  }

  if (value.t === RuleType.StaticNumber) {
    content = (
      <NumberInput
        ref={el => {
          if (!el) {
            return;
          }
          const handler = (e: WheelEvent) => {
            console.log('???');
            onChange({
            t: RuleType.StaticNumber,
            value: Number(value.value + Math.sign(e.deltaY) * (step * (shift ? 10 : 1))),
          })
            e.preventDefault();
            e.stopPropagation();
          };
          el.addEventListener('wheel', handler, { passive: false });

          return () => {
            el.removeEventListener('wheel', handler);
          }
        }}
     
        size="xs"
        clampBehavior="blur"
        decimalScale={decimalScale}
        value={value.value}
        onChange={(newValue) => {
          onChange({
            t: RuleType.StaticNumber,
            value: Number(newValue),
          });
        }}
        min={min}
        max={max}
        step={shift ? step * 10 : step}
      />
    );
  }

  if (value.t === RuleType.RangeNumber) {
    content = (
      <>
        <Group gap="xs" justify="space-between" wrap="nowrap">
          <NumberInput
            size="xs"
            label="Start"
            clampBehavior="blur"
            decimalScale={decimalScale}
            value={value.range[0]}
            onChange={(newValue) => {
              onChange({
                t: RuleType.RangeNumber,
                range: [Number(newValue), value.range[1]],
                cycleSeconds: value.cycleSeconds,
                phaseSeconds: value.phaseSeconds,
              });
            }}
            min={min}
            max={max}
            step={shift ? step * 10 : step}
          />
          <NumberInput
            size="xs"
            label="End"
            clampBehavior="blur"
            decimalScale={decimalScale}
            value={value.range[1]}
            onChange={(newValue) => {
              onChange({
                t: RuleType.RangeNumber,
                range: [value.range[0], Number(newValue)],
                cycleSeconds: value.cycleSeconds,
                phaseSeconds: value.phaseSeconds,
              });
            }}
            min={min}
            max={max}
            step={shift ? step * 10 : step}
          />
        </Group>

        <Group gap="xs" justify="space-between" wrap="nowrap">
          <NumberInput
            size="xs"
            label="Half period (s)"
            clampBehavior="blur"
            decimalScale={0}
            value={value.cycleSeconds}
            onChange={(newValue) => {
              const newCycle = Number(newValue);

              onChange({
                t: RuleType.RangeNumber,
                range: value.range,
                cycleSeconds: newCycle,
                phaseSeconds: value.phaseSeconds % (newCycle * 2),
              });
            }}
            step={shift ? 10 : 1}
          />

          <NumberInput
            size="xs"
            label="Start phase (s)"
            clampBehavior="blur"
            decimalScale={1}
            value={value.phaseSeconds}
            onChange={(newValue) => {
              const newPhase = Number(newValue);

              onChange({
                t: RuleType.RangeNumber,
                range: value.range,
                cycleSeconds: value.cycleSeconds,
                phaseSeconds: newPhase % (value.cycleSeconds * 2),
              });
            }}
            step={shift ? 1 : 0.1}
          />
        </Group>
      </>
    );
  }

  return (
    <Stack gap="xs" justify="center" >
      <Group gap="xs" justify="space-between">
        {label && (
          <Button
          pl={0}
            size="sm"
            variant="transparent"
            color="gray"
            onClick={() => setAllVisible((v) => !v)}
          >
            {label} {!allVisible ? valueDescription : ''}
          </Button>
        )}
        {allVisible && <Button
          size="compact-xs"
          variant="subtle"
          onClick={() => {
            if (value.t === RuleType.StaticNumber) {
              onChange({
                t: RuleType.RangeNumber,
                range: [
                  Math.max(value.value - 10 * minRange, min),
                  Math.min(value.value + 10 * minRange, max),
                ],
                cycleSeconds: 1,
                phaseSeconds: 0,
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
        </Button>}
      </Group>
      <Collapse in={allVisible} transitionDuration={100}>
        {content}
      </Collapse>
    </Stack>
  );
};
