// Small delay between renders to avoid blocking gpu for too long and allow it to process other tasks
const MIN_TIME_BETWEEN_RENDERS = 5;

export class RecordLoop {
  private running: boolean = false;
  private timePassed: number = 0;
  private initialTime: number = 0;
  private timeIncrement: number;
  private duration: number;
  private animationRequestId: ReturnType<typeof setTimeout> | null = null;

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
    this.initialTime = params.initialTime || 0;
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
      clearTimeout(this.animationRequestId);
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
    await this.callback({ time: this.initialTime + this.timePassed });

    this.timePassed += this.timeIncrement;

    if (this.timePassed >= this.duration) {
      this.stop();
      return;
    }

    if (this.running) {
      this.animationRequestId = setTimeout(
        () => this.loop(),
        MIN_TIME_BETWEEN_RENDERS,
      );
    }
  }
}
