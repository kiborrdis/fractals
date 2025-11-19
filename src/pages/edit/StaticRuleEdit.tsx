import { FractalParamsBuildRules, GradientStop } from "@/features/fractals";
import { useStaticRule } from "./store/data/useStaticRule";
import { GradientInput } from "./GradientInput";
import { ReactNode, useState } from "react";
import { Button, NumberInput, SegmentedControl } from "@mantine/core";
import { FormulaInput } from "./FormulaInput";
import { randomRange } from "@/features/fractals/utils";

type RuleRenderProps<K extends keyof Omit<FractalParamsBuildRules, "dynamic">> =
  {
    name: K;
    value: FractalParamsBuildRules[K];
    onChange: (name: K, value: FractalParamsBuildRules[K]) => void;
  };

type RuleRenderer<K extends keyof Omit<FractalParamsBuildRules, "dynamic">> = (
  props: RuleRenderProps<K>
) => ReactNode;

type RuleRenderers = {
  [K in keyof Omit<FractalParamsBuildRules, "dynamic">]: RuleRenderer<K>;
};

const ruleConfigs: RuleRenderers = {
  formula: (props) => (
    <FormulaInput
      value={props.value as string}
      onChange={(newValue) =>
        props.onChange(
          props.name,
          newValue as FractalParamsBuildRules[typeof props.name]
        )
      }
    />
  ),

  gradient: (props) => (
    <>
      <GenerateGradient
        onChange={(newStops) =>
          props.onChange(
            props.name,
            newStops as FractalParamsBuildRules[typeof props.name]
          )
        }
      />
      <GradientInput
        initialStops={props.value as GradientStop[]}
        onChange={(newStops) =>
          props.onChange(
            props.name,
            newStops as FractalParamsBuildRules[typeof props.name]
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
      ]}
      size="sm"
      onChange={(value) =>
        props.onChange(
          props.name,
          value as FractalParamsBuildRules[typeof props.name]
        )
      }
    />
  ),
};

const GenerateGradient = ({
  onChange,
}: {
  onChange: (val: GradientStop[]) => void;
}) => {
  const [val, setValue] = useState(0);
  return (
    <>
      <NumberInput
        value={val}
        onChange={(newVal) => {
          if (isNaN(Number(newVal))) {
            setValue(0);
          }

          setValue(Number(newVal));
        }}
      />
      <Button
        onClick={() => {
          if (val < 2) {
            return;
          }

          const stops: GradientStop[] = [];
          for (let i = 0; i <= val; i++) {
            const position = i / val;
            const r = randomRange(0, 1);
            const g = randomRange(0, 1);
            const b = randomRange(0, 1);
            stops.push([position, r, g, b, 1]);
          }

          onChange(stops)
        }}
      >
        Generate
      </Button>
    </>
  );
};

export const StaticRuleEdit = ({
  name,
}: {
  name: keyof Omit<FractalParamsBuildRules, "dynamic">;
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
