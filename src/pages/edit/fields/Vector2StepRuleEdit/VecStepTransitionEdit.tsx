import {
  VecStepTransition,
  StepTransitionFnType,
} from "@/shared/libs/numberRule";
import { EditorNumberInput } from "@/shared/ui/EditorNumberInput";
import { Select, Group } from "@mantine/core";
import { useMemo } from "react";

const animationMapping: Record<
  string,
  [StepTransitionFnType, StepTransitionFnType]
> = {
  linear: ["linear", "linear"],
  convex: ["easeInSine", "easeOutSine"],
  concave: ["easeOutSine", "easeInSine"],
};

export const VecStepTransitionEdit = ({
  transition,
  onChange,
}: {
  transition: VecStepTransition;
  onChange: (transition: VecStepTransition) => void;
}) => {
  let matchedPreset: string | null = null;
  if (transition.fns.length === 2) {
    for (const [preset, pair] of Object.entries(animationMapping)) {
      if (
        transition.fns[0]?.t === pair[0] &&
        transition.fns[1]?.t === pair[1]
      ) {
        matchedPreset = preset;
        break;
      }
    }
  }
  const selectValue = matchedPreset || "custom";

  const options = useMemo(() => {
    if (selectValue === "custom") {
      return [...animationOptions, { label: "Custom", value: "custom" }];
    }

    return animationOptions;
  }, [selectValue]);

  return (
    <Group gap='xs' wrap='nowrap'>
      <EditorNumberInput
        label='Step Length (s)'
        value={transition.len}
        min={0.01}
        max={600}
        step={0.1}
        onChange={(value) => onChange({ ...transition, len: value })}
      />
      <Select
        label='Step Animation'
        data={options}
        value={selectValue}
        onChange={(value) => {
          if (value === null) {
            return;
          }
          if (value === "custom") return;
          const fnType = value as StepTransitionFnType;
          const [fnX, fnY] = animationMapping[fnType] || ["linear", "linear"];
          onChange({
            ...transition,
            fns: [{ t: fnX }, { t: fnY }],
          });
        }}
        searchable
        clearable={false}
      />
    </Group>
  );
};

const animationFnNameToLabel: Partial<Record<string, string>> = {
  convex: "Convex",
  concave: "Concave",
  linear: "Linear",
};

const customPresets: string[] = ["convex", "concave", "linear"];

const animationOptions: { label: string; value: string }[] = [
  ...customPresets.map((preset) => ({
    value: preset,
    label: animationFnNameToLabel[preset] || preset,
  })),
];
