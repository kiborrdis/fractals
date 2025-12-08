import { FractalParamsBuildRules, GradientStop } from "@/features/fractals";
import { useStaticRule } from "./store/data/useStaticRule";
import { ReactNode, useState } from "react";
import {
  Button,
  Checkbox,
  NumberInput,
  SegmentedControl,
  Stack,
  Text,
} from "@mantine/core";
import { FormulaInput } from "./FormulaInput";
import { randomRange } from "@/features/fractals/utils";
import { GradientInput } from "./GradientInput";
import { useDynamicRule } from "./store/data/useDynamicRule";
import { extractMaxValueFromRule } from "@/shared/libs/numberRule";

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
      value={props.value as string}
      onChange={(newValue) => {
        if (newValue.trim() === "") {
          return "";
        }

        props.onChange(
          props.name,
          newValue as FractalParamsBuildRules[typeof props.name],
        )
      }}
    />
  ),

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
      <GenerateGradient
        onChange={(newStops) =>
          props.onChange(
            props.name,
            newStops as FractalParamsBuildRules[typeof props.name],
          )
        }
      />
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

const GenerateGradient = ({
  onChange,
}: {
  onChange: (val: GradientStop[]) => void;
}) => {
  const [val, setValue] = useState(0);
  const [iterations] = useDynamicRule("maxIterations");

  let maxValue = 10;
  if (Array.isArray(iterations)) {
    maxValue = extractMaxValueFromRule(iterations[1]);
  } else {
    maxValue = extractMaxValueFromRule(iterations);
  }

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
            const position = (maxValue * i) / val;
            const r = randomRange(0, 1);
            const g = randomRange(0, 1);
            const b = randomRange(0, 1);
            stops.push([position, r, g, b, 1]);
          }

          onChange(stops);
        }}
      >
        Generate
      </Button>
    </>
  );
};

const BandSmoothingOptions = ({
  value = 0,
  onChange,
}: {
  value?: number;
  onChange: (value: number) => void;
}) => {
  let smoothingType: "auto" | "disabled" | "custom" = "auto";

  if (value >= 2) {
    smoothingType = "custom";
  } else if (value < 0) {
    smoothingType = "disabled";
  }

  return (
    <Stack>
      <Text size='sm' fw={600}>
        Band Smoothing
      </Text>
      <SegmentedControl
        value={smoothingType}
        data={[
          { value: "auto", label: "Auto" },
          { value: "disabled", label: "Disabled" },
          { value: "custom", label: "Custom" },
        ]}
        size='sm'
        onChange={(newValue) => {
          let smoothingValue = 0;
          if (newValue === "custom") {
            smoothingValue = 2;
          } else if (newValue === "disabled") {
            smoothingValue = -1;
          }

          onChange(smoothingValue);
        }}
      />
      {smoothingType === "custom" && (
        <NumberInput
          value={value}
          min={2}
          step={1}
          disabled={smoothingType !== "custom"}
          onChange={(newValue) => {
            if (isNaN(Number(newValue))) {
              onChange(2);
              return;
            }

            onChange(Number(newValue));
          }}
        />
      )}
    </Stack>
  );
};

export const StaticRuleEdit = ({
  name,
}: {
  name: keyof Omit<FractalParamsBuildRules, "dynamic" | "custom">;
}) => {
  const [rule, setRule] = useStaticRule(name);
  const renderFunc = ruleConfigs[name];

  if (!renderFunc) {
    return null;
  }

  return renderFunc({
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
