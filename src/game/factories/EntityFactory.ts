/**
 * Фабрики для создания игровых сущностей
 */

import { World } from '../../engine/ecs/World';
import { Entity } from '../../engine/ecs/Entity';
import { Vector2 } from '../../engine/math/Vector2';
import {
  PositionComponent,
  VelocityComponent,
  HealthComponent,
  BoundsComponent,
  SpriteComponent,
  PlayerComponent,
  EnemyComponent,
  ProjectileComponent,
  WeaponComponent,
  TowerComponent,
  PathFollowingComponent,
  PlayerTag,
  EnemyTag,
  ProjectileTag,
  TowerTag,
  PickupComponent,
  AnimationComponent,
} from '../components/GameComponents';
import { AssetManager } from '../../engine/assets/AssetManager';

/** Конфигурация игрока */
export interface PlayerConfig {
  x: number;
  y: number;
  speed: number;
  health: number;
  damage: number;
  attackCooldown: number;
}

/** Конфигурация врага */
export interface EnemyConfig {
  x: number;
  y: number;
  enemyType: 'basic' | 'fast' | 'tank' | 'boss';
  path: Vector2[];
}

/** Конфигурация пули */
export interface ProjectileConfig {
  x: number;
  y: number;
  vx: number;
  vy: number;
  damage: number;
  speed: number;
  lifetime: number;
  pierce: number;
}

/** Конфигурация башни */
export interface TowerConfig {
  x: number;
  y: number;
  level: number;
  targetPriority: 'closest' | 'strongest' | 'weakest' | 'first';
}

/** Конфигурация подбираемого предмета */
export interface PickupConfig {
  x: number;
  y: number;
  type: 'gold' | 'health' | 'upgrade';
  value: number;
}

export class EntityFactory {
  private world: World;
  private assets: AssetManager;

  constructor(world: World, assets: AssetManager) {
    this.world = world;
    this.assets = assets;
  }

  /** Создание игрока */
  createPlayer(config: PlayerConfig): Entity {
    const entity = this.world.createEntity();
    
    entity.addComponent<PositionComponent>('position', { x: config.x, y: config.y });
    entity.addComponent<VelocityComponent>('velocity', { vx: 0, vy: 0 });
    entity.addComponent<HealthComponent>('health', { current: config.health, max: config.health });
    entity.addComponent<BoundsComponent>('bounds', { width: 32, height: 32 });
    entity.addComponent<PlayerComponent>('player', {
      speed: config.speed,
      damage: config.damage,
      attackCooldown: config.attackCooldown,
      currentCooldown: 0,
      gold: 0,
      score: 0,
    });
    entity.addComponent<PlayerTag>('playerTag', {});
    
    // Спрайт игрока
    const playerSprite = this.assets.getImage('player');
    entity.addComponent<SpriteComponent>('sprite', {
      image: playerSprite,
      frameWidth: 32,
      frameHeight: 32,
      frameX: 0,
      frameY: 0,
      flipX: false,
    });
    
    // Анимация игрока
    entity.addComponent<AnimationComponent>('animation', {
      name: 'idle',
      frameRate: 8,
      frames: 4,
      currentFrame: 0,
      timer: 0,
      isPlaying: true,
      loop: true,
    });

    return entity;
  }

  /** Создание врага */
  createEnemy(config: EnemyConfig): Entity {
    const entity = this.world.createEntity();
    
    // Базовые характеристики в зависимости от типа
    const stats = this.getEnemyStats(config.enemyType);
    
    entity.addComponent<PositionComponent>('position', { x: config.x, y: config.y });
    entity.addComponent<HealthComponent>('health', { current: stats.health, max: stats.health });
    entity.addComponent<BoundsComponent>('bounds', { width: stats.width, height: stats.height });
    entity.addComponent<EnemyComponent>('enemy', {
      speed: stats.speed,
      damage: stats.damage,
      rewardGold: stats.rewardGold,
      rewardScore: stats.rewardScore,
      enemyType: config.enemyType,
    });
    entity.addComponent<EnemyTag>('enemyTag', {});
    entity.addComponent<PathFollowingComponent>('pathFollowing', {
      path: config.path,
      currentPointIndex: 0,
      pathProgress: 0,
    });
    
    // Спрайт врага
    const spriteName = `enemy_${config.enemyType}`;
    const enemySprite = this.assets.getImage(spriteName);
    entity.addComponent<SpriteComponent>('sprite', {
      image: enemySprite,
      frameWidth: stats.width,
      frameHeight: stats.height,
      frameX: 0,
      frameY: 0,
      flipX: false,
    });

    return entity;
  }

