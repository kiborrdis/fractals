import {
  NumberBuildRule,
  RuleType,
  StaticNumberRule,
  calcRulePeriod,
  makeScalarFromRule,
} from "@/shared/libs/numberRule";
import { Vector2 } from "@/shared/libs/vectors";
import { useState, useCallback, useMemo, ReactNode } from "react";
import { useViewport } from "./useViewport";
import {
  Graph2DGrid,
  GraphBackgroundColor,
  GraphEdit,
  GraphViewportControls,
  Graph2DLine,
  GraphValueHover,
  GraphValueClick,
  PointsEdit,
  defaultRenderGridRuler,
} from "@/shared/ui/GraphEdit";
import { GraphToolbar } from "./GraphToolbar";
import { lowestCommonMultiple } from "@/shared/libs/numbers";
import styles from "./GraphDimsRuleEdit.module.css";

const NUM_OF_POINTS = 1000;

const isStaticRule = (rule: NumberBuildRule): rule is StaticNumberRule => {
  return rule.t === RuleType.StaticNumber;
};

const getStaticValue = (rule: NumberBuildRule): number => {
  if (rule.t === RuleType.StaticNumber) {
    return rule.value;
  }
  return 0;
};

export const GraphDimsRuleEdit = ({
  name,
  value,
  renderGraphMap,
  renderGraphMapEdit,
  onPreview,
  onChange,
}: {
  name: string;
  value: [NumberBuildRule, NumberBuildRule];
  renderGraphMap?: () => ReactNode;
  renderGraphMapEdit?: (params: {
    offset: Vector2;
    axisRangeSizes: Vector2;
    setViewport: (axisRangeSizes: Vector2, newOffset: Vector2) => void;
    onExit: () => void;
  }) => ReactNode;
  onPreview?: (name: string, value: [number, number] | undefined) => void;
  onChange: (name: string, value: [NumberBuildRule, NumberBuildRule]) => void;
}) => {
  const [previewMode, setPreviewMode] = useState(true);
  const [mapEditMode, setMapEditMode] = useState(false);
  const { axisRangeSizes, offset, setViewport } = useViewport(value);
  const bothStatic = isStaticRule(value[0]) && isStaticRule(value[1]);

  // Generate path data if at least one rule is not static
  const pathData = useMemo(() => {
    if (bothStatic) {
      return null;
    }

    const period0 = !isStaticRule(value[0]) ? calcRulePeriod(value[0]) : 0;
    const period1 = !isStaticRule(value[1]) ? calcRulePeriod(value[1]) : 0;

    const sharedPeriod =
      period0 && period1
        ? lowestCommonMultiple(period0, period1)
        : period0 || period1;

    const points: Vector2[] = [];
    for (let i = 0; i < NUM_OF_POINTS; i++) {
      const t = sharedPeriod * (i / (NUM_OF_POINTS - 1));
      const x = makeScalarFromRule(value[0], t);
      const y = makeScalarFromRule(value[1], t);
      points.push([x, y]);
    }
    return points;
  }, [value, bothStatic]);

  const staticPoint = useMemo<Vector2[]>(() => {
    if (!bothStatic) {
      return [];
    }
    return [[getStaticValue(value[0]), getStaticValue(value[1])]];
  }, [value, bothStatic]);

  const handleHover = useCallback(
    (valueSpaceCoord: Vector2 | null) => {
      if (!previewMode || !onPreview) {
        return;
      }

      if (!valueSpaceCoord) {
        onPreview(name, undefined);
        return;
      }

      onPreview(name, [valueSpaceCoord[0], valueSpaceCoord[1]]);
    },
    [name, onPreview, previewMode],
  );

  const handleClick = useCallback(
    (valueSpaceCoord: Vector2) => {
      onChange(name, [
        {
          t: RuleType.StaticNumber,
          value: valueSpaceCoord[0],
        },
        {
          t: RuleType.StaticNumber,
          value: valueSpaceCoord[1],
        },
      ]);
    },
    [name, onChange],
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
    <div className={styles.graphContainer}>
      <GraphEdit axisRangeSizes={axisRangeSizes} offset={offset}>
        <GraphBackgroundColor color='black' />
        {renderGraphMap?.()}
        <Graph2DGrid renderRuler={defaultRenderGridRuler} />

        {pathData && (
          <Graph2DLine
            data={pathData}
            getColor={() => "rgba(255, 255, 0, 0.3)"}
            lineWidth={2}
          />
        )}

        {bothStatic && <PointsEdit points={staticPoint} />}

        <GraphViewportControls onViewportChange={setViewport} />

        {previewMode && onPreview && <GraphValueHover onHover={handleHover} />}

        {bothStatic && <GraphValueClick onClick={handleClick} />}
      </GraphEdit>

      <GraphToolbar
        previewMode={previewMode}
        canEditMap={!!renderGraphMapEdit}
        onPreviewModeToggle={() => setPreviewMode(!previewMode)}
        onMapEditModeToggle={() => setMapEditMode(true)}
      />
    </div>
  );
};
