export class Time {
  private static _deltaTime: number = 0;
  private static _totalTime: number = 0;
  private static _timeScale: number = 1;
  private static _paused: boolean = false;

  static get deltaTime(): number {
    return this._deltaTime * this._timeScale;
  }

  static get rawDeltaTime(): number {
    return this._deltaTime;
  }

  static get totalTime(): number {
    return this._totalTime;
  }

  static get timeScale(): number {
    return this._timeScale;
  }

  static set timeScale(value: number) {
    this._timeScale = Math.max(0, value);
  }

  static get paused(): boolean {
    return this._paused;
  }

  static set paused(value: boolean) {
    this._paused = value;
  }

  static update(deltaTime: number): void {
    this._deltaTime = deltaTime;
    if (!this._paused) {
      this._totalTime += this.deltaTime;
    }
  }

  static reset(): void {
    this._deltaTime = 0;
    this._totalTime = 0;
    this._timeScale = 1;
    this._paused = false;
  }
}
