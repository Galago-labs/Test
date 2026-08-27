/**
 * UI Manager - система управления пользовательским интерфейсом
 */

export interface UIElement {
  id: string;
  element: HTMLElement;
  visible: boolean;
}

export interface UIState {
  health: number;
  maxHealth: number;
  wave: number;
  score: number;
  gold: number;
}

export class UIManager {
  private container: HTMLElement;
  private elements: Map<string, UIElement> = new Map();
  private state: UIState = {
    health: 100,
    maxHealth: 100,
    wave: 1,
    score: 0,
    gold: 0
  };

  constructor(containerId: string) {
    const container = document.getElementById(containerId);
    if (!container) {
      throw new Error(`Container with id "${containerId}" not found`);
    }
    this.container = container;
    this.createUIElements();
  }

  private createUIElements(): void {
    // Health bar
    this.createElement('health-bar', 'div', 'health-bar');
    this.createElement('health-fill', 'div', 'health-fill');
    
    // Stats panel
    this.createElement('wave-display', 'div', 'stat-panel', 'Wave: 1');
    this.createElement('score-display', 'div', 'stat-panel', 'Score: 0');
    this.createElement('gold-display', 'div', 'stat-panel', 'Gold: 0');
    
    // Game over screen (hidden by default)
    this.createElement('game-over', 'div', 'overlay hidden', `
      <div class="overlay-content">
        <h1>GAME OVER</h1>
        <p id="final-score">Score: 0</p>
        <button id="restart-btn">Play Again</button>
      </div>
    `);
    
    // Start screen (hidden by default)
    this.createElement('start-screen', 'div', 'overlay', `
      <div class="overlay-content">
        <h1>TOWER DEFENSE</h1>
        <p>Defend your base from enemies!</p>
        <p>WASD/Arrows - Move | Mouse - Aim & Shoot</p>
        <button id="start-btn">Start Game</button>
      </div>
    `);
  }

  private createElement(id: string, tag: string, className: string, innerHTML: string = ''): void {
    const element = document.createElement(tag);
    element.id = id;
    element.className = className;
    if (innerHTML) {
      element.innerHTML = innerHTML;
    }
    this.container.appendChild(element);
    this.elements.set(id, { id, element, visible: true });
  }

  public getElement(id: string): HTMLElement | null {
    const uiElement = this.elements.get(id);
    return uiElement ? uiElement.element : null;
  }

  public update(state: Partial<UIState>): void {
    Object.assign(this.state, state);
    
    // Update health bar
    const healthPercent = (this.state.health / this.state.maxHealth) * 100;
    const healthFill = this.getElement('health-fill');
    if (healthFill) {
      healthFill.style.width = `${Math.max(0, healthPercent)}%`;
    }
    
    // Update stats
    const waveDisplay = this.getElement('wave-display');
    if (waveDisplay) waveDisplay.textContent = `Wave: ${this.state.wave}`;
    
    const scoreDisplay = this.getElement('score-display');
    if (scoreDisplay) scoreDisplay.textContent = `Score: ${this.state.score}`;
    
    const goldDisplay = this.getElement('gold-display');
    if (goldDisplay) goldDisplay.textContent = `Gold: ${this.state.gold}`;
  }

  public showGameOver(score: number): void {
    const gameOver = this.getElement('game-over');
    const finalScore = this.getElement('final-score');
    if (gameOver) {
      gameOver.classList.remove('hidden');
    }
    if (finalScore) {
      finalScore.textContent = `Final Score: ${score}`;
    }
  }

  public hideStartScreen(): void {
    const startScreen = this.getElement('start-screen');
    if (startScreen) {
      startScreen.classList.add('hidden');
    }
  }

  public setButtonCallback(buttonId: string, callback: () => void): void {
    const button = this.getElement(buttonId);
    if (button) {
      button.addEventListener('click', callback);
    }
  }
}

// Глобальный экземпляр будет создан в игре
export let ui: UIManager | null = null;

export function initUI(containerId: string): UIManager {
  ui = new UIManager(containerId);
  return ui;
}
