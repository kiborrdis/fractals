import {
  getDynamicParamLabel,
} from "@/features/fractals";
import { useEffect, useMemo, useState } from "react";
import { useFractalRules } from "../store/data/useFractalParamsData";
import { Box, Group, Paper, Stack } from "@mantine/core";
import { useActions } from "../store/data/useActions";
import { TimelineGraph } from "./TimelineGraph";
import { StepTransitionEdit } from "./StepTransitionEdit";
import { lowestCommonMultiple } from "@/shared/libs/numbers";
import { useCurrentTime } from "../store/data/useCurrentTime";
import { TimelineBaseRuleEdit } from "./TimelineBaseRuleEdit";
import { TimelineRulesList } from "./TimelineRulesList";
import { TimelineControls } from "./TimelineControls";
import { RangeNumberRule, RuleType, StepNumberRule } from "@/shared/libs/numberRule";

export const colorsArray = [
  "rgba(255, 0, 0, 0.7)",
  "rgba(255, 165, 0, 0.7)",
  "rgba(255, 255, 0, 0.7)",
  "rgba(0, 128, 0, 0.7)",
  "rgba(0, 0, 255, 0.7)",
  "rgba(75, 0, 130, 0.7)",
  "rgba(238, 130, 238, 0.7)",
  "rgba(255, 192, 203, 0.7)",
  "rgba(165, 42, 42, 0.7)",
  "rgba(128, 128, 128, 0.7)",
  "rgba(0, 0, 0, 0.7)",
  "rgba(255, 255, 255, 0.7)",
  "rgba(0, 255, 255, 0.7)",
  "rgba(255, 0, 255, 0.7)",
  "rgba(50, 205, 50, 0.7)",
  "rgba(128, 0, 0, 0.7)",
  "rgba(0, 0, 128, 0.7)",
  "rgba(128, 128, 0, 0.7)",
  "rgba(0, 128, 128, 0.7)",
  "rgba(128, 0, 128, 0.7)",
];

