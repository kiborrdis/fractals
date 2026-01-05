import { useEffect, useMemo, useState } from "react";
import { Collapse, Stack } from "@mantine/core";
import styles from "./TimelineTool.module.css";
import { FloatingPanel as TimelineFloatingPanel } from "../../ui/FloatingPanel/FloatingPanel";
import { TimelineFloatingPanelContainer } from "./TimelineFloatingPanelContainer";
import { useActions } from "../../stores/editStore/data/useActions";
import { TimelineGraph } from "./TimelineGraph";
import { StepTransitionEdit } from "./StepTransitionEdit";
import { useCurrentTime } from "../../stores/editStore/data/useCurrentTime";
import { TimelineBaseRuleEdit } from "./TimelineBaseRuleEdit";
import { TimelineRulesList } from "./TimelineRulesList";
import { TimelineControls } from "./TimelineControls";
import { NumberBuildRule, RuleType } from "@/shared/libs/numberRule";
import {
  isNumberItem,
  TimelineNumberRuleItem,
  useDynamicNumberRules,
} from "../../stores/editStore/data/useTimelineRules";
import { calcPeriod } from "../../helpers/timelineUtils";
import { TimelineCollapseButton } from "./TimelineCollapseButton";

export const TimelineTool = () => {
  const [collapsed, setCollapsed] = useState(true);
  const [collapseEnded, setCollapseEnded] = useState(true);

  return (
    <>
      {
        <div className={styles.timelinePanel}>
          <TimelineFloatingPanel>
            <TimelineCollapseButton
              collapsed={collapsed}
              onClick={() => {
                setCollapseEnded(false);
                setTimeout(() => {
                  setCollapsed(false);
                }, 0);
              }}
            />
          </TimelineFloatingPanel>
        </div>
      }
      {(!collapsed || !collapseEnded) && (
        <div className={styles.timelineToolContent}>
          <TimelineToolInner
            collapsed={collapsed}
            onCollapseToggle={() => {
              if (!collapsed) {
                setCollapseEnded(false);
              }
              setCollapsed(!collapsed);
            }}
            onCollapseEnd={() => {
              setCollapseEnded(true);
            }}
          />
        </div>
      )}
    </>
  );
};

