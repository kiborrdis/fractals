import { formulaVars, FractalParamsBuildRules } from "@/features/fractals";
import { useStaticRule } from "../../stores/editStore/data/useStaticRule";
import { ReactNode } from "react";
import { Checkbox, Select } from "@mantine/core";
import { FormulaInput } from "../../ui/FormulaInput";
import { InitialTimeEdit } from "../InitialTimeEdit/InitialTimeEdit";
import { BandSmoothingOptions } from "../BandSmoothingOptions/BandSmoothingOptions";
import { EditorLabel } from "../../ui/EditorLabel";
import { TrapEditor } from "../TrapEditor/TrapEditor";

type RuleRenderProps<K extends keyof Omit<FractalParamsBuildRules, "dynamic">> =
  {
    name: K;
    value: FractalParamsBuildRules[K];
    onChange: (name: K, value: FractalParamsBuildRules[K]) => void;
  };

type RuleRenderer<
  K extends keyof Omit<FractalParamsBuildRules, "dynamic" | "custom">,
> = (props: RuleRenderProps<K>) => ReactNode;

type RuleRenderers = {
  [K in keyof Omit<
    FractalParamsBuildRules,
    "dynamic" | "custom"
  >]: RuleRenderer<K>;
};

const ruleConfigs: RuleRenderers = {
  formula: (props) => (
    <FormulaInput
      vars={formulaVars}
      value={props.value as string}
      docKey='fractal-formula'
      onChange={(newValue) => {
        if (newValue.trim() === "") {
          return "";
        }

        props.onChange(
          props.name,
          newValue as FractalParamsBuildRules[typeof props.name],
        );
      }}
    />
  ),
  antialiasingLevel: (props) => (
    <Select
      label={
        <EditorLabel size='xs' docKeys={"supersampling"}>
          Supersampling
        </EditorLabel>
      }
      onChange={(newValue) => {
        props.onChange(props.name, Number(newValue));
      }}
      value={String(props.value || 1)}
      data={[
        { value: "1", label: "1x (No AA)" },
        { value: "2", label: "2x" },
        { value: "4", label: "4x" },
        { value: "8", label: "8x" },
        { value: "16", label: "16x" },
        { value: "32", label: "32x" },
      ]}
    />
  ),

  initialTime: (props) => {
    return (
      <InitialTimeEdit
        value={props.value}
        onChange={(value) => props.onChange(props.name, value)}
      />
    );
  },

  bandSmoothing: (props) => (
    <BandSmoothingOptions
      value={props.value}
      onChange={(v) => {
        props.onChange(props.name, v);
      }}
    />
  ),

  invert: (props) => (
    <Checkbox
      label='Invert'
      checked={props.value}
      onChange={() => {
        props.onChange(props.name, !props.value);
      }}
    />
  ),

  gradients: () => null,

  traps: (_props) => <TrapEditor />,
};

export const StaticRuleEdit = ({
  name,
}: {
  name: keyof Omit<FractalParamsBuildRules, "dynamic" | "custom">;
}) => {
  const [rule, setRule] = useStaticRule(name);
  const Component = ruleConfigs[name];

  if (!Component) {
    return null;
  }

  // Could probably do it little more cleanly, but not today
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  return <Component name={name} value={rule} onChange={setRule} />;
};
