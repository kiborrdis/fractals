import { VectorRuleTypeMenu } from "./VectorRuleTypeMenu";
import { RuleType, Vector2BulidRule } from "@/shared/libs/numberRule";
import { mergeDocKeys } from "@/shared/ui/DocTooltip";
import { EditorLabel } from "../EditorLabel";

export const Vector2RuleLabel = ({
  label,
  name,
  rule,
  onChange,
  docKey,
  min = -3,
  max = 3,
}: {
  label: string;
  name: string;
  rule: Vector2BulidRule;
  docKey?: string;
  onChange: (name: string, value: Vector2BulidRule) => void;
  min?: number;
  max?: number;
}) => {
  let value: "separate" | "spline" | "steps" | "unknown" = "unknown";

  if (Array.isArray(rule)) {
    value = "separate";
  } else if (rule.t === RuleType.Vector2BSpline) {
    value = "spline";
  } else if (rule.t === RuleType.StepNVector) {
    value = "steps";
  }

  return (
    <EditorLabel
      docKeys={mergeDocKeys(docKey, `${value}-vector-rule`)}
      leftSection={
        <VectorRuleTypeMenu
          name={name}
          value={value}
          min={min}
          max={max}
          onChange={onChange}
        />
      }
    >
      {label}
    </EditorLabel>
  );
};

export default Vector2RuleLabel;
