/**
 * Главная точка входа игры
 */

import { GameLoop } from './engine/core/GameLoop';
import { InputManager } from './engine/input/InputManager';
import { Renderer2D } from './engine/render/Renderer2D';
import { Camera2D } from './engine/render/Camera2D';
import { AssetManager } from './engine/assets/AssetManager';
import { initUI } from './engine/ui/UIManager';
import { GameState } from './game/states/GameState';
import './engine/ui/styles.css';

class Game {
  private gameLoop: GameLoop;
  private input: InputManager;
  private renderer: Renderer2D;
  private camera: Camera2D;
  private assets: AssetManager;
  private ui: any;

  constructor() {
    // Инициализация менеджера ввода
    const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
    this.input = new InputManager(canvas);

    // Инициализация рендерера
    this.renderer = new Renderer2D(canvas);

    // Инициализация камеры
    this.camera = new Camera2D(0, 0, canvas.width, canvas.height);

    // Инициализация менеджера ассетов
    this.assets = new AssetManager();

    // Инициализация UI
    this.ui = initUI('ui-layer');

    // Инициализация игрового цикла
    this.gameLoop = new GameLoop();

    // Регистрируем состояния
    this.gameLoop.registerState('game', () => 
      new GameState(
        this.gameLoop,
        this.input,
        this.renderer,
        this.camera,
        this.assets,
        this.ui
      )
    );

    // Загружаем ассеты
    this.loadAssets();
  }

  private async loadAssets(): Promise<void> {
    // Загружаем спрайты из папки assets
    // Игрок - используем рыцаря
    await this.assets.loadImage('player', 'assets/characters/knight_m_idle_anim_f0.png');
    
    // Враги - используем демонов и зомби
    await this.assets.loadImage('enemy_basic', 'assets/enemies/big_zombie_run_anim_f0.png');
    await this.assets.loadImage('enemy_fast', 'assets/enemies/chort_idle_anim_f0.png');
    await this.assets.loadImage('enemy_tank', 'assets/enemies/big_demon_run_anim_f0.png');
    await this.assets.loadImage('enemy_boss', 'assets/enemies/big_demon_idle_anim_f0.png');
    
    // Башня - используем колонну
    await this.assets.loadImage('tower', 'assets/environment/column.png');
    
    // Снаряд - используем стрелу
    await this.assets.loadImage('projectile', 'assets/weapons/weapon_arrow.png');
    
    // Подбираемые предметы
    await this.assets.loadImage('pickup_gold', 'assets/items/coin_anim_f0.png');
    await this.assets.loadImage('pickup_health', 'assets/items/flask_red.png');
    await this.assets.loadImage('pickup_upgrade', 'assets/items/flask_yellow.png');

    console.log('All assets loaded');
  }

  public start(): void {
    // Запускаем игру с состоянием 'game'
    this.gameLoop.setState('game');
    this.gameLoop.start();
  }
}

// Точка входа при загрузке страницы
window.addEventListener('DOMContentLoaded', () => {
  const game = new Game();
  game.start();
});
