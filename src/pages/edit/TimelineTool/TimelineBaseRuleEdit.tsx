import { NumberBuildRule, RuleType, changeRulePeriod, StepNumberRule } from "@/features/fractals";
import { EditorNumberInput } from "@/shared/ui/EditorNumberInput";
import { Group, Text, Input, ActionIcon, Button } from "@mantine/core";
import { FiCrosshair } from "react-icons/fi";

export const TimelineBaseRuleEdit = ({
  editingRule, name, newStepActive, onNewStepClick, onRuleChange,
}: {
  onNewStepClick: () => void;
  onRuleChange: (newRule: NumberBuildRule) => void;
  newStepActive: boolean;
  editingRule: NumberBuildRule | null;
  name: string;
}) => {
  return (
    <Group>
      {editingRule && (
        <>
          <Text size="sm" fw={600}>{name}</Text>
          {editingRule.t === RuleType.StepNumber && (
            <>
              <Group gap={4}>
                <Text size="xs" fw={500}>
                  From:To
                </Text>
                <EditorNumberInput
                  w={80}
                  decimalScale={4}
                  value={editingRule.range[0]}
                  onChange={(v) => {
                    if (editingRule.t !== RuleType.StepNumber) {
                      return;
                    }

                    onRuleChange({
                      ...editingRule,
                      range: [v, editingRule.range[1]],
                    });
                  }}
                  step={0.01} />
                <EditorNumberInput
                  w={80}
                  decimalScale={4}
                  value={editingRule.range[1]}
                  onChange={(v) => {
                    if (editingRule.t !== RuleType.StepNumber) {
                      return;
                    }
                    onRuleChange({
                      ...editingRule,
                      range: [editingRule.range[0], v],
                    });
                  }}
                  step={0.01} />
              </Group>
              <Group gap={4}>
                <Input.Label size="xs" htmlFor="period">
                  Period (s)
                </Input.Label>

                <EditorNumberInput
                  id={"period"}
                  value={editingRule.transitions.reduce((m, t) => m + t.len, 0)}
                  onChange={(newLen) => {
                    if (editingRule.t !== RuleType.StepNumber || newLen === 0) {
                      return;
                    }

                    onRuleChange(changeRulePeriod(editingRule, newLen));
                  }}
                  step={0.01} />
              </Group>
              <ActionIcon
                color={newStepActive ? "green" : "gray"}
                onClick={onNewStepClick}
              >
                <FiCrosshair />
              </ActionIcon>
            </>
          )}
          {editingRule.t === RuleType.RangeNumber && (
            <Button
              onClick={() => {
                if (editingRule.t !== RuleType.RangeNumber) {
                  return;
                }
                const partLen = editingRule.cycleSeconds / 2;

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
    </Group>
  );
};
