type RenderLoopIterationContext = {
  timeDelta: number;
  timeSinceStart: number;
};

export const createRenderLoop = ({
  loopIterationCallback,
}: {
  loopIterationCallback: (context: RenderLoopIterationContext) => Promise<void>;
}) => {
  let running = true;
  let lastRender = Date.now();
  let timeSinceStart = 0;
  const performLoopIteration = async () => {
    const currentTime = Date.now();
    const timeDelta = (currentTime - lastRender);
    lastRender = currentTime;
    timeSinceStart += timeDelta;

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
  };

  return res;
};
