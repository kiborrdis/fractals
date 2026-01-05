import {
  formulaVars,
  FractalParamsBuildRules,
  FractalTrap,
  GradientStop,
} from "@/features/fractals";
import { useStaticRule } from "../../stores/editStore/data/useStaticRule";
import { ReactNode } from "react";
import { Checkbox, ColorInput, SegmentedControl, Select } from "@mantine/core";
import { FormulaInput } from "../../ui/FormulaInput";
import { GradientRuleEdit } from "./GradientRuleEdit";
import { InitialTimeEdit } from "../InitialTimeEdit/InitialTimeEdit";
import { BandSmoothingOptions } from "../BandSmoothingOptions/BandSmoothingOptions";
import { EditorNumberInput } from "@/shared/ui/EditorNumberInput";
import { EditorLabel } from "../../ui/EditorLabel";
import { TrapEditor } from "../TrapEditor/TrapEditor";
import { TrapColoringGradient } from "../GradientInput/TrapColoringGradient";

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

  gradient: (props) => (
    <GradientRuleEdit
      value={props.value as GradientStop[]}
      onChange={props.onChange}
      name={props.name}
    />
  ),

  gradientColoringEnabled: (props) => (
    <Checkbox
      label='Enable Gradient Coloring'
      checked={props.value ?? true}
      onChange={() => {
        props.onChange(props.name, !props.value);
      }}
    />
  ),

  borderColoringEnabled: (props) => (
    <Checkbox
      label='Enable Border Coloring'
      checked={props.value ?? false}
      onChange={() => {
        props.onChange(props.name, !props.value);
      }}
    />
  ),

  borderColor: (props) => {
    const val = props.value || [0, 0, 0, 255];
    return (
      <ColorInput
        label='Border Color'
        format='rgba'
        onChange={(color) => {
          // Convert rgba(255, 255, 255, 1) to [1,1,1,255]
          const rgba = color
            .replace("rgba(", "")
            .replace("rgb(", "")
            .replace(")", "")
            .split(",")
            .map((v) => v.trim());
          const r = parseInt(rgba[0], 10) / 255;
          const g = parseInt(rgba[1], 10) / 255;
          const b = parseInt(rgba[2], 10) / 255;
          const a =
            rgba.length === 4 ? Math.floor(parseFloat(rgba[3]) * 255) : 255;
          props.onChange(props.name, [
            r,
            g,
            b,
            a,
          ] as FractalParamsBuildRules[typeof props.name]);
        }}
        value={`rgba(${Math.floor(val[0] * 255)}, ${Math.floor(val[1] * 255)}, ${Math.floor(val[2] * 255)}, ${val[3] / 255})`}
      />
    );
  },

  borderIntensity: (props) => (
    <EditorNumberInput
      min={0}
      max={1000000}
      step={1}
      value={props.value ?? 1}
      onChange={(value) => {
        props.onChange(props.name, value);
      }}
    />
  ),

  trapColoringEnabled: (props) => (
    <Checkbox
      label='Enable Trap Coloring'
      checked={props.value ?? false}
      onChange={() => {
        props.onChange(props.name, !props.value);
      }}
    />
  ),

  traps: (props) => (
    <TrapEditor
      traps={(props.value as FractalTrap[]) ?? []}
      onChange={(traps) =>
        props.onChange(
          props.name,
          traps as FractalParamsBuildRules[typeof props.name],
        )
      }
    />
  ),

  trapIntensity: (props) => (
    <>
      <EditorLabel>Trap Intensity</EditorLabel>
      <EditorNumberInput
        min={0}
        max={1000000}
        step={1}
        value={props.value ?? 0}
        onChange={(value) => {
          props.onChange(props.name, value);
        }}
      />
    </>
  ),

  trapGradient: (props) => (
    <TrapColoringGradient
      value={
        (props.value as GradientStop[]) ?? [
          [0, 1, 1, 1, 1],
          [100, 0, 0, 0, 1],
        ]
      }
      onChange={props.onChange}
      name={props.name as "trapGradient"}
    />
  ),

  mirroringType: (props) => (
    <>
      <EditorLabel docKeys={"mirroring-type"}>Mirroring Type</EditorLabel>
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
    </>
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
