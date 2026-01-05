import { FractalDynamicParamsBuildRules } from "@/features/fractals/types";
import { useDynamicRule } from "../../stores/editStore/data/useDynamicRule";
import { NumberRuleEdit } from "../NumberRuleEdit/NumberRuleEdit";
import { Vector2DimsRuleEdit } from "../Vector2DimsRuleEdit/Vector2DimsRuleEdit";
import { ComponentProps, ReactNode, useCallback } from "react";
import { NumberBuildRule, Vector2BulidRule } from "@/shared/libs/numberRule";
import { Vector2RuleEdit } from "../Vector2RuleEdit/Vector2RuleEdit";
import { mergeDocKeys } from "@/shared/ui/DocTooltip";
import { useActions } from "../../stores/editStore/data/useActions";
import { GraphFractalMap } from "../../ui/GraphFractalMap";
import {
  GraphMapParamProvider,
  useGraphMapParam,
} from "../../stores/graphMapState";
import { MapEditMode } from "../../ui/MapEditMode/MapEditMode";

type RuleValue = NumberBuildRule | Vector2BulidRule;

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

const CGraphMap = () => {
  const [c] = useGraphMapParam();

  return <GraphFractalMap c={c} />;
};

const renderGraphMapForC = () => {
  return <CGraphMap />;
};

const ruleConfigs: RuleRenderers = {
  hexMirroringFactor: (props) => (
    <NumberRuleEdit
      docKey='hex-mirroring'
      label='Hex Mirroring'
      min={0}
      max={4}
      step={0.01}
      minRange={0.01}
      {...props}
    />
  ),

  hexMirroringDistVariation: (props) => (
    <NumberRuleEdit
      docKey={mergeDocKeys("dist-variation", "hex-mirroring")}
      label='Distance Variation'
      min={-4}
      max={4}
      step={0.01}
      minRange={0.01}
      {...props}
    />
  ),

  linearMirroringFactor: (props) => (
    <NumberRuleEdit
      docKey='linear-mirroring'
      label='Linear mirroring'
      min={0}
      max={4}
      step={0.01}
      minRange={0.01}
      {...props}
    />
  ),

  linearMirroringDistVariation: (props) => (
    <NumberRuleEdit
      docKey={mergeDocKeys("dist-variation", "linear-mirroring")}
      label='Distance Variation'
      min={-4}
      max={4}
      step={0.01}
      minRange={0.01}
      {...props}
    />
  ),

  radialMirroringAngle: (props) => (
    <NumberRuleEdit
      docKey='radial-mirroring'
      label='Radial mirroring angle (deg)'
      min={0}
      max={360}
      step={1}
      minRange={5}
      {...props}
    />
  ),

  radialMirroringDistVariation: (props) => (
    <NumberRuleEdit
      docKey={mergeDocKeys("dist-variation", "radial-mirroring")}
      label='Distance Variation (deg)'
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

  c: (props) => {
    return (
      <GraphMapParamProvider>
        <Vector2RuleEditContainer
          label='Complex Constant (C)'
          docKey='c'
          docKey0='real'
          docKey1='imaginary'
          sublabels={["Real", "Imaginary"]}
          renderGraphMap={renderGraphMapForC}
          renderGraphMapEdit={({
            offset,
            axisRangeSizes,
            onExit,
            setViewport,
          }) => {
            return (
              <MapEditMode
                offset={offset}
                axisRangeSizes={axisRangeSizes}
                setViewport={setViewport}
                onExit={onExit}
              />
            );
          }}
          {...props}
        />
      </GraphMapParamProvider>
    );
  },

  cDistVariation: (props) => {
    return (
      <Vector2RuleEditContainer
        label='C Distance Variation'
        docKey={mergeDocKeys("dist-variation", "c")}
        docKey0='real'
        docKey1='imaginary'
        sublabels={["Real", "Imaginary"]}
        {...props}
      />
    );
  },

  r: (props) => (
    <NumberRuleEdit
      label='Escape Radius'
      docKey='r'
      min={0.5}
      max={50}
      step={0.01}
      minRange={0.01}
      {...props}
    />
  ),

  imVisibleRange: (props) => {
    const value = props.value;
    if (!Array.isArray(value)) {
      throw new Error("Expected array value for 'c' dynamic rule");
    }

    return (
      <Vector2DimsRuleEdit
        sublabels={["Visible x from", "To"]}
        min={-200}
        max={200}
        step={0.01}
        minRange={0.01}
        {...props}
        value={value}
      />
    );
  },

  rlVisibleRange: (props) => {
    const value = props.value;
    if (!Array.isArray(value)) {
      throw new Error("Expected array value for 'c' dynamic rule");
    }
    return (
      <Vector2DimsRuleEdit
        sublabels={["Visible y from", "To"]}
        min={-200}
        max={200}
        step={0.01}
        minRange={0.01}
        {...props}
        value={value}
      />
    );
  },

  maxIterations: (props) => (
    <NumberRuleEdit
      label='Maximum iterations'
      docKey='max-iterations'
      min={1}
      max={1000}
      step={1}
      minRange={5}
      {...props}
    />
  ),

  rDistVariation: (props) => (
    <NumberRuleEdit
      label='Distance Variation'
      docKey={mergeDocKeys("dist-variation", "escape-radius")}
      min={-50}
      max={50}
      step={0.1}
      minRange={1}
      {...props}
    />
  ),

  iterationsDistVariation: (props) => (
    <NumberRuleEdit
      docKey={mergeDocKeys("dist-variation", "max-iterations")}
      label='Distance Variation'
      min={-100}
      max={500}
      step={1}
      minRange={5}
      {...props}
    />
  ),
};

const Vector2RuleEditContainer = (
  props: ComponentProps<typeof Vector2RuleEdit>,
) => {
  const { dynamicParamOverride } = useActions();

  const onPreview = useCallback(
    (name: string, value: [number, number] | undefined) => {
      dynamicParamOverride([name], value);
    },
    [dynamicParamOverride],
  );

  return <Vector2RuleEdit onPreview={onPreview} {...props} />;
};

export const DynamicRuleEdit = ({
  name,
}: {
  name: keyof FractalDynamicParamsBuildRules;
}) => {
  const [rule, setRule] = useDynamicRule(name);

  const Component = ruleConfigs[name];

  if (!Component) {
    console.warn(`No DynamicRuleEdit component for rule: ${name}`);
    if (process.env.NODE_ENV !== "production") {
      return <div>Unsupported dynamic rule: {name}</div>;
    }

    return null;
  }

  // Could probably do it little more cleanly, but not today
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  return <Component name={name} value={rule} onChange={setRule} />;
};
