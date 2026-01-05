import { useState } from "react";
import { Vector2 } from "@/shared/libs/vectors";
import {
  defaultRenderGridRuler,
  Graph2DGrid,
  Graph2DLine,
  GraphBackgroundColor,
  GraphEdit,
  GraphValueClick,
  GraphViewportControls,
  PointsEdit,
} from "@/shared/ui/GraphEdit";
import { Stack } from "@mantine/core";
import { DefaultPoint } from "@/shared/ui/Points/DefaultPoint";
import { GraphValueHover } from "@/shared/ui/GraphEdit/GraphValueHover";
import { MapEditToolbar } from "./MapEditToolbar";
import { useGraphMapParam } from "../../stores/graphMapState";
import { GraphFractalMap } from "../GraphFractalMap";
import styles from "./MapEditMode.module.css";

export const MapEditMode = ({
  offset,
  axisRangeSizes,
  setViewport,
  onExit,
}: {
  offset: Vector2;
  axisRangeSizes: Vector2;
  setViewport: (axisRangeSizes: Vector2, newOffset: Vector2) => void;
  onExit: () => void;
}) => {
  const [c, setC] = useGraphMapParam();
  const [previewC, setPreviewC] = useState<Vector2>(c);

  const [isPanning, setIsPanning] = useState(false);

  return (
    <Stack>
      <div className={styles.graphContainer}>
        <GraphEdit axisRangeSizes={axisRangeSizes} offset={offset}>
          <GraphBackgroundColor color='black' />
          <GraphFractalMap c={previewC} />
          <Graph2DGrid renderRuler={defaultRenderGridRuler} />

          <GraphViewportControls
            onPanToggle={(isPanning) => {
              if (isPanning) {
                setIsPanning(isPanning);
              } else {
                setTimeout(() => {
                  setIsPanning(false);
                }, 50);
              }
            }}
            onViewportChange={setViewport}
          />

          <GraphValueClick onClick={(v) => setC(v)} />
          <GraphValueHover
            onHover={(value) => {
              if (value && !isPanning) {
                setPreviewC(value);
              } else {
                setPreviewC(c);
              }
            }}
          />

          <Graph2DLine
            data={[[0, 0], c]}
            lineWidth={1.4}
            getColor={() => "white"}
          />

          <PointsEdit points={[c]} renderPoint={() => <DefaultPoint />} />
        </GraphEdit>

        <MapEditToolbar
          onCancel={onExit}
          onApply={() => {
            setC(previewC);
            onExit();
          }}
        />
      </div>
    </Stack>
  );
};
