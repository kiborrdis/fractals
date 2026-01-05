import { Vector2BulidRule, RuleType } from "@/shared/libs/numberRule";
import { SplineRuleEdit } from "../SplineRuleEdit/SplineRuleEdit";
import { Vector2DimsRuleEdit } from "../Vector2DimsRuleEdit/Vector2DimsRuleEdit";
import { Vector2RuleLabel } from "../../ui/Vector2RuleLabel/Vector2RuleLabel";
import { Vector2StepRuleEdit } from "../Vector2StepRuleEdit/Vector2StepRuleEdit";
import { GraphDimsRuleEdit } from "../GraphDimsRuleEdit/GraphDimsRuleEdit";
import { ReactNode, useState } from "react";
import { Button, Collapse } from "@mantine/core";
import { TbChartDots } from "react-icons/tb";
import { Vector2 } from "@/shared/libs/vectors";

export const Vector2RuleEdit = ({
  name,
  value,
  onChange,
  max,
  min,
  minRange,
  sublabels,
  docKey,
  docKey0,
  docKey1,
  label,
  renderGraphMap,
  renderGraphMapEdit,
  onPreview,
}: {
  name: string;
  value: Vector2BulidRule;
  sublabels?: [string, string];
  docKey?: string;
  docKey0?: string;
  docKey1?: string;
  min?: number;
  max?: number;
  minRange?: number;
  label: string;
  renderGraphMap?: () => ReactNode;
  renderGraphMapEdit?: (params: {
    offset: Vector2;
    axisRangeSizes: Vector2;
    setViewport: (axisRangeSizes: Vector2, newOffset: Vector2) => void;
    onExit: () => void;
  }) => ReactNode;
  onPreview?: (name: string, value: [number, number] | undefined) => void;
  onChange: (name: string, value: Vector2BulidRule) => void;
}) => {
  const [graphOpen, setGraphOpen] = useState(false);

  if (!Array.isArray(value)) {
    if (value.t === RuleType.Vector2BSpline) {
      return (
        <>
          <Vector2RuleLabel
            label={label}
            docKey={docKey}
            name={name}
            rule={value}
            onChange={onChange}
            min={min}
            max={max}
          />
          <SplineRuleEdit
            rule={value}
            renderGraphMap={renderGraphMap}
            renderGraphMapEdit={renderGraphMapEdit}
            onPreview={(value) => {
              onPreview?.(name, value);
            }}
            onChange={(newRule) => {
              onChange(name, newRule);
            }}
          />
        </>
      );
    }

    return (
      <>
        <Vector2RuleLabel
          docKey={docKey}
          label={label}
          name={name}
          rule={value}
          onChange={onChange}
          min={min}
          max={max}
        />
        <Vector2StepRuleEdit
          name={name}
          value={value}
          renderGraphMap={renderGraphMap}
          renderGraphMapEdit={renderGraphMapEdit}
          onChange={onChange}
          onPreview={onPreview}
        />
      </>
    );
  }

  return (
    <>
      <Vector2RuleLabel
        name={name}
        label={label}
        rule={value}
        docKey={docKey}
        onChange={onChange}
        min={min}
        max={max}
      />
      <Vector2DimsRuleEdit
        sublabels={sublabels}
        docKey0={docKey0}
        docKey1={docKey1}
        min={min ?? -3}
        max={max ?? 3}
        step={minRange ?? 0.01}
        minRange={minRange ?? 0.01}
        onChange={onChange}
        name={name}
        value={value}
      />
      <Button
        variant='subtle'
        size='compact-xs'
        leftSection={<TbChartDots />}
        onClick={() => setGraphOpen((o) => !o)}
        fullWidth
        mt='xs'
      >
        {graphOpen ? "Hide Graph" : "Show Graph"}
      </Button>
      <Collapse in={graphOpen}>
        <GraphDimsRuleEdit
          name={name}
          value={value}
          renderGraphMap={renderGraphMap}
          renderGraphMapEdit={renderGraphMapEdit}
          onChange={onChange}
          onPreview={onPreview}
        />
      </Collapse>
    </>
  );
};
