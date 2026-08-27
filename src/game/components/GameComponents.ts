/**
 * Компоненты игровых объектов
 */

import { Vector2 } from '../../engine/math/Vector2';

/** Базовый компонент позиции */
export interface PositionComponent {
  x: number;
  y: number;
}

/** Компонент скорости */
export interface VelocityComponent {
  vx: number;
  vy: number;
}

/** Компонент здоровья */
export interface HealthComponent {
  current: number;
  max: number;
}

/** Компонент размера для коллизий */
export interface BoundsComponent {
  width: number;
  height: number;
}

/** Компонент спрайта */
export interface SpriteComponent {
  image: HTMLImageElement | null;
  frameWidth: number;
  frameHeight: number;
  frameX: number;
  frameY: number;
  flipX: boolean;
}

/** Компонент анимации */
export interface AnimationComponent {
  name: string;
  frameRate: number;
  frames: number;
  currentFrame: number;
  timer: number;
  isPlaying: boolean;
  loop: boolean;
}

/** Компонент игрока */
export interface PlayerComponent {
  speed: number;
  damage: number;
  attackCooldown: number;
  currentCooldown: number;
  gold: number;
  score: number;
}

/** Компонент врага */
export interface EnemyComponent {
  speed: number;
  damage: number;
  rewardGold: number;
  rewardScore: number;
  enemyType: 'basic' | 'fast' | 'tank' | 'boss';
}

/** Компонент пули/снаряда */
export interface ProjectileComponent {
  speed: number;
  damage: number;
  lifetime: number;
  age: number;
  pierce: number; // количество пробитий
  hitEnemies: number[]; // ID врагов, которых уже задел снаряд
}

/** Компонент оружия */
export interface WeaponComponent {
  damage: number;
  fireRate: number;
  range: number;
  cooldown: number;
  currentCooldown: number;
  projectileSpeed: number;
  pierce: number;
}

/** Компонент башни */
export interface TowerComponent {
  weapon: WeaponComponent;
  level: number;
  upgradeCost: number;
  range: number;
  targetPriority: 'closest' | 'strongest' | 'weakest' | 'first';
}

/** Компонент цели для ИИ */
export interface TargetComponent {
  targetId: number | null;
}

/** Компонент состояния (для конечного автомата) */
export interface StateComponent {
  currentState: string;
  stateData: Record<string, any>;
}

/** Компонент пути (для движения по пути) */
export interface PathFollowingComponent {
  path: Vector2[];
  currentPointIndex: number;
  pathProgress: number;
}

/** Компонент спавнера */
export interface SpawnerComponent {
  spawnInterval: number;
  timeSinceLastSpawn: number;
  enemiesToSpawn: string[];
  isActive: boolean;
  spawnPoint: Vector2;
}

/** Компонент зоны поражения (для башен) */
export interface AttackZoneComponent {
  radius: number;
}

/** Маркерный компонент - объект уничтожается */
export interface DestroyedComponent {
  reason: string;
}

/** Маркерный компонент - это игрок */
export interface PlayerTag {}

/** Маркерный компонент - это враг */
export interface EnemyTag {}

/** Маркерный компонент - это пуля */
export interface ProjectileTag {}

/** Маркерный компонент - это башня */
export interface TowerTag {}

/** Маркерный компонент - это ресурс/подбираемый предмет */
export interface PickupComponent {
  type: 'gold' | 'health' | 'upgrade';
  value: number;
}

// Экспортируем типы всех компонентов для использования в ECS
export type ComponentTypes = 
  | PositionComponent
  | VelocityComponent
  | HealthComponent
  | BoundsComponent
  | SpriteComponent
  | AnimationComponent
  | PlayerComponent
  | EnemyComponent
  | ProjectileComponent
  | WeaponComponent
  | TowerComponent
  | TargetComponent
  | StateComponent
  | PathFollowingComponent
  | SpawnerComponent
  | AttackZoneComponent
  | DestroyedComponent
  | PlayerTag
  | EnemyTag
  | ProjectileTag
  | TowerTag
  | PickupComponent;
