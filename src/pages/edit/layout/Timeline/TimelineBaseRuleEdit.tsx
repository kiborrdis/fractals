import {
  NumberBuildRule,
  RuleType,
  StepNumberRule,
} from "@/shared/libs/numberRule";
import { Group, ActionIcon, Button, Stack, Tooltip } from "@mantine/core";
import { FiScissors } from "react-icons/fi";
import { NumberRuleEdit } from "../../fields/NumberRuleEdit/NumberRuleEdit";
import { EditorLabel } from "../../ui/EditorLabel";

export const TimelineBaseRuleEdit = ({
  editingRule,
  newStepActive,
  onNewStepClick,
  onRuleChange,
}: {
  onNewStepClick: () => void;
  onRuleChange: (newRule: NumberBuildRule) => void;
  newStepActive: boolean;
  editingRule: NumberBuildRule | null;
}) => {
  return (
    <Stack gap='xs'>
      {editingRule && (
        <>
          {editingRule.t === RuleType.StepNumber && (
            <Stack gap='md'>
              <NumberRuleEdit
                canSwitchType={false}
                max={10000}
                min={-10000}
                minRange={0.1}
                name={"-"}
                onChange={(_, val) => onRuleChange(val)}
                step={0.1}
                value={editingRule}
              />
              <Group justify='space-between'>
                <EditorLabel size='xs'>Actions</EditorLabel>
                <Tooltip
                  label={newStepActive ? "Disable new step" : "Create new step"}
                >
                  <ActionIcon
                    variant='outline'
                    onClick={onNewStepClick}
                    color={newStepActive ? "green" : "gray"}
                  >
                    <FiScissors />
                  </ActionIcon>
                </Tooltip>
              </Group>
            </Stack>
          )}
          {editingRule.t === RuleType.RangeNumber && (
            <Button
              onClick={() => {
                if (editingRule.t !== RuleType.RangeNumber) {
                  return;
                }
                const partLen = editingRule.period / 2;

                const r0: StepNumberRule = {
                  t: RuleType.StepNumber,
                  range: editingRule.range,
                  steps: [0.5, 1, 0.5, 0],
                  transitions: [
                    { fn: { t: "linear" }, len: partLen },
                    { fn: { t: "linear" }, len: partLen },
                    { fn: { t: "linear" }, len: partLen },
                    { fn: { t: "linear" }, len: partLen },
                  ],
                };

                onRuleChange(r0);
              }}
            >
              Transform to Step
            </Button>
          )}
        </>
      )}
    </Stack>
  );
};
