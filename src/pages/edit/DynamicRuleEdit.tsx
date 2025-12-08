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
  props: RuleRenderProps<K>,
) => ReactNode;

type RuleRenderers = {
  [K in keyof FractalDynamicParamsBuildRules]: RuleRenderer<K>;
};

const ruleConfigs: RuleRenderers = {
  hexMirroringFactor: (props) => (
    <NumberRuleEdit
      label='Hex Mirroring (px)'
      min={0}
      max={2000}
      step={1}
      minRange={10}
      {...props}
    />
  ),

  hexMirroringPerDistChange: (props) => (
    <NumberRuleEdit
      label='Distance based change (px)'
      min={-2000}
      max={2000}
      step={1}
      minRange={10}
      {...props}
    />
  ),

  linearMirroringFactor: (props) => (
    <NumberRuleEdit
      label='Linear mirroring (px)'
      min={50}
      max={2000}
      step={1}
      minRange={10}
      {...props}
    />
  ),

  linearMirroringPerDistChange: (props) => (
    <NumberRuleEdit
      label='Distance based change (px)'
      min={-2000}
      max={2000}
      step={1}
      minRange={1}
      {...props}
    />
  ),

  radialMirroringAngle: (props) => (
    <NumberRuleEdit
      label='Radial mirroring angle (deg)'
      min={0}
      max={360}
      step={1}
      minRange={5}
      {...props}
    />
  ),

  radialMirroringPerDistChange: (props) => (
    <NumberRuleEdit
      label='Distance based change (deg)'
      min={-180}
      max={180}
      step={0.1}
      minRange={1}
      {...props}
    />
  ),

  time: (props) => (
    <NumberRuleEdit
      label='Time'
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

  cxPerDistChange: (props) => (
    <NumberRuleEdit
      label='C(Real) Distance based change'
      min={-3}
      max={3}
      step={0.001}
      minRange={0.001}
      {...props}
    />
  ),

  cyPerDistChange: (props) => (
    <NumberRuleEdit
      label='C(Imaginary) Distance based change'
      min={-3}
      max={3}
      step={0.001}
      minRange={0.001}
      {...props}
    />
  ),

  r: (props) => (
    <NumberRuleEdit
      label='Escape Radius'
      min={0.5}
      max={50}
      step={0.01}
      minRange={0.01}
      {...props}
    />
  ),

  rlVisibleRange: (props) => (
    <Vector2RuleEdit
      sublabels={["Visible x from", "To"]}
      min={-200}
      max={200}
      step={0.01}
      minRange={0.01}
      {...props}
    />
  ),

  imVisibleRange: (props) => (
    <Vector2RuleEdit
      sublabels={["Visible y from", "To"]}
      min={-200}
      max={200}
      step={0.01}
      minRange={0.01}
      {...props}
    />
  ),

  maxIterations: (props) => (
    <NumberRuleEdit
      label='Maximum iterations'
      min={1}
      max={1000}
      step={1}
      minRange={5}
      {...props}
    />
  ),

  rPerDistChange: (props) => (
    <NumberRuleEdit
      label='Distance based change'
      min={-50}
      max={50}
      step={0.1}
      minRange={1}
      {...props}
    />
  ),

  iterationsPerDistChange: (props) => (
    <NumberRuleEdit
      label='Distance based change'
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

  const Component = ruleConfigs[name];

  // Could probably do it little more cleanly, but not today
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  return <Component name={name} value={rule} onChange={setRule} />;
};