export const TimelineTool = () => {
  const [activeRangesIds, setActiveRangesIds] = useState<
    Record<string, boolean>
  >({});
  const [editingRuleId, setEditingRuleId] = useState<
    string | null
  >(null);

  const time = useCurrentTime();

  const [editingStepIndex, setEditingStepIndex] = useState<number | null>(null);
  const [newStep, setNewStep] = useState<boolean>(false);
  const [previewValueOnHover, setPreviewValueOnHover] = useState<boolean>(true);

  
  const {
    dynamicParamOverride,
    initialLoopStateChange,
    dynamicRuleChangeByRoute,
  } = useActions();
  const dynamicNumberRules = useDynamicNumberRules();
  const editingRule =  dynamicNumberRules.find(({ id }) => id === editingRuleId);

  const activeRules: typeof dynamicNumberRules = useMemo(() => {
    const arr: typeof dynamicNumberRules = [];

    dynamicNumberRules.forEach((rule) => {
      if (activeRangesIds[rule.id]) {
        arr.push(rule);
      }
    });

    return arr;
  }, [activeRangesIds, dynamicNumberRules]);

  const [lockToPeriod, setLockToPeriod] = useState(true);
  const [visibleTo, setVisibleTo] = useState(0);

  const period = useMemo(() => calcPeriod(activeRules), [activeRules]);
  const fullPeriod = useMemo(
    () => calcPeriod(dynamicNumberRules),
    [dynamicNumberRules]
  );

  useEffect(() => {
    if (visibleTo > period || (lockToPeriod && visibleTo !== period)) {
      setVisibleTo(period);
    }
  }, [visibleTo, period, lockToPeriod]);

  return (
    <Stack style={{ position: "relative", width: "100%" }}>
      <Stack
        gap={4}
        style={{
          position: "absolute",
          top: -8,
          left: 0,
          right: 0,
          transform: "translate(0, -100%)",
        }}
      >
        {editingStepIndex !== null &&
          editingRule &&
          editingRule.rule.t === RuleType.StepNumber && (
            <StepTransitionEdit
              transition={editingRule.rule.transitions[editingStepIndex]}
              start={editingRule.rule.steps[editingStepIndex]}
              end={
                editingRule.rule.steps[
                  (editingStepIndex + 1) % editingRule.rule.steps.length
                ]
              }
              onChange={(start, end, transition) => {
                const r0 = { ...editingRule.rule };
                if (r0.t !== RuleType.StepNumber) {
                  return;
                }
                r0.steps = [...r0.steps];
                r0.transitions = [...r0.transitions];

                r0.steps[editingStepIndex] = start;
                r0.steps[(editingStepIndex + 1) % r0.steps.length] = end;
                r0.transitions[editingStepIndex] = transition;

                dynamicRuleChangeByRoute(editingRule.route, r0);
              }}
            />
          )}

        {editingRule && (
          <Paper p="xs">
            <TimelineBaseRuleEdit
              editingRule={editingRule?.rule ?? null}
              name={editingRule?.name ?? ""}
              newStepActive={newStep}
              onNewStepClick={() => {
                setNewStep((prev) => !prev);
              }}
              onRuleChange={(newRule) => {
                if (editingRule) {
                  dynamicRuleChangeByRoute(editingRule.route, newRule);
                }
              }}
            />
          </Paper>
        )}
      </Stack>

      <Group align="start" wrap="nowrap" gap='xs' p='xs'>
        <Box w="150px">
          <TimelineRulesList
            activeRangesIds={activeRangesIds}
            editingRangeId={editingRuleId}
            numberRules={dynamicNumberRules}
            onRuleActivityChange={(id, newVal) =>
              setActiveRangesIds((old) => ({ ...old, [id]: newVal }))
            }
            onRuleEditChange={(id) =>
              setEditingRuleId((old) => (old === id ? null : id))
            }
          />
        </Box>

        <Stack gap="xs" flex={1}>
          <TimelineControls
            previewValueOnHover={previewValueOnHover}
            visibleTo={visibleTo}
            period={period}
            lockToPeriod={lockToPeriod}
            onPreviewValueOnHoverChange={setPreviewValueOnHover}
            onLockToPeriodChange={setLockToPeriod}
            onRangeChange={setVisibleTo}
          />

          <TimelineGraph
            displayTime={time % fullPeriod}
            onStepCreateEnd={() => setNewStep(false)}
            newStepModeActive={newStep}
            visibleTo={visibleTo}
            editingId={editingRuleId}
            selectedEditStep={editingStepIndex ?? undefined}
            rules={activeRules}
            onClick={(t) => {
              if (!editingRule && period !== 0) {
                initialLoopStateChange(t);
              }
            }}
            onDynamicParamOverrideReset={() => {
              if (previewValueOnHover) {
                dynamicNumberRules.forEach((r) => {
                  dynamicParamOverride(r.route, undefined);
                });
              }
            }}
            onDynamicParamOverride={(v) => {
              if (previewValueOnHover) {
                v.forEach((val, i) => {
                  dynamicParamOverride(activeRules[i].route, val);
                });
              }
            }}
            onStepSelect={(stepIndex) => {
              setEditingStepIndex((prev) =>
                prev === stepIndex ? null : stepIndex
              );
            }}
            onChange={(newRule) => {
              if (editingRule) {
                dynamicRuleChangeByRoute(editingRule.route, newRule);
              }
            }}
          />
        </Stack>
      </Group>
    </Stack>
  );
};

export type TimelineNumberRuleItem = {
  id: string;
  name: string;
  route: string[];
  color: string;
  rule: RangeNumberRule | StepNumberRule;
};

const useDynamicNumberRules = (): TimelineNumberRuleItem[] => {
  const fractal = useFractalRules();
  return Object.entries(fractal.dynamic).reduce<TimelineNumberRuleItem[]>(
    (memo, [key, rule]) => {
      if (
        "t" in rule &&
        (rule.t === RuleType.RangeNumber ||
          rule.t === RuleType.StepNumber)
      ) {
        const route = [key];
        memo.push({
          id: route.join('.'),
          route: route,
          name: getDynamicParamLabel(route),
          color: colorsArray[memo.length % colorsArray.length],
          rule: rule as RangeNumberRule | StepNumberRule,
        });
      } else if (Array.isArray(rule)) {
        rule.forEach((aRule, i) => {
          if (
            aRule.t === RuleType.RangeNumber ||
            aRule.t === RuleType.StepNumber
          ) {
            const route = [key, String(i)]
            memo.push({
              id: route.join('.'),
              route: route,
              name: getDynamicParamLabel(route),
              color: colorsArray[memo.length % colorsArray.length],
              rule: aRule as RangeNumberRule | StepNumberRule,
            });
          }
        });
      }
      return memo;
    },
    []
  );
};

function calcPeriod(rules: TimelineNumberRuleItem[]): number {
  if (!rules[0]) {
    return 0;
  }

  return rules.reduce((acc, { rule }) => {
    let cycle = 0;

    if (rule.t === RuleType.RangeNumber) {
      cycle = rule.cycleSeconds * 2;
    } else if (rule.t === RuleType.StepNumber) {
      cycle = rule.transitions.reduce((m, r) => m + r.len, 0);
    }
    return lowestCommonMultiple(acc, (Math.round(cycle * 10) / 10) * 1000);
  }, 1);
}
