export class RecordLoop {
  private running: boolean = false;
  private timePassed: number = 0;
  private timeIncrement: number;
  private duration: number;
  private animationRequestId: number | null = null;

  constructor(
    private callback: (context: { time: number }) => Promise<void>,
    private onStop?: () => void,
    params: {
      initialTime?: number;
      duration?: number;
      fps?: number;
      timeMultiplier?: number;
    } = {},
  ) {
    this.timePassed = params.initialTime || 0;
    this.duration = params.duration || 1000;
    this.timeIncrement =
      1000 / ((params.fps || 60) * (params.timeMultiplier || 1));
  }

  get currentTime() {
    return this.timePassed;
  }

  run() {
    if (this.running) {
      return;
    }

    this.running = true;
    this.loop();
  }

  stop() {
    this.running = false;

    if (this.animationRequestId !== null) {
      cancelAnimationFrame(this.animationRequestId);
      this.animationRequestId = null;
    }

    this.onStop?.();
  }

  private loop() {
    if (!this.running) {
      return;
    }

    this.performLoopIteration();
  }

  private async performLoopIteration() {
    await this.callback({ time: this.timePassed });

    this.timePassed += this.timeIncrement;

    if (this.timePassed >= this.duration) {
      this.stop();
      return;
    }

    if (this.running) {
      this.animationRequestId = requestAnimationFrame(() => this.loop());
    }
  }
}
