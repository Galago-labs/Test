export abstract class State {
  enter(): void {}
  exit(): void {}
  update(dt: number): void {}
  render(ctx: CanvasRenderingContext2D): void {}
}

export class StateManager {
  private states: Map<string, State> = new Map();
  private currentState: State | null = null;
  private currentStateName: string | null = null;

  addState(name: string, state: State): void {
    this.states.set(name, state);
  }

  changeState(name: string): void {
    const newState = this.states.get(name);
    if (!newState) {
      console.error(`State "${name}" not found`);
      return;
    }

    if (this.currentState) {
      this.currentState.exit();
    }

    this.currentState = newState;
    this.currentStateName = name;
    this.currentState.enter();
  }

  getCurrentStateName(): string | null {
    return this.currentStateName;
  }

  update(dt: number): void {
    if (this.currentState) {
      this.currentState.update(dt);
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    if (this.currentState) {
      this.currentState.render(ctx);
    }
  }
}
