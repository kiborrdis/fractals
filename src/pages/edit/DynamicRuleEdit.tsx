import { FractalDynamicParamsBuildRules } from "@/features/fractals/types";
import { useDynamicRule } from "./store/data/useDynamicRule";
import { NumberRuleEdit } from "./NumberRuleEdit";
import { Vector2RuleEdit } from "./Vector2RuleEdit";
import { ReactNode } from "react";
import { NumberBuildRule } from "@/shared/libs/numberRule";

type RuleValue = NumberBuildRule | [NumberBuildRule, NumberBuildRule];

type RuleRenderProps<K extends keyof FractalDynamicParamsBuildRules> = {
  name: K;
  value: FractalDynamicParamsBuildRules[K];
  onChange: (name: string, value: RuleValue) => void;
};

type RuleRenderer<K extends keyof FractalDynamicParamsBuildRules> = (
  props: RuleRenderProps<K>
) => ReactNode;

type RuleRenderers = {
  [K in keyof FractalDynamicParamsBuildRules]: RuleRenderer<K>;
};

const ruleConfigs: RuleRenderers = {
  hexMirroringFactor: (props) => (
    <NumberRuleEdit
      label="Hex Mirroring Factor"
      min={0}
      max={2000}
      step={1}
      minRange={10}
      {...props}
    />
  ),

  hexMirroringPerDistChange: (props) => (
    <NumberRuleEdit
      label="Hex Mirroring Per Dist Change"
      min={-2000}
      max={2000}
      step={1}
      minRange={10}
      {...props}
    />
  ),

  linearMirroringFactor: (props) => (
    <NumberRuleEdit
      label="Linear Mirroring Factor"
      min={50}
      max={2000}
      step={1}
      minRange={10}
      {...props}
    />
  ),

  linearMirroringPerDistChange: (props) => (
    <NumberRuleEdit
      label="Linear Mirroring Per Dist Change"
      min={-2000}
      max={2000}
      step={1}
      minRange={1}
      {...props}
    />
  ),

  radialMirroringAngle: (props) => (
    <NumberRuleEdit
      label="Radial Mirroring Angle"
      min={0}
      max={360}
      step={1}
      minRange={5}
      {...props}
    />
  ),

  radialMirroringPerDistChange: (props) => (
    <NumberRuleEdit
      label="Radial Mirroring Per Dist Change"
      min={-180}
      max={180}
      step={0.1}
      minRange={1}
      {...props}
    />
  ),

  time: (props) => (
    <NumberRuleEdit
      label="Time"
      min={0}
      max={1000}
      step={0.1}
      minRange={0.1}
      {...props}
    />
  ),

  c: (props) => (
    <Vector2RuleEdit
      sublabels={["Real", "Imaginary"]}
      min={-3}
      max={3}
      step={0.001}
      minRange={0.001}
      {...props}
    />
  ),

  r: (props) => (
    <NumberRuleEdit
      label="R"
      min={0.5}
      max={50}
      step={0.01}
      minRange={0.01}
      {...props}
    />
  ),

  rlVisibleRange: (props) => (
    <Vector2RuleEdit
      sublabels={["From", "To"]}
      min={-200}
      max={200}
      step={0.01}
      minRange={0.01}
      {...props}
    />
  ),

  imVisibleRange: (props) => (
    <Vector2RuleEdit
      sublabels={["From", "To"]}
      min={-200}
      max={200}
      step={0.01}
      minRange={0.01}
      {...props}
    />
  ),

  maxIterations: (props) => (
    <NumberRuleEdit
      label="Max Iterations"
      min={1}
      max={1000}
      step={1}
      minRange={5}
      {...props}
    />
  ),

  cxPerDistChange: (props) => (
    <NumberRuleEdit
      label="Cx Per Dist Change"
      min={-3}
      max={3}
      step={0.001}
      minRange={0.001}
      {...props}
    />
  ),

  cyPerDistChange: (props) => (
    <NumberRuleEdit
      label="Cy Per Dist Change"
      min={-3}
      max={3}
      step={0.001}
      minRange={0.001}
      {...props}
    />
  ),

  rPerDistChange: (props) => (
    <NumberRuleEdit
      label="R Per Dist Change"
      min={-50}
      max={50}
      step={0.1}
      minRange={1}
      {...props}
    />
  ),

  iterationsPerDistChange: (props) => (
    <NumberRuleEdit
      label="Iterations Per Dist Change"
      min={-100}
      max={500}
      step={1}
      minRange={5}
      {...props}
    />
  ),
};

export const DynamicRuleEdit = ({
  name,
}: {
  name: keyof FractalDynamicParamsBuildRules;
}) => {
  const [rule, setRule] = useDynamicRule(name);

  return ruleConfigs[name]({
    // It's probably better with explicit validation. But not now
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    name,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    value: rule,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    onChange: setRule,
  });
};
