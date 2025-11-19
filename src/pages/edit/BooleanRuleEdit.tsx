import { Checkbox } from "@mantine/core";
import { ConstBooleanRule, RuleType } from "@/features/fractals/types";

export const BooleanRuleEdit = ({
  labels = ["On", "Off"],
  value,
  onChange,
}: {
  labels: [string, string];
  value: ConstBooleanRule;
  onChange: (value: ConstBooleanRule) => void;
}) => {
  return (
    <Checkbox
      size="sm"
      label={value.value ? labels[0] : labels[1]}
      checked={value.value}
      onClick={() => {
        onChange({
          t: RuleType.ConstBoolean,
          value: !value.value,
        });
      }}
    />
  );
};
