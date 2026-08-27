export interface InputAction {
  keys: string[];
  mouseButton?: number;
}

export class InputManager {
  private actionMap: Map<string, InputAction> = new Map();
  private pressedKeys: Set<string> = new Set();
  private mousePosition: { x: number; y: number } = { x: 0, y: 0 };
  private mouseButtons: Set<number> = new Set();
  private canvas: HTMLCanvasElement;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    window.addEventListener('keydown', (e) => {
      this.pressedKeys.add(e.code);
      // Prevent scrolling for game keys
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
      }
    });

    window.addEventListener('keyup', (e) => {
      this.pressedKeys.delete(e.code);
    });

    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvas.width / rect.width;
      const scaleY = this.canvas.height / rect.height;
      this.mousePosition.x = (e.clientX - rect.left) * scaleX;
      this.mousePosition.y = (e.clientY - rect.top) * scaleY;
    });

    this.canvas.addEventListener('mousedown', (e) => {
      this.mouseButtons.add(e.button);
    });

    this.canvas.addEventListener('mouseup', (e) => {
      this.mouseButtons.delete(e.button);
    });
  }

  registerAction(name: string, action: InputAction): void {
    this.actionMap.set(name, action);
  }

  isActionPressed(actionName: string): boolean {
    const action = this.actionMap.get(actionName);
    if (!action) return false;

    // Check keyboard
    if (action.keys && action.keys.length > 0) {
      for (const key of action.keys) {
        if (this.pressedKeys.has(key)) {
          return true;
        }
      }
    }

    // Check mouse button
    if (action.mouseButton !== undefined) {
      if (this.mouseButtons.has(action.mouseButton)) {
        return true;
      }
    }

    return false;
  }

  getMousePosition(): { x: number; y: number } {
    return { ...this.mousePosition };
  }

  isMouseButtonPressed(button: number): boolean {
    return this.mouseButtons.has(button);
  }

  clear(): void {
    this.pressedKeys.clear();
    this.mouseButtons.clear();
  }
}
