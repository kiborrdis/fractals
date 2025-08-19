import { AngleSlider, NumberInput, Stack, Text } from "@mantine/core";
import { NumberBuildRule, RuleType, Vector2 } from "../fractals/types";
import { NumberRuleEdit } from "./NumberRuleEdit";

export const Vector2RuleEdit = ({
  label,
  sublabels,
  max,
  min,
  minRange,
  step,
  value,
  onChange,
}: {
  label: string;
  sublabels?: [string, string];
  max: number;
  min: number;
  minRange: number;
  step: number;
  value: [NumberBuildRule, NumberBuildRule];
  onChange: (value: [NumberBuildRule, NumberBuildRule]) => void;
}) => {
  return (
    <Stack>
      {label && <Text size="sm">{label}</Text>}
      <Stack>
        {value.map((v, i) => (
          <NumberRuleEdit
            key={i}
            label={sublabels ? sublabels[i] : String(i)}
            max={max}
            min={min}
            minRange={minRange}
            step={step}
            value={v}
            onChange={(newValue) => {
              const newValues = [...value];
              newValues[i] = newValue;
              onChange(newValues as [NumberBuildRule, NumberBuildRule]);
            }}
          />
        ))}
      </Stack>
    </Stack>
  );
};

export const Vector2RulePolarEdit = ({
  value,
  onChange,
}: {
  value: [NumberBuildRule, NumberBuildRule];
  onChange: (value: [NumberBuildRule, NumberBuildRule]) => void;
}) => {
  if (
    value[0].t !== RuleType.StaticNumber ||
    value[1].t !== RuleType.StaticNumber
  ) {
    return null;
  }
  const base: Vector2 = [0, 1];
  const vector: Vector2 = [value[0].value, value[1].value];
  const length = Math.sqrt(vector[0] ** 2 + vector[1] ** 2);

  const dotProduct = (vector[0] * base[0] + vector[1] * base[1]) / length;
  let angle = Math.round(Math.acos(dotProduct) * (180 / Math.PI));

  if (vector[0] < 0) {
    angle = 360 - angle;
  }

  return (
    <Stack>
      <AngleSlider
        value={angle}
        onChange={(newAngle) => {
          const newX = length * Math.sin(newAngle * (Math.PI / 180));
          const newY = length * Math.cos(newAngle * (Math.PI / 180));

          onChange([
            {
              t: RuleType.StaticNumber,
              value: newX,
            },
            {
              t: RuleType.StaticNumber,
              value: newY,
            },
          ]);
        }}
      />
      <NumberInput
        step={0.001}
        value={length}
        onChange={(newLength) => {
          newLength = Number(newLength);
          if (isNaN(newLength) || newLength < 0) {
            return;
          }

          const newX = newLength * Math.sin(angle * (Math.PI / 180));
          const newY = newLength * Math.cos(angle * (Math.PI / 180));

          onChange([
            {
              t: RuleType.StaticNumber,
              value: newX,
            },
            {
              t: RuleType.StaticNumber,
              value: newY,
            },
          ]);
        }}
      />
    </Stack>
  );
};
