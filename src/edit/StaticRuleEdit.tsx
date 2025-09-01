import { FractalParamsBuildRules, GradientStop } from "../fractals/types";
import { useStaticRule } from "./store/data/useStaticRule";
import { GradientInput } from "./GradientInput";
import { ReactNode } from "react";
import { SegmentedControl } from "@mantine/core";
import { FormulaInput } from "./FormulaInput";

type RuleRenderProps<K extends keyof Omit<FractalParamsBuildRules, 'dynamic'>> = {
  name: K;
  value: FractalParamsBuildRules[K];
  onChange: (name: K, value: FractalParamsBuildRules[K]) => void;
};

type RuleRenderer<K extends keyof Omit<FractalParamsBuildRules, 'dynamic'>> = (
  props: RuleRenderProps<K>
) => ReactNode;

type RuleRenderers = {
  [K in keyof Omit<FractalParamsBuildRules, 'dynamic'>]: RuleRenderer<K>;
};

const ruleConfigs: RuleRenderers = {
  formula: (props) => (
    <FormulaInput
      value={props.value as string}
      onChange={(newValue) => props.onChange(props.name, newValue as FractalParamsBuildRules[typeof props.name])}
    />
  ),

  gradient: (props) => (
    <GradientInput
      initialStops={props.value as GradientStop[]}
      onChange={(newStops) => props.onChange(props.name, newStops as FractalParamsBuildRules[typeof props.name])}
    />
  ),

  mirroringType: (props) => (
    <SegmentedControl
      value={props.value as string}
      data={[
        { value: "off", label: "Off" },
        { value: "square", label: "Square" },
        { value: "hex", label: "Hex" },
      ]}
      size="sm"
      onChange={(value) =>
        props.onChange(props.name, value as FractalParamsBuildRules[typeof props.name])
      }
    />
  ),
};

export const StaticRuleEdit = ({
  name,
}: {
  name: keyof Omit<FractalParamsBuildRules, 'dynamic'>;
}) => {
  const [rule, setRule] = useStaticRule(name);

  return ruleConfigs[name]({
    // Type assertion needed due to the generic nature of the rule system
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
