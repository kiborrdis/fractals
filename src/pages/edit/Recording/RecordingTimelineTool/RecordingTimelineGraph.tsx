import { useCallback, useMemo } from "react";
import {
  TimelineItem,
  TimelineVector2Item,
  isNumberItem,
} from "../../stores/editStore/data/useTimelineRules";
import {
  makeArrayFromRules,
  makeNumberFromRangeRule,
} from "@/shared/libs/numberRule";
import { Vector2 } from "@/shared/libs/vectors";
import {
  GraphEdit,
  GraphBackgroundColor,
  Graph2DGrid,
  Graph2DLine,
  GraphValueHover,
} from "@/shared/ui/GraphEdit";
import { TimelineCursor } from "../../ui/TimelineCursor";
import { RecordingRangeOverlay } from "./RecordingRangeOverlay";
import {
  useTimelineGraphData,
  useTimelineVector2GraphData,
} from "../../helpers/timelineUtils";
import { TimelineVector2Line } from "../../ui/TimelineVector2Line";
import styles from "./RecordingTimelineGraph.module.css";

export const RecordingTimelineGraph = ({
  rules,
  period,
  displayTime,
  recordStartTime,
  recordDuration,
  onDynamicParamOverride,
  onDynamicParamOverrideReset,
}: {
  rules: TimelineItem[];
  period: number;
  displayTime: number;
  recordStartTime: number;
  recordDuration: number;
  onDynamicParamOverride: (vals: Array<number | [number, number]>) => void;
  onDynamicParamOverrideReset: () => void;
}) => {
  const axisRangeSizes: Vector2 = [period, 2.2];
  const offset: Vector2 = [-period / 2, 0];

  const numberRules = useMemo(() => rules.filter(isNumberItem), [rules]);
  const vector2Rules = useMemo(
    () => rules.filter((r): r is TimelineVector2Item => r.kind === "vector2"),
    [rules],
  );

  const lineData = useTimelineGraphData(numberRules, period);
  const vector2LineData = useTimelineVector2GraphData(vector2Rules, period);

  const handleHover = useCallback(
    (value: Vector2 | null) => {
      if (!value) {
        onDynamicParamOverrideReset();
        return;
      }

      const time = value[0];

      if (rules.length > 0) {
        onDynamicParamOverride(
          rules.map((item): number | [number, number] => {
            if (item.kind === "number") {
              return makeNumberFromRangeRule(item.rule, time);
            }
            return makeArrayFromRules(item.rule, time) as [number, number];
          }),
        );
      }
    },
    [rules, onDynamicParamOverride, onDynamicParamOverrideReset],
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
          <Graph2DGrid xCellSize={100} centerAxis={false} />
        )}

        <RecordingRangeOverlay
          startTime={recordStartTime}
          endTime={recordStartTime + recordDuration}
          period={period}
        />

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

        {displayTime !== undefined && displayTime !== null && (
          <TimelineCursor time={displayTime % period} />
        )}

        <GraphValueHover onHover={handleHover} onClick={() => {}} />
      </GraphEdit>
    </div>
  );
};