  /** Создание пули */
  createProjectile(config: ProjectileConfig): Entity {
    const entity = this.world.createEntity();
    
    entity.addComponent<PositionComponent>('position', { x: config.x, y: config.y });
    entity.addComponent<VelocityComponent>('velocity', { vx: config.vx, vy: config.vy });
    entity.addComponent<BoundsComponent>('bounds', { width: 8, height: 8 });
    entity.addComponent<ProjectileComponent>('projectile', {
      speed: config.speed,
      damage: config.damage,
      lifetime: config.lifetime,
      age: 0,
      pierce: config.pierce,
      hitEnemies: [],
    });
    entity.addComponent<ProjectileTag>('projectileTag', {});
    
    // Спрайт пули
    const projectileSprite = this.assets.getImage('projectile');
    entity.addComponent<SpriteComponent>('sprite', {
      image: projectileSprite,
      frameWidth: 8,
      frameHeight: 8,
      frameX: 0,
      frameY: 0,
      flipX: false,
    });

    return entity;
  }

  /** Создание башни */
  createTower(config: TowerConfig): Entity {
    const entity = this.world.createEntity();
    
    const towerStats = this.getTowerStats(config.level);
    
    entity.addComponent<PositionComponent>('position', { x: config.x, y: config.y });
    entity.addComponent<BoundsComponent>('bounds', { width: 48, height: 48 });
    entity.addComponent<TowerComponent>('tower', {
      weapon: {
        damage: towerStats.damage,
        fireRate: towerStats.fireRate,
        range: towerStats.range,
        cooldown: 0,
        currentCooldown: 0,
        projectileSpeed: towerStats.projectileSpeed,
        pierce: 1,
      },
      level: config.level,
      upgradeCost: towerStats.upgradeCost,
      range: towerStats.range,
      targetPriority: config.targetPriority,
    });
    entity.addComponent<TowerTag>('towerTag', {});
    
    // Спрайт башни
    const towerSprite = this.assets.getImage('tower');
    entity.addComponent<SpriteComponent>('sprite', {
      image: towerSprite,
      frameWidth: 48,
      frameHeight: 48,
      frameX: 0,
      frameY: 0,
      flipX: false,
    });

    return entity;
  }

  /** Создание подбираемого предмета */
  createPickup(config: PickupConfig): Entity {
    const entity = this.world.createEntity();
    
    entity.addComponent<PositionComponent>('position', { x: config.x, y: config.y });
    entity.addComponent<BoundsComponent>('bounds', { width: 16, height: 16 });
    entity.addComponent<PickupComponent>('pickup', {
      type: config.type,
      value: config.value,
    });
    
    // Спрайт в зависимости от типа
    const spriteName = `pickup_${config.type}`;
    const pickupSprite = this.assets.getImage(spriteName);
    entity.addComponent<SpriteComponent>('sprite', {
      image: pickupSprite,
      frameWidth: 16,
      frameHeight: 16,
      frameX: 0,
      frameY: 0,
      flipX: false,
    });

    return entity;
  }

  /** Получить характеристики врага по типу */
  private getEnemyStats(type: 'basic' | 'fast' | 'tank' | 'boss'): {
    health: number;
    speed: number;
    damage: number;
    rewardGold: number;
    rewardScore: number;
    width: number;
    height: number;
  } {
    switch (type) {
      case 'basic':
        return { health: 50, speed: 60, damage: 10, rewardGold: 10, rewardScore: 100, width: 32, height: 32 };
      case 'fast':
        return { health: 30, speed: 100, damage: 5, rewardGold: 15, rewardScore: 150, width: 24, height: 24 };
      case 'tank':
        return { health: 150, speed: 40, damage: 20, rewardGold: 25, rewardScore: 250, width: 48, height: 48 };
      case 'boss':
        return { health: 500, speed: 30, damage: 50, rewardGold: 100, rewardScore: 1000, width: 64, height: 64 };
      default:
        return { health: 50, speed: 60, damage: 10, rewardGold: 10, rewardScore: 100, width: 32, height: 32 };
    }
  }

  /** Получить характеристики башни по уровню */
  private getTowerStats(level: number): {
    damage: number;
    fireRate: number;
    range: number;
    projectileSpeed: number;
    upgradeCost: number;
  } {
    const baseDamage = 20;
    const baseFireRate = 1; // выстрелов в секунду
    const baseRange = 150;
    const baseProjectileSpeed = 300;
    const baseUpgradeCost = 50;
    
    return {
      damage: baseDamage * level,
      fireRate: baseFireRate + (level - 1) * 0.2,
      range: baseRange + (level - 1) * 20,
      projectileSpeed: baseProjectileSpeed,
      upgradeCost: baseUpgradeCost * level,
    };
  }
}
