import { Group, Chip } from "@mantine/core";
import { ConstBooleanRule, RuleType } from "../fractals/types";

export const BooleanRuleEdit = ({
  labels = ["On", "Off"], value, onChange,
}: {
  labels: [string, string];
  value: ConstBooleanRule;
  onChange: (value: ConstBooleanRule) => void;
}) => {
  return (
    <Group justify="space-between">
      <Chip
        size="xs"
        checked={value.value}
        onClick={() => {
          onChange({
            t: RuleType.ConstBoolean,
            value: !value.value,
          });
        }}
      >
        {value.value ? labels[0] : labels[1]}
      </Chip>
    </Group>
  );
};
