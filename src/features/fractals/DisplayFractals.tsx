import { useEffect, useRef, useState } from "react";
import { DisplayCanvas } from "@/shared/ui/DisplayCanvas/DisplayCanvas";
import { FractalParamsBuildRules } from "./types";
import { createShowcaseFractalsVisualizer } from "./fractals";
import { useErrorBoundary } from "@/shared/ui/ErrorBoundary/ErrorBoundary";
import { withFractalErrorBoundary } from "./DisplayFractalError";

type DisplayFractalsProps = {
  play: boolean;
  fractals: FractalParamsBuildRules[][];
};

export const DisplayFractals = withFractalErrorBoundary(
  "DisplayFractals",
  ({ play, fractals }: DisplayFractalsProps) => {
    const [[width, height], setSize] = useState([0, 0]);
    const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);
    const visualizerRef = useRef<{
      resize: (newSize: [number, number]) => void;
      loop: {
        stop: () => void;
        run: () => void;
      };
    } | null>(null);
    const reportError = useErrorBoundary();

    useEffect(() => {
      if (!canvas) {
        return;
      }

      const visializer = createShowcaseFractalsVisualizer(
        canvas,
        [width, height],
        fractals,
        { play },
        reportError,
      );
      visualizerRef.current = visializer;
      return () => {
        visializer.loop.stop();
        visializer.cleanup();
      };
      // This is intentional, only recreate visualizer if new canvas element
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [canvas]);

    useEffect(() => {
      if (visualizerRef.current) {
        visualizerRef.current.resize([width, height]);
      }
    }, [width, height]);

    useEffect(() => {
      if (visualizerRef.current) {
        if (play) {
          visualizerRef.current.loop.run();
        } else {
          visualizerRef.current.loop.stop();
        }
      }
    }, [play]);

    return (
      <DisplayCanvas
        ref={setCanvas}
        width={width === 0 ? undefined : width}
        height={height === 0 ? undefined : height}
        onSizeChange={setSize}
      />
    );
  },
);
