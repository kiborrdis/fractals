import { Stack, Text } from "@mantine/core";
import { NumberBuildRule } from "../fractals/types";
import { NumberRuleEdit } from "./NumberRuleEdit";

export const Vector2RuleEdit = ({
  label, sublabels, max, min, minRange, step, value, onChange,
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
            }} />
        ))}
      </Stack>
    </Stack>
  );
};
