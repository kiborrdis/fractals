import {
  NVectorStepRule,
  StaticNumberRule,
  addStepToVectorRule,
  moveVectorRuleStep,
  normalizeStepLenBasedOnDistance,
} from "@/shared/libs/numberRule";
import { Vector2 } from "@/shared/libs/vectors";
import { Stack } from "@mantine/core";
import { useState, useCallback, ReactNode } from "react";
import { VecStepTransitionEdit } from "./VecStepTransitionEdit";
import { useGraphColor } from "./useGraphColor";
import { useRuleData } from "./useRuleData";
import { useViewport } from "./useViewport";
import {
  Graph2DGrid,
  GraphBackgroundColor,
  GraphEdit,
  GraphViewportControls,
  Graph2DLine,
  defaultRenderGridRuler,
} from "@/shared/ui/GraphEdit";
import { StepPointsEdit } from "./StepPointsEdit";
import { AddPointHover } from "./AddPointHover";
import { GraphToolbar } from "./GraphToolbar";
import styles from "./Vector2StepRuleEdit.module.css";

const NUM_OF_POINTS = 1000;

export const Vector2StepRuleEdit = ({
  name,
  value,
  renderGraphMap,
  renderGraphMapEdit,
  onChange,
  onPreview,
}: {
  name: string;
  value: NVectorStepRule<2>;
  renderGraphMap?: () => ReactNode;
  renderGraphMapEdit?: (params: {
    offset: Vector2;
    axisRangeSizes: Vector2;
    setViewport: (axisRangeSizes: Vector2, newOffset: Vector2) => void;
    onExit: () => void;
  }) => ReactNode;
  onPreview?: (name: string, value: [number, number] | undefined) => void;
  onChange: (
    name: string,
    value: NVectorStepRule<2> | [StaticNumberRule, StaticNumberRule],
  ) => void;
}) => {
  const [mode, setMode] = useState<"view" | "addPoint">("view");
  const [mapEditMode, setMapEditMode] = useState(false);
  const { axisRangeSizes, offset, setViewport } = useViewport(value);

  const [selectedStepIndex, setSelectedStepIndex] = useState<number | null>(
    null,
  );
  const selectedTransitionIndex =
    selectedStepIndex !== null && selectedStepIndex < value.transitions.length
      ? selectedStepIndex
      : null;

  const { data, quant } = useRuleData(value, NUM_OF_POINTS);
  const getColor = useGraphColor({
    quant,
    rule: value,
    selectedStepIndex,
  });

  const handleHover = useCallback(
    (valueSpaceCoord: Vector2 | null) => {
      if (!valueSpaceCoord) {
        onPreview?.(name, undefined);
        return;
      }

      onPreview?.(name, [valueSpaceCoord[0], valueSpaceCoord[1]]);
    },
    [onPreview, name],
  );

  if (renderGraphMapEdit && mapEditMode) {
    return renderGraphMapEdit({
      offset,
      axisRangeSizes,
      setViewport,
      onExit: () => setMapEditMode(false),
    });
  }

  return (
    <Stack>
      <div className={styles.graphContainer}>
        <GraphEdit axisRangeSizes={axisRangeSizes} offset={offset}>
          <GraphBackgroundColor color='black' />
          {renderGraphMap?.()}
          <Graph2DGrid renderRuler={defaultRenderGridRuler} />
          <Graph2DLine data={data} getColor={getColor} />
          <GraphViewportControls onViewportChange={setViewport} />
          <AddPointHover
            data={data}
            mode={mode}
            onAddStep={(cutIndex) => {
              onChange(name, addStepToVectorRule(value, cutIndex * quant));
              setMode("view");
            }}
            onHover={handleHover}
            onHoverLeave={() => handleHover(null)}
          />
          <StepPointsEdit
            points={value.steps as Vector2[]}
            selectedIndex={selectedStepIndex}
            mode={mode}
            onMoveStep={(index, newPos) => {
              onChange(name, moveVectorRuleStep(value, index, newPos));
            }}
            onSelectStep={setSelectedStepIndex}
          />
        </GraphEdit>

        <GraphToolbar
          mode={mode}
          canEditMap={!!renderGraphMapEdit}
          onModeToggle={() => {
            setMode(mode === "addPoint" ? "view" : "addPoint");
          }}
          onNormalize={() => {
            onChange(name, normalizeStepLenBasedOnDistance(value));
          }}
          onMapEditModeToggle={() => setMapEditMode(true)}
        />
      </div>
      {selectedTransitionIndex !== null && (
        <VecStepTransitionEdit
          transition={value.transitions[selectedTransitionIndex]}
          onChange={(newTransition) => {
            const newTransitions = [...value.transitions];
            newTransitions[selectedTransitionIndex] = newTransition;
            onChange(name, {
              ...value,
              transitions: newTransitions,
            });
          }}
        />
      )}
    </Stack>
  );
};
