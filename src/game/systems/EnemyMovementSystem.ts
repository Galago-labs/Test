/**
 * Система движения врагов по пути
 */

import { System } from '../../engine/ecs/System';
import { World } from '../../engine/ecs/World';
import { PositionComponent, EnemyComponent, PathFollowingComponent, HealthComponent } from '../components/GameComponents';
import { Vector2 } from '../../engine/math/Vector2';

export class EnemyMovementSystem extends System {
  update(deltaTime: number): void {
    const enemies = this.world.query(['position', 'enemy', 'pathFollowing', 'enemyTag']);
    
    for (const entityId of enemies) {
      const entity = this.world.getEntity(entityId);
      if (!entity) continue;

      const position = entity.getComponent<PositionComponent>('position');
      const enemy = entity.getComponent<EnemyComponent>('enemy');
      const pathFollowing = entity.getComponent<PathFollowingComponent>('pathFollowing');

      // Если путь пуст или достигнут конец пути
      if (pathFollowing.path.length === 0 || 
          pathFollowing.currentPointIndex >= pathFollowing.path.length) {
        continue;
      }

      // Получаем текущую целевую точку
      const targetPoint = pathFollowing.path[pathFollowing.currentPointIndex];
      
      // Вычисляем направление к цели
      const direction = new Vector2(
        targetPoint.x - position.x,
        targetPoint.y - position.y
      );
      
      const distance = direction.length();
      
      // Если достигли точки пути
      if (distance < 5) {
        pathFollowing.currentPointIndex++;
        continue;
      }
      
      // Нормализуем и применяем скорость
      direction.normalize();
      position.x += direction.x * enemy.speed * deltaTime;
      position.y += direction.y * enemy.speed * deltaTime;
    }
  }
}
