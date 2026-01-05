import {
  moveControlPointInBSpline,
  Vector2BSplineRule,
  addControlPointToSpline,
  deleteControlPointFromSpline,
} from "@/shared/libs/numberRule";
import { useRuleData } from "./useRuleData";
import {
  Graph2DGrid,
  GraphBackgroundColor,
  GraphEdit,
  GraphViewportControls,
  PointsEdit,
} from "@/shared/ui/GraphEdit";
import { useViewport } from "./useViewport";
import { GraphValueHover } from "@/shared/ui/GraphEdit/GraphValueHover";
import { Graph2DLine } from "@/shared/ui/GraphEdit/Graph2DLine";
import { AddPointHoverSpline } from "./AddPointHoverSpline";
import { SplineToolbar } from "./SplineToolbar";
import { NewSplineDraw } from "./NewSplineDraw";
import { ReactNode, useState } from "react";
import { DefaultPoint } from "@/shared/ui/Points/DefaultPoint";
import { Stack, Group } from "@mantine/core";
import { Label } from "@/shared/ui/Label/Label";
import { EditorNumberInput } from "@/shared/ui/EditorNumberInput";
import { Vector2 } from "@/shared/libs/vectors";
import { GraphSplinePositionIndicator } from "./GraphSplinePositionIndicator";
import { HoverCrossPoint } from "@/shared/ui/Points/HoverCrossPoint";
import { defaultRenderGridRuler } from "@/shared/ui/GraphEdit/Graph2DGrid";
import styles from "./SplineRuleEdit.module.css";

const getSplineColor = () => {
  return "yellow";
};

const getControlLineColor = () => {
  return "rgba(203, 203, 203, 0.7)";
};

export const SplineRuleEdit = ({
  rule,
  label,
  renderGraphMap,
  renderGraphMapEdit,
  onChange,
  onPreview,
}: {
  rule: Vector2BSplineRule;
  label?: string;
  renderGraphMap?: () => ReactNode;
  renderGraphMapEdit?: (params: {
    offset: Vector2;
    axisRangeSizes: Vector2;
    setViewport: (axisRangeSizes: Vector2, newOffset: Vector2) => void;
    onExit: () => void;
  }) => ReactNode;
  onChange: (newRule: Vector2BSplineRule) => void;
  onPreview?: (value: [number, number] | undefined) => void;
}) => {
  const { offset, axisRangeSizes, setViewport } = useViewport(rule);
  const data = useRuleData(rule, 500);
  const [mode, setMode] = useState<"view" | "addPoint" | "deletePoint">("view");
  const [previewValueMode, setPreviewValueMode] = useState(true);
  const [drawMode, setDrawMode] = useState(false);
  const [mapEditMode, setMapEditMode] = useState(false);

  const previewValue = (value: Vector2 | null) => {
    if (!value) {
      onPreview?.(undefined);
      return;
    }

    onPreview?.([value[0], value[1]]);
  };

  if (drawMode) {
    return (
      <Stack gap='xs' align='stretch'>
        {label && <Label>{label}</Label>}
        <NewSplineDraw
          offset={offset}
          axisRangeSizes={axisRangeSizes}
          setViewport={setViewport}
          renderGraphMap={renderGraphMap}
          onValueHover={previewValue}
          onCancel={() => setDrawMode(false)}
          onApply={(newRule) => {
            onChange({ ...newRule, period: rule.period });
            setDrawMode(false);
          }}
        />
      </Stack>
    );
  }

  if (renderGraphMapEdit && mapEditMode) {
    return (
      <Stack gap='xs' align='stretch'>
        {label && <Label>{label}</Label>}
        {renderGraphMapEdit({
          offset,
          axisRangeSizes,
          setViewport,
          onExit: () => setMapEditMode(false),
        })}
      </Stack>
    );
  }

  return (
    <Stack gap='xs' align='stretch'>
      {label && <Label>{label}</Label>}

      <div className={styles.graphContainer}>
        <GraphEdit axisRangeSizes={axisRangeSizes} offset={offset}>
          <GraphBackgroundColor color='black' />
          {renderGraphMap?.()}
          <Graph2DGrid renderRuler={defaultRenderGridRuler} />
          <Graph2DLine
            data={data.data}
            lineWidth={2}
            getColor={getSplineColor}
          />

          <Graph2DLine
            lineWidth={1.3}
            data={[...rule.controls, rule.controls[0]]}
            getColor={getControlLineColor}
          />
          <GraphViewportControls onViewportChange={setViewport} />
          {previewValueMode && mode !== "addPoint" && (
            <GraphValueHover onHover={previewValue} />
          )}
          {mode === "addPoint" && (
            <AddPointHoverSpline
              controlPoints={rule.controls}
              onAddStep={(segmentIndex, newPoint) => {
                onChange(addControlPointToSpline(rule, segmentIndex, newPoint));
                setMode("view");
              }}
            />
          )}

          <PointsEdit
            points={rule.controls}
            renderPoint={() =>
              mode === "deletePoint" ? <HoverCrossPoint /> : <DefaultPoint />
            }
            onPointMove={
              mode === "view"
                ? (index, newPos) => {
                    onChange(moveControlPointInBSpline(rule, index, newPos));
                  }
                : undefined
            }
            onPointClick={(index) => {
              if (mode === "deletePoint") {
                onChange(deleteControlPointFromSpline(rule, index));
                setMode("view");
              }
            }}
          />

          <GraphSplinePositionIndicator rule={rule} />
        </GraphEdit>

        <SplineToolbar
          mode={mode}
          canEditMap={!!renderGraphMapEdit}
          previewValueMode={previewValueMode}
          onPreviewValueModeToggle={() =>
            setPreviewValueMode(!previewValueMode)
          }
          onAddPointModeToggle={() => {
            setMode(mode === "addPoint" ? "view" : "addPoint");
          }}
          onDeletePointModeToggle={() => {
            setMode(mode === "deletePoint" ? "view" : "deletePoint");
          }}
          onDrawModeToggle={() => setDrawMode(true)}
          onMapEditModeToggle={() => setMapEditMode(true)}
        />
      </div>

      <Group gap='xs' align='center' justify='space-between'>
        <Label size='xs'>Period (s)</Label>
        <EditorNumberInput
          value={rule.period}
          step={0.1}
          min={0.1}
          onChange={(newPeriod) => {
            onChange({ ...rule, period: newPeriod });
          }}
        />
      </Group>
    </Stack>
  );
};
