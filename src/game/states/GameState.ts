/**
 * Состояние игровой сессии - GameState
 */

import { StateManager, type State } from '../../engine/core/StateManager';
import { World } from '../../engine/ecs/World';
import { GameLoop } from '../../engine/core/GameLoop';
import { InputManager } from '../../engine/input/InputManager';
import { Renderer2D } from '../../engine/render/Renderer2D';
import { Camera2D } from '../../engine/render/Camera2D';
import { AssetManager } from '../../engine/assets/AssetManager';
import { UIManager } from '../../engine/ui/UIManager';
import { EntityFactory } from '../factories/EntityFactory';
import { PlayerMovementSystem } from '../systems/PlayerMovementSystem';
import { EnemyMovementSystem } from '../systems/EnemyMovementSystem';
import { PlayerShootingSystem } from '../systems/PlayerShootingSystem';
import { ProjectileMovementSystem } from '../systems/ProjectileMovementSystem';
import { CollisionSystem } from '../systems/CollisionSystem';
import { DestroySystem } from '../systems/DestroySystem';
import { RewardSystem } from '../systems/RewardSystem';
import { RenderSystem } from '../systems/RenderSystem';
import { audio } from '../../engine/audio/SynthAudio';
import { Vector2 } from '../../engine/math/Vector2';

export class GameState extends State {
  private world: World;
  private gameLoop: GameLoop;
  private input: InputManager;
  private renderer: Renderer2D;
  private camera: Camera2D;
  private assets: AssetManager;
  private ui: UIManager;
  private entityFactory: EntityFactory;
  
  private systems: Array<{ system: any; name: string }> = [];

  constructor(
    gameLoop: GameLoop,
    input: InputManager,
    renderer: Renderer2D,
    camera: Camera2D,
    assets: AssetManager,
    ui: UIManager
  ) {
    super();
    this.gameLoop = gameLoop;
    this.input = input;
    this.renderer = renderer;
    this.camera = camera;
    this.assets = assets;
    this.ui = ui;
    this.world = new World();
    this.entityFactory = new EntityFactory(this.world, this.assets);
  }

  enter(): void {
    console.log('GameState: enter');
    
    // Инициализируем аудио контекст
    audio.init();
    
    // Создаем системы
    this.systems = [
      { system: new PlayerMovementSystem(this.world, this.input), name: 'PlayerMovement' },
      { system: new EnemyMovementSystem(this.world), name: 'EnemyMovement' },
      { system: new PlayerShootingSystem(this.world, this.input, this.entityFactory), name: 'PlayerShooting' },
      { system: new ProjectileMovementSystem(this.world), name: 'ProjectileMovement' },
      { system: new CollisionSystem(this.world), name: 'Collision' },
      { system: new RewardSystem(this.world), name: 'Reward' },
      { system: new DestroySystem(this.world), name: 'Destroy' },
      { system: new RenderSystem(this.world, this.renderer, this.camera), name: 'Render' },
    ];

    // Создаем игрока
    this.entityFactory.createPlayer({
      x: 400,
      y: 300,
      speed: 200,
      health: 100,
      damage: 25,
      attackCooldown: 0.2,
    });

    // Создаем тестовых врагов с путем
    const path: Vector2[] = [
      new Vector2(800, 100),
      new Vector2(800, 500),
      new Vector2(200, 500),
      new Vector2(200, 200),
      new Vector2(600, 200),
      new Vector2(600, 600),
    ];

    this.entityFactory.createEnemy({
      x: 100,
      y: 100,
      enemyType: 'basic',
      path: path,
    });

    this.entityFactory.createEnemy({
      x: 150,
      y: 100,
      enemyType: 'fast',
      path: path,
    });

    // Скрываем стартовый экран
    this.ui.hideStartScreen();

    // Обновляем UI
    this.ui.update({
      health: 100,
      maxHealth: 100,
      wave: 1,
      score: 0,
      gold: 0,
    });

    // Настраиваем кнопку рестарта
    this.ui.setButtonCallback('restart-btn', () => {
      this.gameLoop.setState('game');
    });
  }

  update(deltaTime: number): void {
    // Обновляем все системы
    for (const { system } of this.systems) {
      system.update(deltaTime);
    }

    // Обновляем UI на основе состояния игрока
    const players = this.world.query(['player', 'playerTag', 'health']);
    if (players.length > 0) {
      const playerEntity = this.world.getEntity(players[0]);
      if (playerEntity) {
        const player = playerEntity.getComponent<any>('player');
        const health = playerEntity.getComponent<any>('health');
        
        if (player && health) {
          this.ui.update({
            health: health.current,
            maxHealth: health.max,
            score: player.score,
            gold: player.gold,
          });

          // Проверяем смерть игрока
          if (health.current <= 0) {
            this.ui.showGameOver(player.score);
            // Можно перейти в состояние GameOver
          }
        }
      }
    }
  }

  render(): void {
    // Рендеринг происходит в RenderSystem
  }

  exit(): void {
    console.log('GameState: exit');
    audio.stopAll();
  }
}
