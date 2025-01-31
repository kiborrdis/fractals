import { memo, useCallback } from "react";
import { NumberRuleEdit } from "./NumberRuleEdit";
import { NumberBuildRule } from "@/shared/libs/numberRule";

export const Vector2RuleEdit = memo(({
  name,
  sublabels,
  max,
  min,
  minRange,
  step,
  value,
  onChange,
}: {
  name: string;
  sublabels?: [string, string];
  max: number;
  min: number;
  minRange: number;
  step: number;
  value: [NumberBuildRule, NumberBuildRule];
  onChange: (name: string, value: [NumberBuildRule, NumberBuildRule]) => void;
}) => {
  const handleChange = useCallback(
    (index: string, newValue: NumberBuildRule) => {
      const newValues = [...value];
      newValues[Number(index)] = newValue;
      onChange(name, newValues as [NumberBuildRule, NumberBuildRule]);
    },
    [name, onChange, value]
  );

  return (
    <>
      {value.map((v, i) => (
        <NumberRuleEdit
          name={String(i)}
          key={i}
          label={sublabels ? sublabels[i] : String(i)}
          max={max}
          min={min}
          minRange={minRange}
          step={step}
          value={v}
          onChange={handleChange}
        />
      ))}
    </>
  );
});
Vector2RuleEdit.displayName = 'Vector2RuleEdit';
