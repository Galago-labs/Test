/**
 * Система движения игрока
 */

import { System } from '../../engine/ecs/System';
import { EntityId } from '../../engine/ecs/ComponentStore';
import { InputManager } from '../../engine/input/InputManager';
import { PositionComponent, VelocityComponent, PlayerComponent, BoundsComponent } from '../components/GameComponents';

export class PlayerMovementSystem extends System {
  private input: InputManager;

  constructor(input: InputManager) {
    super();
    this.input = input;
  }

  update(deltaTime: number): void {
    const positionStore = this.getStore<PositionComponent>('position');
    const velocityStore = this.getStore<VelocityComponent>('velocity');
    const playerStore = this.getStore<PlayerComponent>('player');
    const boundsStore = this.getStore<BoundsComponent>('bounds');

    if (!positionStore || !velocityStore || !playerStore || !boundsStore) return;

    // Находим всех игроков
    for (const entityId of this.getActiveEntities()) {
      if (!playerStore.has(entityId)) continue;

      const position = positionStore.get(entityId);
      const velocity = velocityStore.get(entityId);
      const player = playerStore.get(entityId);
      const bounds = boundsStore.get(entityId);

      if (!position || !velocity || !player || !bounds) continue;

      // Сбрасываем скорость
      velocity.vx = 0;
      velocity.vy = 0;

      // Получаем ввод
      if (this.input.isKeyDown('KeyW') || this.input.isKeyDown('ArrowUp')) {
        velocity.vy = -player.speed;
      }
      if (this.input.isKeyDown('KeyS') || this.input.isKeyDown('ArrowDown')) {
        velocity.vy = player.speed;
      }
      if (this.input.isKeyDown('KeyA') || this.input.isKeyDown('ArrowLeft')) {
        velocity.vx = -player.speed;
      }
      if (this.input.isKeyDown('KeyD') || this.input.isKeyDown('ArrowRight')) {
        velocity.vx = player.speed;
      }

      // Нормализуем диагональное движение
      if (velocity.vx !== 0 && velocity.vy !== 0) {
        const factor = 1 / Math.sqrt(2);
        velocity.vx *= factor;
        velocity.vy *= factor;
      }

      // Применяем движение
      position.x += velocity.vx * deltaTime;
      position.y += velocity.vy * deltaTime;

      // Ограничиваем позицию границами экрана (предполагаем canvas 800x600)
      const canvasWidth = 800;
      const canvasHeight = 600;

      position.x = Math.max(0, Math.min(canvasWidth - bounds.width, position.x));
      position.y = Math.max(0, Math.min(canvasHeight - bounds.height, position.y));
    }
  }

  private getActiveEntities(): EntityId[] {
    const positionStore = this.getStore<PositionComponent>('position');
    const velocityStore = this.getStore<VelocityComponent>('velocity');
    const playerStore = this.getStore<PlayerComponent>('player');
    
    if (!positionStore || !velocityStore || !playerStore) return [];
    
    const result: EntityId[] = [];
    for (const entityId of positionStore.keys()) {
      if (velocityStore.has(entityId) && playerStore.has(entityId)) {
        result.push(entityId);
      }
    }
    return result;
  }
}
