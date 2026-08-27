/**
 * Состояние игровой сессии - GameState
 */

import { State } from '../../engine/core/StateManager';
import { World } from '../../engine/ecs/World';
import { Game } from '../../engine/core/Game';
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
  private game: Game;
  private entityFactory: EntityFactory;
  
  private systems: Array<{ system: any; name: string }> = [];

  constructor(game: Game) {
    super();
    this.game = game;
    this.world = new World();
    this.entityFactory = new EntityFactory(this.world, this.game.assets);
  }

  enter(): void {
    console.log('GameState: enter');
    
    // Инициализируем аудио контекст
    audio.init();
    
    // Создаем системы
    this.systems = [
      { system: new PlayerMovementSystem(this.world, this.game.input), name: 'PlayerMovement' },
      { system: new EnemyMovementSystem(this.world), name: 'EnemyMovement' },
      { system: new PlayerShootingSystem(this.world, this.game.input, this.entityFactory), name: 'PlayerShooting' },
      { system: new ProjectileMovementSystem(this.world), name: 'ProjectileMovement' },
      { system: new CollisionSystem(this.world), name: 'Collision' },
      { system: new RewardSystem(this.world), name: 'Reward' },
      { system: new DestroySystem(this.world), name: 'Destroy' },
      { system: new RenderSystem(this.world, this.game.renderer, this.game.camera), name: 'Render' },
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
    if (this.game.uiLayer) {
      const startScreen = this.game.uiLayer.querySelector('#start-screen') as HTMLElement;
      if (startScreen) startScreen.style.display = 'none';
      
      // Обновляем UI
      const uiUpdate = {
        health: 100,
        maxHealth: 100,
        wave: 1,
        score: 0,
        gold: 0,
      };
      
      const healthBar = this.game.uiLayer.querySelector('#health-bar-fill') as HTMLElement;
      const waveEl = this.game.uiLayer.querySelector('#wave-value') as HTMLElement;
      const scoreEl = this.game.uiLayer.querySelector('#score-value') as HTMLElement;
      const goldEl = this.game.uiLayer.querySelector('#gold-value') as HTMLElement;
      
      if (healthBar) healthBar.style.width = `${(uiUpdate.health / uiUpdate.maxHealth) * 100}%`;
      if (waveEl) waveEl.textContent = uiUpdate.wave.toString();
      if (scoreEl) scoreEl.textContent = uiUpdate.score.toString();
      if (goldEl) goldEl.textContent = uiUpdate.gold.toString();

      // Настраиваем кнопку рестарта
      const restartBtn = this.game.uiLayer.querySelector('#restart-btn') as HTMLButtonElement;
      if (restartBtn) {
        restartBtn.onclick = () => {
          this.game.setState('game');
        };
      }
    }
  }

  update(deltaTime: number): void {
    // Обновляем все системы
    for (const { system } of this.systems) {
      system.update(deltaTime);
    }

    // Обновляем UI на основе состояния игрока
    const players = this.world.query(['player', 'playerTag', 'health']);
    if (players.length > 0 && this.game.uiLayer) {
      const playerEntity = this.world.getEntity(players[0]);
      if (playerEntity) {
        const player = playerEntity.getComponent<any>('player');
        const health = playerEntity.getComponent<any>('health');
        
        if (player && health) {
          const healthBar = this.game.uiLayer.querySelector('#health-bar-fill') as HTMLElement;
          const scoreEl = this.game.uiLayer.querySelector('#score-value') as HTMLElement;
          const goldEl = this.game.uiLayer.querySelector('#gold-value') as HTMLElement;
          
          if (healthBar) healthBar.style.width = `${(health.current / health.max) * 100}%`;
          if (scoreEl) scoreEl.textContent = player.score.toString();
          if (goldEl) goldEl.textContent = player.gold.toString();

          // Проверяем смерть игрока
          if (health.current <= 0) {
            const gameOverScreen = this.game.uiLayer.querySelector('#game-over-screen') as HTMLElement;
            const finalScoreEl = this.game.uiLayer.querySelector('#final-score') as HTMLElement;
            if (gameOverScreen) gameOverScreen.style.display = 'flex';
            if (finalScoreEl) finalScoreEl.textContent = player.score.toString();
          }
        }
      }
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    // Рендеринг происходит в RenderSystem
  }

  exit(): void {
    console.log('GameState: exit');
    audio.stopAll();
  }
}
