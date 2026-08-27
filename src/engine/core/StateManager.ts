export abstract class State {
  enter(): void {}
  exit(): void {}
  update(dt: number): void {}
}

export type StateConstructor = new () => State;

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

  getState(name: string): State | undefined {
    return this.states.get(name);
  }

  getCurrentStateName(): string | null {
    return this.currentStateName;
  }

  update(dt: number): void {
    if (this.currentState) {
      this.currentState.update(dt);
    }
  }
}
