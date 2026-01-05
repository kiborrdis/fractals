import { useMemo, useState, useCallback } from "react";
import {
  isNumberItem,
  TimelineItem,
} from "../../stores/editStore/data/useTimelineRules";
import {
  addNewStepToRule,
  makeArrayFromRules,
  makeNumberFromRangeRule,
  moveRuleStep,
  RangeNumberRule,
  RuleType,
  StepNumberRule,
} from "@/shared/libs/numberRule";
import { Vector2 } from "@/shared/libs/vectors";
import {
  GraphEdit,
  GraphBackgroundColor,
  Graph2DGrid,
  Graph2DLine,
  PointsEdit,
  GridCellRuler,
  GraphValueHover,
} from "@/shared/ui/GraphEdit";
import { TimelineCursor } from "../../ui/TimelineCursor";
import { TimelineStepRanges } from "./TimelineStepRanges";
import { TimelineNewStepIndicator } from "./TimelineNewStepIndicator";
import {
  useTimelineGraphData,
  useTimelineVector2GraphData,
} from "../../helpers/timelineUtils";
import { TimelineVector2Line } from "../../ui/TimelineVector2Line";
import { RenderGridRulerFn } from "@/shared/ui/GraphEdit/Graph2DGrid";
import styles from "./TimelineGraph.module.css";

const formatTime = (ms: number) => {
  const time = ms / 1000;
  const roundedTime = Math.round(time);
  const seconds = time % 60;
  const minutes = Math.floor(roundedTime / 60) % 60;
  const hours = Math.floor(roundedTime / 3600);
  const parts: string[] = [];
  if (hours > 0) {
    parts.push(`${String(hours).padStart(2, "0")}h`);
  }
  if (minutes > 0 || hours > 0) {
    parts.push(`${String(minutes).padStart(2, "0")}m`);
  }

  if (seconds > 0) {
    parts.push(`${String(seconds.toFixed(1)).padStart(2, "0")}s`);
  }

  return parts.join(" ");
};

const renderRuler: RenderGridRulerFn = (xPixelSizes, _, XValueSizes) => {
  return (
    <GridCellRuler
      xPixelSizes={xPixelSizes}
      xValueSizes={XValueSizes}
      formatValue={formatTime}
    />
  );
};

