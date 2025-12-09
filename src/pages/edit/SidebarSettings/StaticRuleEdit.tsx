import {
  formulaVars,
  FractalParamsBuildRules,
  GradientStop,
} from "@/features/fractals";
import { useStaticRule } from "../store/data/useStaticRule";
import { ReactNode } from "react";
import { Checkbox, Divider, SegmentedControl } from "@mantine/core";
import { FormulaInput } from "../FormulaInput";
import { GradientInput } from "./GradientInput/GradientInput";
import { InitialTimeEdit } from "./InitialTimeEdit";
import { BandSmoothingOptions } from "./BandSmoothingOptions";
import { GradientGenerator } from "./GradientGenerator";

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

  gradient: (props) => (
    <>
      <GradientGenerator
        onChange={(newStops) =>
          props.onChange(
            props.name,
            newStops as FractalParamsBuildRules[typeof props.name],
          )
        }
      />
      <Divider orientation='horizontal' />
      <GradientInput
        stops={props.value as GradientStop[]}
        onChange={(newStops) =>
          props.onChange(
            props.name,
            newStops as FractalParamsBuildRules[typeof props.name],
          )
        }
      />
    </>
  ),

  mirroringType: (props) => (
    <SegmentedControl
      value={props.value as string}
      data={[
        { value: "off", label: "Off" },
        { value: "square", label: "Square" },
        { value: "hex", label: "Hex" },
        { value: "radial", label: "Radial" },
      ]}
      size='sm'
      onChange={(value) =>
        props.onChange(
          props.name,
          value as FractalParamsBuildRules[typeof props.name],
        )
      }
    />
  ),
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
