import { useEffect, useMemo, useRef, useState } from "react";
import { Graph } from "../Graph/Graph";
import {
  HighlightedRange,
  HighlightedRangeItem,
} from "../Graph/HighlightedRangeItem";
import { useDrag } from "@/shared/hooks/useDrag";
import { TimelineNumberRuleItem } from "./TimelineTool";
import {
  addNewStepToRule,
  makeNumberFromRangeRule,
  moveRuleStep,
  RangeNumberRule,
  RuleType,
  StepNumberRule,
} from "@/shared/libs/numberRule";
import { Vector2 } from "@/shared/libs/vectors";

const calcPercent = (event: React.MouseEvent<HTMLElement>, width: number) => {
  const rect = event.currentTarget.getBoundingClientRect();
  const x = event.clientX - rect.left;
  return x / width;
};

const GRAPH_HEIGHT = 150;

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
  rules: TimelineNumberRuleItem[];
  onClick?: (time: number) => void;
  onStepCreateEnd?: () => void;
  onStepSelect: (index: number) => void;
  onChange?: (rule: RangeNumberRule | StepNumberRule) => void;
  onDynamicParamOverride: (vals: number[]) => void;
  onDynamicParamOverrideReset: () => void;
}) => {
  const time = displayTime;
  const [width, setWidth] = useState<number | null>(null);
  const [newStepCoord, setNewStepCoord] = useState<Vector2 | null>(null);
  const period = visibleTo;

  const data: [number[], string][] = useMemo(() => {
    if (!width || rules.length === 0) {
      return [];
    }

    const allData: [number[], string][] = [];

    for (let i = 0; i < rules.length; i++) {
      const rule = rules[i].rule;
      const ruleToCalc = { ...rule, range: [-1, 1] as Vector2 };

      const msPerPixel = period / width;

      const newData: number[] = [];

      for (let i = 0; i < Math.floor(width); i++) {
        newData.push(makeNumberFromRangeRule(ruleToCalc, i * msPerPixel));
      }

      allData.push([newData, rules[i].color]);
    }
    return allData;
  }, [width, rules, period]);
  const msPerPixel = width ? period / width : 0;
  const highlightedRanges: HighlightedRange[] = [];
  const editRule = editingId
    ? rules.find((rule) => rule.id === editingId)?.rule
    : undefined;

  if (width && editRule && editRule.t === RuleType.StepNumber) {
    let startTime = 0;
    editRule.transitions.map((t, idx) => {
      const endTime = startTime + t.len * 1000;
      const startX = startTime / msPerPixel;
      const endX = endTime / msPerPixel;

      highlightedRanges.push({
        rangeId: String(idx),
        start: startX,
        end: endX,
        color: "transparent",
      });

      if (selectedEditStep === idx) {
        highlightedRanges[highlightedRanges.length - 1].color =
          "rgba(255, 255, 0, 0.1)";
      }

      startTime = endTime;
    });
  }

  const getHighlightedRangePositions = (
    zoomLevel: number = 1,
    dataOffset: number = 0,
  ) => {
    if (!highlightedRanges.length || !data.length || !width) return [];

    const effectiveWidth = Math.floor(width / zoomLevel);
    const startIndex = Math.max(
      0,
      data.length - effectiveWidth + (dataOffset || 0),
    );

    return highlightedRanges.map((range, index) => {
      const pixelStart = (range.start - startIndex) * zoomLevel;
      const pixelEnd = (range.end - startIndex) * zoomLevel;
      return { range, index, pixelStart, pixelEnd };
    });
  };

  const rangePositions = getHighlightedRangePositions();
  const leftRef = useRef<number>(0);
  const topRef = useRef<number>(0);
  const graphContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => {
      if (graphContainerRef.current) {
        setWidth(graphContainerRef.current.clientWidth);
      }
    };

    const observer = new ResizeObserver(handleResize);
    if (graphContainerRef.current) {
      observer.observe(graphContainerRef.current);
    }

    handleResize();
    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={graphContainerRef}
      style={{
        position: "relative",
        height: GRAPH_HEIGHT,
      }}
    >
      {width && (
        <Graph
          cursorX={time ? time / msPerPixel : undefined}
          width={width}
          height={GRAPH_HEIGHT}
          max={1.1}
          data={data}
        />
      )}

      {width && (
        <div
          ref={(el) => {
            if (el) {
              const bound = el.getBoundingClientRect();
              leftRef.current = bound.left;
              topRef.current = bound.top;
            }
          }}
          onClick={(e) => {
            const perc = calcPercent(e, width);

            if (newStepModeActive) {
              if (!editRule || editRule.t !== RuleType.StepNumber) {
                onStepCreateEnd?.();
                setNewStepCoord(null);
                return;
              }
              const newRule = addNewStepToRule(editRule, perc * period);

              onChange?.(newRule);
              onStepCreateEnd?.();
              setNewStepCoord(null);

              return;
            }

            onClick?.(perc * period);
          }}
          onMouseMove={(event: React.MouseEvent<HTMLDivElement>) => {
            const perc = calcPercent(event, width);

            if (newStepModeActive) {
              setNewStepCoord([perc * width, 0]);
            }

            if (rules.length > 0) {
              onDynamicParamOverride(
                rules.map((rule) =>
                  makeNumberFromRangeRule(rule.rule, perc * period),
                ),
              );
            }
          }}
          onMouseLeave={() => {
            if (onStepCreateEnd && newStepModeActive) {
              onStepCreateEnd();
              setNewStepCoord(null);
            }

            onDynamicParamOverrideReset();
          }}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 2,
          }}
        >
          {newStepModeActive && newStepCoord && (
            <div
              style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                width: 1,
                left: newStepCoord[0],
                borderLeft: "1px dashed pink",
              }}
            />
          )}
          {!newStepModeActive &&
            rangePositions.map(({ range, index, pixelStart, pixelEnd }) => (
              <HighlightedRangeItem
                key={`highlight-${index}`}
                range={range}
                pixelStart={pixelStart}
                pixelEnd={pixelEnd}
                width={width}
                height={GRAPH_HEIGHT}
                onRangeClick={() => {
                  onStepSelect(Number(range.rangeId));
                }}
              />
            ))}
          {editRule &&
            editRule.t === RuleType.StepNumber &&
            (() => {
              let start = 0;
              return editRule.steps.map((s, i) => {
                const content = (
                  <Point
                    key={i}
                    onPositionChange={(pos) => {
                      const newRule = moveRuleStep(
                        editRule,
                        i,
                        (pos[0] - leftRef.current) * msPerPixel,
                        (pos[1] - topRef.current) / GRAPH_HEIGHT,
                      );

                      onChange?.(newRule);
                      return;
                    }}
                    top={GRAPH_HEIGHT * s}
                    left={(start * 1000) / msPerPixel}
                  />
                );

                start += editRule.transitions[i].len;

                return content;
              });
            })()}
        </div>
      )}
    </div>
  );
};

const Point = ({
  left,
  top,
  onPositionChange,
}: {
  left: number;
  top: number;
  onPositionChange: (pos: Vector2) => void;
}) => {
  const { elementHandlers } = useDrag({
    canStartDrag: true,
    onDragMove: (pos) => {
      if (onPositionChange) {
        onPositionChange(pos);
      }
    },
  });
  return (
    <div
      {...elementHandlers}
      draggable={false}
      style={{
        position: "absolute",
        padding: 10,
        top: top,
        left: left,
        transform: "translate(-50%, -50%)",
        cursor: "grab",
        pointerEvents: "all",
        opacity: 1,
        zIndex: 2,
      }}
    >
      <div
        style={{
          height: 6,
          width: 6,
          backgroundColor: `pink`,

          borderRadius: 3,
        }}
      />
    </div>
  );
};
