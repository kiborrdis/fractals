type RenderLoopIterationContext = {
  timeDelta: number;
  timeSinceStart: number;
};

export const createRenderLoop = ({
  params,
  loopIterationCallback,
}: {
  params: { time: number; play: boolean; timeMultiplier: number },
  loopIterationCallback: (context: RenderLoopIterationContext) => Promise<void>;
}) => {
  let running = params.play;
  let lastRender = Date.now();
  let timeSinceStart = params.time;
  let timeMultiplier = params.timeMultiplier;

  const performLoopIteration = async () => {
    const currentTime = Date.now();
    const timeDelta = (currentTime - lastRender);
    lastRender = currentTime;
    timeSinceStart += timeDelta * timeMultiplier;

    await loopIterationCallback({ timeDelta, timeSinceStart });

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
      loopIterationCallback({ timeDelta: 0, timeSinceStart })
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
    setTimemultiplier: (newTimeMultiplier: number) => {
      timeMultiplier = newTimeMultiplier;
    }
  };

  return res;
};
