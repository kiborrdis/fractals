import { FractalTrap } from "@/features/fractals";
import { makeArrayFromRules } from "@/shared/libs/numberRule";
import { Vector2 } from "@/shared/libs/vectors";
import {
  GraphEdit,
  GraphBackgroundColor,
  GraphSelectArea,
  GraphViewportControls,
} from "@/shared/ui/GraphEdit";
import { useState, useMemo, useCallback } from "react";
import { FractalViewportToolbar } from "./FractalViewportToolbar";
import { useActions } from "../../stores/editStore/data/useActions";
import { useFractalParamsData } from "../../stores/editStore/data/useFractalParamsData";
import { useTrapEditMode } from "../../stores/editStore/data/useTrapEditMode";
import { TrapOverlay } from "./TrapOverlay";
import styles from "./FractalGraphOverlay.module.css";

export const FractalGraphOverlay = () => {
  const fractal = useFractalParamsData();
  const [selectAreaActive, setSelectAreaActive] = useState(false);
  const trapEditMode = useTrapEditMode();
  const traps = (fractal.traps as FractalTrap[] | undefined) ?? [];

  const offset: Vector2 = useMemo(() => {
    const imRange = makeArrayFromRules(fractal.dynamic.imVisibleRange, 0);
    const reRange = makeArrayFromRules(fractal.dynamic.rlVisibleRange, 0);
    return [
      -1 * (reRange[0] + (reRange[1] - reRange[0]) / 2),
      -1 * (imRange[0] + (imRange[1] - imRange[0]) / 2),
    ];
  }, [fractal.dynamic.imVisibleRange, fractal.dynamic.rlVisibleRange]);
  const axisRangeSizes: Vector2 = useMemo(() => {
    const imRange = makeArrayFromRules(fractal.dynamic.imVisibleRange, 0);
    const reRange = makeArrayFromRules(fractal.dynamic.rlVisibleRange, 0);
    return [reRange[1] - reRange[0], imRange[1] - imRange[0]];
  }, [fractal.dynamic.imVisibleRange, fractal.dynamic.rlVisibleRange]);
  const { panAndZoomViewport, zoomToArea, updateTrap } = useActions();
  const [panEnabled, setPanEnabled] = useState(true);

  return (
    <div className={styles.container}>
      <GraphEdit axisRangeSizes={axisRangeSizes} offset={offset}>
        <GraphBackgroundColor
          color={trapEditMode ? "rgba(0, 0, 0, 0.5)" : "rgba(0, 0, 0, 0)"}
        />
        {selectAreaActive && (
          <GraphSelectArea
            forceSquare
            enable
            onSelect={(pos, size) => {
              zoomToArea(pos, size);
              setSelectAreaActive(false);
            }}
          />
        )}
        {panEnabled && !selectAreaActive && (
          <GraphViewportControls onViewportChange={panAndZoomViewport} />
        )}
        {trapEditMode && !selectAreaActive && (
          <TrapOverlay traps={traps} onTrapUpdate={updateTrap} />
        )}
      </GraphEdit>
      <FractalViewportToolbar
        zoomValue={axisRangeSizes[0]}
        panEnabled={panEnabled}
        onPanToggle={useCallback(() => setPanEnabled((p) => !p), [])}
        selectAreaActive={selectAreaActive}
        onSelectAreaToggle={useCallback(
          () => setSelectAreaActive((s) => !s),
          [],
        )}
      />
    </div>
  );
};
