import { useEffect, useRef, useState } from "react";
import {
  createFractalVisualizer,
  StaticFractalVisualizerControls,
} from "./fractals";
import { FractalParamsBuildRules } from "./types";
import { throttle } from "../../shared/libs/fn-modifiers/throttle";
import { DisplayCanvas } from "@/shared/ui/DisplayCanvas/DisplayCanvas";

const defaultInitialState = { time: 0 };

export const DisplayFractal = ({
  params,
  play,
  formula = 'z^2 + c',
  timeMultiplier = 1,
  initialLoopState = defaultInitialState,
  onRender
}: {
  params: FractalParamsBuildRules;
  play: boolean;
  formula?: string;
  timeMultiplier?: number;
  initialLoopState?: { time: number},
  loopHandlerRef?: (number: number) => void;
  onRender?: (time: number) => void;
}) => {
  const [[width, height], setSize] = useState([0, 0]);
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);
  const fractalRef = useRef<StaticFractalVisualizerControls | null>(null);

  if (fractalRef.current) {
    fractalRef.current.loop.setTimemultiplier(timeMultiplier);
  }

  useEffect(() => {
    if (!canvas) {
      return;
    }
    const throttledOnRender = onRender ? throttle(onRender, 50) : undefined;

    const newVisualizer = createFractalVisualizer(
      formula,
      canvas,
      [width, height],
      params,
      {
        play,
        time: initialLoopState.time || 0,
        timeMultiplier: timeMultiplier,
     },
      throttledOnRender
    );
    fractalRef.current = newVisualizer;

    newVisualizer.loop.setTimemultiplier(timeMultiplier);

    if (!play) {
      newVisualizer.loop.stop();
    }

    return () => {
      newVisualizer.loop.stop();
    };
  // This is intentional, only recreate visualizer if new canvas element or formula
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvas, formula, onRender]);

  useEffect(() => {
    if (fractalRef.current) {
      fractalRef.current.resize([width, height]);
    }
  }, [width, height]);

  useEffect(() => {
    if (fractalRef.current) {
      fractalRef.current.updateParams(params);
    }
  }, [params]);

  useEffect(() => {
    if (fractalRef.current) {
      if (play) {
        fractalRef.current.loop.run();
      } else {
        fractalRef.current.loop.stop();
      }
    }
  }, [play]);
  useEffect(() => {
    if (fractalRef.current) {
      fractalRef.current.loop.setCurrentTime(initialLoopState.time);
    }
  }, [initialLoopState]);

  return (
    <DisplayCanvas
      ref={setCanvas}
      width={width === 0 ? undefined : width}
      height={height === 0 ? undefined : height}
      onSizeChange={setSize}
    />
  );
};

