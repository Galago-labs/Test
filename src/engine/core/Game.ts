import { GameLoop } from './GameLoop';
import { StateManager, State } from './StateManager';
import { InputManager } from '../input/InputManager';
import { Renderer2D } from '../render/Renderer2D';
import { Camera2D } from '../render/Camera2D';
import { AssetManager } from '../assets/AssetManager';

/**
 * Главный класс игры, объединяющий все системы движка.
 * Движок не знает про конкретную игру, игра использует публичный API движка.
 */
export class Game {
  public readonly gameLoop: GameLoop;
  public readonly stateManager: StateManager;
  public readonly input: InputManager;
  public readonly renderer: Renderer2D;
  public readonly camera: Camera2D;
  public readonly assets: AssetManager;
  public readonly uiLayer: HTMLElement | null;

  constructor(canvas: HTMLCanvasElement) {
    // Инициализация систем движка
    this.input = new InputManager(canvas);
    this.renderer = new Renderer2D(canvas);
    this.camera = new Camera2D(0, 0, canvas.width, canvas.height);
    this.assets = new AssetManager();
    this.uiLayer = document.getElementById('ui-layer');

    // Менеджер состояний
    this.stateManager = new StateManager();

    // Игровой цикл, который обновляет состояния и вызывает рендер
    this.gameLoop = new GameLoop(
      (dt: number) => {
        this.stateManager.update(dt);
      },
      () => {
        const ctx = this.renderer.getContext();
        if (ctx) {
          this.stateManager.render(ctx);
        }
      }
    );
  }

  /**
   * Регистрирует состояние в менеджере состояний
   * @param name - имя состояния
   * @param stateFactory - фабрика для создания состояния
   */
  public registerState(name: string, stateFactory: () => State): void {
    const state = stateFactory();
    this.stateManager.addState(name, state);
  }

  /**
   * Переключается на указанное состояние
   * @param name - имя состояния
   */
  public setState(name: string): void {
    this.stateManager.changeState(name);
  }

  /**
   * Запускает игровой цикл
   */
  public start(): void {
    this.gameLoop.start();
  }

  /**
   * Останавливает игровой цикл
   */
  public stop(): void {
    this.gameLoop.stop();
  }
}
