/**
 * Система движения игрока
 */

import { System } from '../../engine/ecs/System';
import { World } from '../../engine/ecs/World';
import { Entity } from '../../engine/ecs/Entity';
import { Time } from '../../engine/core/Time';
import { InputManager } from '../../engine/input/InputManager';
import { PositionComponent, VelocityComponent, PlayerComponent, BoundsComponent } from '../components/GameComponents';

export class PlayerMovementSystem extends System {
  private input: InputManager;

  constructor(world: World, input: InputManager) {
    super(world);
    this.input = input;
  }

  update(deltaTime: number): void {
    const players = this.world.query(['position', 'velocity', 'player', 'playerTag']);
    
    for (const entityId of players) {
      const entity = this.world.getEntity(entityId);
      if (!entity) continue;

      const position = entity.getComponent<PositionComponent>('position');
      const velocity = entity.getComponent<VelocityComponent>('velocity');
      const player = entity.getComponent<PlayerComponent>('player');

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

      // Ограничиваем позицию границами экрана
      const bounds = entity.getComponent<BoundsComponent>('bounds');
      const canvasWidth = this.input.getCanvasWidth();
      const canvasHeight = this.input.getCanvasHeight();

      position.x = Math.max(0, Math.min(canvasWidth - bounds.width, position.x));
      position.y = Math.max(0, Math.min(canvasHeight - bounds.height, position.y));
    }
  }
}