const TimelineToolInner = ({
  collapsed,
  onCollapseToggle,
  onCollapseEnd,
}: {
  onCollapseEnd: () => void;
  onCollapseToggle: () => void;
  collapsed: boolean;
}) => {
  const [disabledRangeIds, setDisabledRangeIds] = useState<
    Record<string, boolean>
  >({});
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [showRulesList, setShowRulesList] = useState(false);

  const time = useCurrentTime();

  const [editingStepIndex, setEditingStepIndex] = useState<number | null>(null);
  const [newStep, setNewStep] = useState<boolean>(false);
  const [previewValueOnHover, setPreviewValueOnHover] = useState<boolean>(true);
  const dynamicNumberRules = useDynamicNumberRules();

  const {
    dynamicParamOverride,
    customParamOverride,
    initialLoopStateChange,
    dynamicRuleChangeByRoute,
    customRuleChange,
  } = useActions();

  const changeRule = (route: string[], newRule: NumberBuildRule) => {
    if (route[0] === "d") {
      dynamicRuleChangeByRoute(route.slice(1), newRule);
      return;
    } else if (route[0] === "c") {
      customRuleChange(route.slice(1), newRule);
      return;
    }
  };

  const overrideRule = (route: string[], newValue: unknown) => {
    if (route[0] === "d") {
      dynamicParamOverride(route.slice(1), newValue);
      return;
    } else if (route[0] === "c") {
      customParamOverride(route.slice(1), newValue);
      return;
    }
  };

  const editingRule = useMemo(
    () =>
      dynamicNumberRules.find(
        (r): r is TimelineNumberRuleItem =>
          r.id === editingRuleId && isNumberItem(r),
      ),
    [dynamicNumberRules, editingRuleId],
  );

  const activeRules = useMemo(
    () => dynamicNumberRules.filter((rule) => !disabledRangeIds[rule.id]),
    [disabledRangeIds, dynamicNumberRules],
  );

  const [lockToPeriod, setLockToPeriod] = useState(true);
  const [visibleTo, setVisibleTo] = useState(0);

  const period = useMemo(() => calcPeriod(activeRules), [activeRules]);
  const fullPeriod = useMemo(
    () => calcPeriod(dynamicNumberRules),
    [dynamicNumberRules],
  );

  useEffect(() => {
    if (visibleTo > period || (lockToPeriod && visibleTo !== period)) {
      setVisibleTo(period);
    }
  }, [visibleTo, period, lockToPeriod]);

  return (
    <Stack className={styles.toolStack} bg='var(--mantine-color-body)'>
      {!collapsed && (
        <TimelineFloatingPanelContainer
          style={{
            position: "absolute",
            top: -8,
            left: 8,
            right: 0,
            transform: "translate(0, -100%)",
          }}
        >
          {showRulesList && (
            <TimelineFloatingPanel key='tracks' title='Tracks' w={250}>
              <TimelineRulesList
                disabledRangeIds={disabledRangeIds}
                editingRangeId={editingRuleId}
                numberRules={dynamicNumberRules}
                onRuleActivityChange={(id, newActive) =>
                  setDisabledRangeIds((old) => ({ ...old, [id]: !newActive }))
                }
                onRuleEditChange={(id) => {
                  setEditingRuleId(id);
                  setEditingStepIndex(null);
                }}
              />
            </TimelineFloatingPanel>
          )}

          {editingRule && (
            <TimelineFloatingPanel
              key='rule-edit'
              title={editingRule.name}
              w={300}
            >
              <TimelineBaseRuleEdit
                editingRule={editingRule?.rule ?? null}
                newStepActive={newStep}
                onNewStepClick={() => {
                  setNewStep((prev) => !prev);
                }}
                onRuleChange={(newRule) => {
                  if (editingRule) {
                    changeRule(editingRule.route, newRule);
                  }
                }}
              />
            </TimelineFloatingPanel>
          )}

          {editingStepIndex !== null &&
            editingRule &&
            editingRule.rule.t === RuleType.StepNumber && (
              <TimelineFloatingPanel
                key='step-transition'
                title='Step Transition'
                w={300}
              >
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

                    changeRule(editingRule.route, r0);
                  }}
                />
              </TimelineFloatingPanel>
            )}
        </TimelineFloatingPanelContainer>
      )}
      <Collapse
        in={!collapsed}
        transitionDuration={300}
        transitionTimingFunction='ease'
        onTransitionEnd={() => {
          if (collapsed) {
            onCollapseEnd();
          }
        }}
      >
        <Stack gap='xs' p='xs'>
          <Stack gap='xs'>
            <TimelineControls
              collapsed={collapsed}
              onCollapseToggle={onCollapseToggle}
              showRulesList={showRulesList}
              onToggleRulesList={() => setShowRulesList((v) => !v)}
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
                    overrideRule(r.route, undefined);
                  });
                }
              }}
              onDynamicParamOverride={(v) => {
                if (previewValueOnHover) {
                  v.forEach((val, i) => {
                    if (
                      activeRules[i].kind === "vector2" &&
                      Array.isArray(val)
                    ) {
                      overrideRule(activeRules[i].route, val);
                      return;
                    } else if (
                      activeRules[i].kind === "number" &&
                      typeof val === "number"
                    ) {
                      overrideRule(activeRules[i].route, val);
                      return;
                    }

                    console.error(
                      "Invalid override value",
                      val,
                      "for timeline item",
                      activeRules[i].route.join("."),
                      "with type",
                      activeRules[i].kind,
                    );
                  });
                }
              }}
              onStepSelect={(stepIndex) => {
                setEditingStepIndex((prev) =>
                  prev === stepIndex ? null : stepIndex,
                );
              }}
              onChange={(newRule) => {
                if (editingRule && isNumberItem(editingRule)) {
                  changeRule(editingRule.route, newRule);
                }
              }}
            />
          </Stack>
        </Stack>
      </Collapse>
    </Stack>
  );
};
