export type RenderLoopIterationContext = {
  timeDelta: number;
  timeSinceStart: number;
};

export class RenderLoop {
  private running: boolean = false;
  private multiplier: number = 1;
  private loopStartTime: number = 0;
  private loopSize?: number = undefined;

  private minTimeBetweenFrames: number = 0;

  private lastRender: number = 0;
  private timeSinceStart: number = 0;

  private animatioRequestId: number | null = null;

  constructor(
    private callback: (context: RenderLoopIterationContext) => Promise<void>,
    params: {
      play?: boolean;
      initialTime?: number;
      timeMultiplier?: number;

      loopTimeStart?: number;
      loopDuration?: number;
    },
    maxFps: number = 60,
  ) {
    this.timeSinceStart = params.initialTime || 0;
    this.multiplier = params.timeMultiplier || 1;
    this.loopStartTime = params.loopTimeStart || 0;
    this.minTimeBetweenFrames = maxFps ? 1000 / maxFps : 0;

    if (params.loopDuration !== undefined) {
      this.loopSize = params.loopDuration;
    }

    if (params.play) {
      this.run();
    }
  }

  get currentTime() {
    return this.timeSinceStart;
  }

  set currentTime(newTime: number) {
    this.timeSinceStart = newTime;
    this.lastRender = Date.now();

    this.performLoopIteration();
  }

  set timeMultiplier(newTimeMultiplier: number) {
    this.multiplier = newTimeMultiplier;
  }

  get maxFps() {
    return this.minTimeBetweenFrames ? 1000 / this.minTimeBetweenFrames : 0;
  }

  set maxFps(newMaxFps: number) {
    this.minTimeBetweenFrames = newMaxFps ? 1000 / newMaxFps : 0;
  }

  setLoopRange(start: number, duration?: number) {
    this.loopStartTime = start;
    this.loopSize = duration;
  }

  run() {
    if (this.running) {
      return;
    }

    this.running = true;
    this.lastRender = Date.now();

    this.loop();
  }

  stop() {
    this.running = false;

    if (this.animatioRequestId !== null) {
      cancelAnimationFrame(this.animatioRequestId);
      this.animatioRequestId = null;
    }
  }

  private loop() {
    if (!this.running) {
      return;
    }

    this.performLoopIteration();

    this.animatioRequestId = requestAnimationFrame(() => this.loop());
  }

  private performLoopIteration() {
    const currentTime = Date.now();
    const timeDelta = currentTime - this.lastRender;

    // It will be lower than maxFps, since we skip frame and wait for next requestAnimationFrame
    // But whatever, it's good enough for now
    if (
      this.minTimeBetweenFrames === 0 ||
      timeDelta >= this.minTimeBetweenFrames
    ) {
      this.timeSinceStart += timeDelta * this.multiplier;
      this.lastRender = currentTime;

      if (this.loopSize !== undefined) {
        this.timeSinceStart =
          this.loopStartTime +
          ((this.timeSinceStart - this.loopStartTime) % this.loopSize);
      }

      this.callback({
        timeDelta,
        timeSinceStart: this.timeSinceStart,
      });
    }
  }
}
