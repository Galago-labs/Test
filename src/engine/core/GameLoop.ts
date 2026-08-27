export class GameLoop {
  private lastTime: number = 0;
  private accumulator: number = 0;
  private readonly fixedStep: number = 1 / 60;
  private running: boolean = false;
  private updateCallback: (dt: number) => void;

  constructor(updateCallback: (dt: number) => void) {
    this.updateCallback = updateCallback;
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    this.lastTime = performance.now();
    requestAnimationFrame(this.loop.bind(this));
  }

  stop(): void {
    this.running = false;
  }

  private loop(currentTime: number): void {
    if (!this.running) return;

    let deltaTime = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;

    // Cap delta time to avoid huge jumps
    deltaTime = Math.min(deltaTime, 0.25);

    this.accumulator += deltaTime;

    while (this.accumulator >= this.fixedStep) {
      this.updateCallback(this.fixedStep);
      this.accumulator -= this.fixedStep;
    }

    requestAnimationFrame(this.loop.bind(this));
  }
}
