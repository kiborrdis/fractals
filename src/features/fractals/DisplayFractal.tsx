import { useEffect, useRef, useState } from "react";
import {
  createFractalVisualizer,
  StaticFractalVisualizerControls,
} from "./fractals";
import { FractalParamsBuildRules } from "./types";
import { throttle } from "@/shared/libs/fn-modifiers/throttle";
import { DisplayCanvas } from "@/shared/ui/DisplayCanvas/DisplayCanvas";
import { Vector2 } from "@/shared/libs/vectors";

const defaultInitialState = { time: 0 };
const defaultOffset: Vector2 = [0, 0];

export const DisplayFractal = ({
  offset = defaultOffset,
  scale = 1,
  params,
  play,
  timeMultiplier = 1,
  timeRangeStart,
  timeRangeDuration,

  initialLoopState = defaultInitialState,
  onRender,
}: {
  params: FractalParamsBuildRules;
  play: boolean;
  offset?: Vector2;
  scale?: number;

  timeRangeStart?: number;
  timeRangeDuration?: number;

  timeMultiplier?: number;

  initialLoopState?: { time: number };

  onRender?: (time: number) => void;
}) => {
  const [[width, height], setSize] = useState([0, 0]);
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);
  const fractalRef = useRef<StaticFractalVisualizerControls | null>(null);
  const fractalRerenderRef =
    useRef<(params: FractalParamsBuildRules) => void | null>(null);

  if (fractalRef.current) {
    fractalRef.current.loop.timeMultiplier = timeMultiplier;
  }

  useEffect(() => {
    if (!canvas) {
      return;
    }
    const throttledOnRender = onRender ? throttle(onRender, 50) : undefined;
    const newVisualizer = createFractalVisualizer(
      canvas,
      [width, height],
      params,
      {
        play,
        time: initialLoopState.time || 0,
        timeMultiplier: timeMultiplier,
        loopStartTime: timeRangeStart,
        loopDuration: timeRangeDuration,
      },
      throttledOnRender,
      { offset, scale },
    );
    fractalRef.current = newVisualizer;

    let queuedParams: FractalParamsBuildRules | null = null;
    let isRendering = false;
    fractalRerenderRef.current = (params) => {
      if (isRendering) {
        queuedParams = params;
        return;
      }

      if (fractalRef.current) {
        fractalRef.current
          .updateParams(params)
          .then(() => {
            if (queuedParams) {
              isRendering = false;

              const nextParams = queuedParams;
              queuedParams = null;
              fractalRerenderRef.current?.(nextParams);
            }
          })
          .finally(() => {
            isRendering = false;
          });

        isRendering = true;
      }
    };

    newVisualizer.loop.timeMultiplier = timeMultiplier;

    if (!play) {
      newVisualizer.loop.stop();
    }

    return () => {
      newVisualizer.loop.stop();
    };
    // This is intentional, only recreate visualizer if new canvas element or formula
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvas, onRender]);

  useEffect(() => {
    if (fractalRef.current) {
      fractalRef.current.resize([width, height]);
    }
  }, [width, height]);

  useEffect(() => {
    if (fractalRef.current) {
      fractalRerenderRef.current?.(params);
    }
  }, [params]);

  useEffect(() => {
    if (fractalRef.current && offset) {
      fractalRef.current.setCamera({ offset, scale });
    }
  }, [offset, scale]);

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
    if (
      fractalRef.current &&
      timeRangeStart !== undefined &&
      timeRangeDuration !== undefined
    ) {
      fractalRef.current.loop.setLoopRange(timeRangeStart, timeRangeDuration);
    }
  }, [timeRangeStart, timeRangeDuration]);

  useEffect(() => {
    if (fractalRef.current) {
      fractalRef.current.loop.currentTime = initialLoopState.time;
      onRender?.(fractalRef.current.loop.currentTime);
    }
  }, [initialLoopState, onRender]);

  return (
    <DisplayCanvas
      ref={setCanvas}
      width={width === 0 ? undefined : width}
      height={height === 0 ? undefined : height}
      onSizeChange={setSize}
    />
  );
};
