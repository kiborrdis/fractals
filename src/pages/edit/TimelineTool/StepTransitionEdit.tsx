import {
  animationFns,
  StepTransition,
  StepTransitionFnType,
} from "@/shared/libs/numberRule";
import { EditorNumberInput } from "@/shared/ui/EditorNumberInput";
import { Paper, Stack, Text, Group, Select } from "@mantine/core";

export const StepTransitionEdit = ({
  transition,
  start,
  end,
  onChange,
}: {
  transition: StepTransition;
  start: number;
  end: number;
  onChange: (start: number, end: number, transition: StepTransition) => void;
}) => {
  return (
    <Paper p='xs' w={300}>
      <Stack gap='xs'>
        <Text>Step Transition</Text>
        <Group justify='space-between' align='center' gap='xs' wrap='nowrap'>
          <EditorNumberInput
            label='Start'
            value={start}
            min={0}
            max={1}
            step={0.01}
            decimalScale={2}
            onChange={(value) => onChange(value, end, transition)}
          />
          <EditorNumberInput
            label='End'
            value={end}
            min={0}
            max={1}
            step={0.01}
            decimalScale={2}
            onChange={(value) => onChange(start, value, transition)}
          />
          <EditorNumberInput
            label='Length (s)'
            value={transition.len}
            min={0.01}
            max={600}
            step={0.1}
            onChange={(value) =>
              onChange(start, end, { ...transition, len: value })
            }
          />
        </Group>
        <Select
          label='Function'
          data={animationOptions}
          value={transition.fn.t}
          onChange={(value) => {
            if (value === null) {
              return;
            }

            onChange(start, end, {
              ...transition,
              fn: { t: value as StepTransitionFnType },
            });
          }}
        />
      </Stack>
    </Paper>
  );
};
const animationFnNameToLabel: {
  [K in StepTransitionFnType]?: string;
} = {
  linear: "Linear",
  easeInSine: "Ease in sine",
};
const animationOptions: { label: string; value: StepTransitionFnType }[] =
  Object.keys(animationFns).map((fnName) => ({
    value: fnName as StepTransitionFnType,
    label: animationFnNameToLabel[fnName as StepTransitionFnType] || fnName,
  }));
