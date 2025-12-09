type RenderLoopIterationContext = {
  timeDelta: number;
  timeSinceStart: number;
};

export const createRenderLoop = ({
  params,
  loopIterationCallback,
  maxFps = 60,
}: {
  params: { time: number; play: boolean; timeMultiplier: number };
  loopIterationCallback: (context: RenderLoopIterationContext) => Promise<void>;
  maxFps?: number;
}) => {
  let currentMaxFps = maxFps;
  let running = params.play;
  let lastRender = Date.now();
  let timeSinceStart = params.time;
  let timeMultiplier = params.timeMultiplier;
  let minFrameTime = currentMaxFps ? 1000 / currentMaxFps : 0;

  const performLoopIteration = async () => {
    const currentTime = Date.now();
    const timeDelta = currentTime - lastRender;

    // It would be lower than maxFps, since we skip frame and wait for next requestAnimationFrame
    // But whatever, it's good enough for now
    if (minFrameTime === 0 || timeDelta >= minFrameTime) {
      timeSinceStart += timeDelta * timeMultiplier;
      lastRender = currentTime;

      await loopIterationCallback({ timeDelta, timeSinceStart });
    }

    if (running) {
      requestAnimationFrame(performLoopIteration);
    }
  };

  if (running) {
    requestAnimationFrame(performLoopIteration);
  }

  const res = {
    running: true,
    setCurrentTime: (newTime: number) => {
      timeSinceStart = newTime;
      loopIterationCallback({ timeDelta: 0, timeSinceStart });
    },
    getCurrentTime: () => timeSinceStart,
    stop: () => {
      if (running) {
        running = false;
        res.running = false;
      }
    },
    run: () => {
      if (!running) {
        lastRender = Date.now();
        running = true;
        res.running = true;
        requestAnimationFrame(performLoopIteration);
      }
    },
    setMaxFps: (newMaxFps: number) => {
      currentMaxFps = newMaxFps;
      minFrameTime = newMaxFps ? 1000 / newMaxFps : 0;
    },
    setTimemultiplier: (newTimeMultiplier: number) => {
      timeMultiplier = newTimeMultiplier;
    },
  };

  return res;
};
