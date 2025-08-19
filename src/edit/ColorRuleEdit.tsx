import { Stack, Text, ColorPicker } from "@mantine/core";
import { NumberBuildRule, RuleType } from "../fractals/types";

export const ColorRuleEdit = ({
  label, value, onChange,
}: {
  label: string;
  value: [NumberBuildRule, NumberBuildRule, NumberBuildRule];
  onChange: (
    value: [NumberBuildRule, NumberBuildRule, NumberBuildRule]
  ) => void;
}) => {
  const colorValue = `rgb(${value[0].t === RuleType.StaticNumber ? Math.round(value[0].value * 255) : 0}, ${value[1].t === RuleType.StaticNumber ? Math.round(value[1].value * 255) : 0}, ${value[2].t === RuleType.StaticNumber ? Math.round(value[2].value * 255) : 0})`;

  return (
    <Stack>
      {label && <Text size="sm">{label}</Text>}
      <Stack>
        <ColorPicker
          fullWidth
          value={colorValue}
          onChange={(color) => {
            const rgb = color
              .replace("#", "")
              .split("")
              .reduce(
                (memo, letter) => {
                  let last = memo[memo.length - 1];
                  if (last.length >= 2) {
                    last = "";
                    memo.push(last);
                  }

                  last += letter;
                  memo[memo.length - 1] = last;

                  return memo;
                },
                [""] as string[]
              )
              .map((c) => parseInt(c.trim(), 16) / 255);

            const newValues: [
              NumberBuildRule,
              NumberBuildRule,
              NumberBuildRule
            ] = [
                { t: RuleType.StaticNumber, value: rgb[0] },
                { t: RuleType.StaticNumber, value: rgb[1] },
                { t: RuleType.StaticNumber, value: rgb[2] },
              ];
            onChange(newValues);
          }} />
      </Stack>
    </Stack>
  );
};
