import { ReactNode, useState } from "react";
import {
  Vector2BSplineRule,
  createBSplineRuleFromPoints,
} from "@/shared/libs/numberRule";
import { useRuleData } from "./useRuleData";
import {
  defaultRenderGridRuler,
  Graph2DGrid,
  GraphBackgroundColor,
  GraphEdit,
  GraphViewportControls,
  PointsEdit,
} from "@/shared/ui/GraphEdit";
import { Graph2DLine } from "@/shared/ui/GraphEdit/Graph2DLine";
import { GraphValueHover } from "@/shared/ui/GraphEdit/GraphValueHover";
import { NewSplineRuleCreateToolbar } from "./NewSplineRuleCreateToolbar";
import { Stack } from "@mantine/core";
import { DefaultPoint } from "@/shared/ui/Points/DefaultPoint";
import { Vector2 } from "@/shared/libs/vectors";
import { HoverCrossPoint } from "@/shared/ui/Points/HoverCrossPoint";
import styles from "./NewSplineDraw.module.css";

export const NewSplineDraw = ({
  offset,
  axisRangeSizes,

  renderGraphMap,
  setViewport,
  onCancel,
  onApply,
  onValueHover,
}: {
  offset: Vector2;
  axisRangeSizes: Vector2;
  setViewport: (axisRangeSizes: Vector2, newOffset: Vector2) => void;
  renderGraphMap?: () => ReactNode;
  onCancel: () => void;
  onApply: (rule: Vector2BSplineRule) => void;
  onValueHover: (value: Vector2 | null) => void;
}) => {
  const [isPanning, setIsPanning] = useState(false);
  const [controls, setControls] = useState<Vector2[]>([]);
  const [currentControl, setCurrentControl] = useState<Vector2 | null>(null);
  const [mode, setMode] = useState<"addPoint" | "deletePoint" | "view">(
    "addPoint",
  );
  const fullControls = currentControl
    ? [...controls, currentControl]
    : controls;

  const rule =
    fullControls.length > 4
      ? createBSplineRuleFromPoints(1, fullControls)
      : null;

  const data = useRuleData(rule ?? undefined, 500);

  // Brigtly color only the segment that being influenced by new control point
  // Also dimly color the loop-back region
  const getSplineColor = (index: number, totalLength: number) => {
    if (mode !== "addPoint") {
      return "rgba(255, 100, 100, 0.8)";
    }

    if (!rule || controls.length === 0) {
      return "red";
    }

    const dimension = rule.dimension;
    const controlPointCount = controls.length;

    // Each control point influences 'dimension' segments
    // The last control point influences the last 'dimension' segments
    const segmentsPerPoint =
      totalLength / Math.max(controlPointCount - dimension + 1, 1);
    const influenceStart = Math.max(
      0,
      totalLength - segmentsPerPoint * dimension,
    );
    const loopBackStart = Math.max(0, totalLength - segmentsPerPoint);

    if (index >= loopBackStart) {
      return "rgba(255, 100, 100, 0.4)";
    }

    if (index >= influenceStart) {
      return "rgba(255, 100, 100, 0.8)";
    }
    return "rgba(255, 100, 100, 0.4)";
  };

  return (
    <Stack>
      <div className={styles.graphContainer}>
        <GraphEdit
          axisRangeSizes={axisRangeSizes}
          offset={offset}
          onClick={() => {
            if (!isPanning && currentControl) {
              setControls([...controls, [...currentControl]]);
            }
          }}
        >
          <GraphBackgroundColor color='black' />
          {renderGraphMap?.()}

          <Graph2DGrid renderRuler={defaultRenderGridRuler} />
          <GraphViewportControls
            onPanToggle={(isPanning) => {
              if (isPanning) {
                setIsPanning(isPanning);
              } else {
                setTimeout(() => {
                  setIsPanning(false);
                }, 50); // Slight delay to prevent adding point on keyup
              }
            }}
            onViewportChange={setViewport}
          />

          <Graph2DLine
            data={data.data}
            getColor={data.data.length > 0 ? getSplineColor : () => "red"}
          />
          <Graph2DLine
            data={fullControls}
            getColor={(i, len) => {
              if (mode !== "addPoint") {
                return `rgba(203, 203, 203, 0.8)`;
              }

              return `rgba(203, 203, 203, ${0.1 + 0.7 * Math.pow(i / len, 2)})`;
            }}
          />

          <GraphValueHover
            onHover={(value) => {
              onValueHover(value);
              if (!value || mode !== "addPoint") {
                setCurrentControl(null);
                return;
              }

              setCurrentControl(value);
            }}
          />

          <PointsEdit
            points={fullControls}
            renderPoint={(index) =>
              mode === "deletePoint" ? (
                <HoverCrossPoint />
              ) : (
                <div
                  style={{
                    opacity:
                      mode === "addPoint"
                        ? fullControls.length - index > 5
                          ? 0.4
                          : 1
                        : 1,
                  }}
                >
                  <DefaultPoint />
                </div>
              )
            }
            onPointMove={
              mode === "view"
                ? (index, newPos) => {
                    const newControls = [...controls];
                    newControls[index] = newPos;
                    setControls(newControls);
                  }
                : undefined
            }
            onPointClick={(index) => {
              if (mode === "deletePoint" && index < controls.length) {
                setControls(controls.filter((_, i) => i !== index));
                setMode("view");
              }
            }}
          />
        </GraphEdit>

        <NewSplineRuleCreateToolbar
          mode={mode}
          onExitCancel={onCancel}
          onExitApply={() => {
            if (rule) {
              onApply(rule);
            }
          }}
          onAddPointModeToggle={() => {
            setMode(mode === "addPoint" ? "view" : "addPoint");
          }}
          onDeletePointModeToggle={() => {
            setMode(mode === "deletePoint" ? "view" : "deletePoint");
          }}
          canApply={rule !== null}
        />
      </div>
    </Stack>
  );
};
