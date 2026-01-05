import { useState } from "react";
import { DisplayFractal } from "@/features/fractals";
import { FractalParamsBuildRules } from "@/features/fractals";
import { PreviewStateOverlay } from "./PreviewStateOverlay";
import { useRecordingSettings } from "../store/data/useRecordingSettings";
import { useRecordingActions } from "../store/data/useRecordingActions";

export const RecordingPreviewState = ({
  fractal,
  play,
  timeMultiplier,
  initialLoopState,
  onRender,
}: {
  fractal: FractalParamsBuildRules;
  play: boolean;
  timeMultiplier: number;
  initialLoopState: { time: number };
  onRender: (time: number) => void;
}) => {
  const [workScale, setWorkScale] = useState(1);
  const settings = useRecordingSettings();
  const actions = useRecordingActions();

  const handleSizeChange = (newOffset: [number, number], scale: number) => {
    actions.updateSettings({
      offset: newOffset,
      scale: scale,
    });
  };

  return (
    <>
      <DisplayFractal
        scale={workScale}
        params={fractal}
        play={play}
        timeMultiplier={timeMultiplier}
        initialLoopState={initialLoopState}
        onRender={onRender}
        timeRangeStart={settings.startTime}
        timeRangeDuration={settings.duration}
      />
      <PreviewStateOverlay
        scale={settings.scale}
        offset={settings.offset}
        width={settings.width}
        height={settings.height}
        onSizeChange={handleSizeChange}
        onBackgroundScaleChange={setWorkScale}
      />
    </>
  );
};