export const TimelineGraph = ({
  newStepModeActive,
  editingId,
  selectedEditStep,
  rules,
  visibleTo,
  displayTime,
  onClick,
  onChange,
  onStepSelect,
  onDynamicParamOverride,
  onDynamicParamOverrideReset,
  onStepCreateEnd,
}: {
  newStepModeActive?: boolean;
  editingId?: string | null;
  selectedEditStep?: number;
  visibleTo: number;
  displayTime?: number;
  rules: TimelineItem[];
  onClick?: (time: number) => void;
  onStepCreateEnd?: () => void;
  onStepSelect: (index: number) => void;
  onChange?: (rule: RangeNumberRule | StepNumberRule) => void;
  onDynamicParamOverride: (vals: Array<number | [number, number]>) => void;
  onDynamicParamOverrideReset: () => void;
}) => {
  const period = visibleTo;
  const [newStepTime, setNewStepTime] = useState<number | null>(null);

  const numberRules = useMemo(() => rules.filter(isNumberItem), [rules]);
  const vector2Rules = useMemo(
    () =>
      rules.filter(
        (r): r is (typeof rules)[number] & { kind: "vector2" } =>
          r.kind === "vector2",
      ),
    [rules],
  );

  // Only number items can be edited — guard against vector2 ids
  const editRule = useMemo(
    () => (editingId ? numberRules.find((r) => r.id === editingId) : undefined),
    [editingId, numberRules],
  );

  const axisRangeSizes = useMemo<Vector2>(() => {
    return [period, 2.2];
  }, [period]);

  const offset = useMemo<Vector2>(() => {
    return [-period / 2, 0];
  }, [period]);

  const lineData = useTimelineGraphData(numberRules, period);
  const vector2LineData = useTimelineVector2GraphData(vector2Rules, period);

  // Get step points for editing
  const stepPoints = useMemo<Vector2[]>(() => {
    if (!editRule || editRule.rule.t !== RuleType.StepNumber) {
      return [];
    }

    const points: Vector2[] = [];
    let startTime = 0;

    const rule = editRule.rule;
    rule.steps.forEach((stepValue, i) => {
      // Map step value (0-1) to display space (-1, 1)
      const displayValue = stepValue * 2 - 1;
      points.push([startTime, displayValue]);
      startTime += rule.transitions[i].len * 1000;
    });

    return points;
  }, [editRule]);

  // Step ranges for highlighting
  const stepRanges = useMemo(() => {
    if (!editRule || editRule.rule.t !== RuleType.StepNumber) {
      return [];
    }

    const ranges: {
      start: number;
      end: number;
      index: number;
      selected: boolean;
    }[] = [];
    let startTime = 0;

    editRule.rule.transitions.forEach((t, idx) => {
      const endTime = startTime + t.len * 1000;
      ranges.push({
        start: startTime,
        end: endTime,
        index: idx,
        selected: selectedEditStep === idx,
      });
      startTime = endTime;
    });

    return ranges;
  }, [editRule, selectedEditStep]);

  const handlePointMove = useCallback(
    (index: number, newPos: Vector2) => {
      if (!editRule || editRule.rule.t !== RuleType.StepNumber || !onChange) {
        return;
      }

      // newPos[0] is time in ms, newPos[1] is value in display space (-1, 1)
      // Convert display value back to step value (0-1)
      const newValue = (newPos[1] + 1) / 2;
      const time = newPos[0];

      const newRule = moveRuleStep(editRule.rule, index, time, newValue);

      onChange(newRule);
    },
    [editRule, onChange],
  );

  const handleHover = useCallback(
    (value: Vector2 | null) => {
      if (!value) {
        onDynamicParamOverrideReset();
        if (newStepModeActive) {
          setNewStepTime(null);
        }
        return;
      }

      const time = value[0];

      if (newStepModeActive) {
        setNewStepTime(time);
      }

      if (rules.length > 0) {
        onDynamicParamOverride(
          rules.map((item): number | [number, number] => {
            if (item.kind === "number") {
              return makeNumberFromRangeRule(item.rule, time);
            }
            return makeArrayFromRules(item.rule, time);
          }),
        );
      }
    },
    [
      rules,
      onDynamicParamOverride,
      onDynamicParamOverrideReset,
      newStepModeActive,
    ],
  );

  const handleClick = useCallback(
    ([time]: Vector2) => {
      if (newStepModeActive) {
        if (!editRule || editRule.rule.t !== RuleType.StepNumber) {
          onStepCreateEnd?.();
          setNewStepTime(null);
          return;
        }
        const newRule = addNewStepToRule(editRule.rule, time);
        onChange?.(newRule);
        onStepCreateEnd?.();
        setNewStepTime(null);
        return;
      }

      onClick?.(time);
    },
    [newStepModeActive, editRule, onChange, onStepCreateEnd, onClick],
  );
  return (
    <div className={styles.graphContainer}>
      <GraphEdit
        mappingMode='fill'
        axisRangeSizes={axisRangeSizes}
        offset={offset}
      >
        <GraphBackgroundColor color='black' />
        {(lineData.length !== 0 || vector2LineData.length !== 0) && (
          <Graph2DGrid
            xCellSize={100}
            centerAxis={false}
            renderRuler={renderRuler}
          />
        )}

        {lineData.map(({ data, color }, index) => (
          <Graph2DLine
            key={index}
            data={data}
            lineWidth={2}
            getColor={() => color}
          />
        ))}

        {vector2LineData.map(({ data, color }, index) => (
          <TimelineVector2Line key={`v2-${index}`} data={data} color={color} />
        ))}

        {!newStepModeActive && stepRanges.length > 0 && (
          <TimelineStepRanges
            ranges={stepRanges}
            onRangeClick={(index) => onStepSelect(index)}
          />
        )}

        {displayTime !== undefined && displayTime !== null && (
          <TimelineCursor time={displayTime} />
        )}

        <GraphValueHover onHover={handleHover} onClick={handleClick} />

        {newStepModeActive && newStepTime !== null && (
          <TimelineNewStepIndicator time={newStepTime} />
        )}

        {editRule && editRule.rule.t === RuleType.StepNumber && (
          <PointsEdit points={stepPoints} onPointMove={handlePointMove} />
        )}
      </GraphEdit>
    </div>
  );
};
