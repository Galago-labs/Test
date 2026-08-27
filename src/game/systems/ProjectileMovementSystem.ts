/**
 * Система движения снарядов
 */

import { System } from '../../engine/ecs/System';
import { World } from '../../engine/ecs/World';
import { PositionComponent, VelocityComponent, ProjectileComponent, BoundsComponent, DestroyedComponent } from '../components/GameComponents';

export class ProjectileMovementSystem extends System {
  update(deltaTime: number): void {
    const projectiles = this.world.query(['position', 'velocity', 'projectile', 'projectileTag']);
    
    for (const entityId of projectiles) {
      const entity = this.world.getEntity(entityId);
      if (!entity) continue;

      const position = entity.getComponent<PositionComponent>('position');
      const velocity = entity.getComponent<VelocityComponent>('velocity');
      const projectile = entity.getComponent<ProjectileComponent>('projectile');
      const bounds = entity.getComponent<BoundsComponent>('bounds');

      // Обновляем возраст снаряда
      projectile.age += deltaTime;
      
      // Проверяем время жизни
      if (projectile.age >= projectile.lifetime) {
        entity.addComponent<DestroyedComponent>('destroyed', { reason: 'lifetime' });
        continue;
      }

      // Двигаем снаряд
      const speed = projectile.speed;
      const length = Math.sqrt(velocity.vx * velocity.vx + velocity.vy * velocity.vy);
      
      if (length > 0) {
        const normalizedVx = velocity.vx / length;
        const normalizedVy = velocity.vy / length;
        
        position.x += normalizedVx * speed * deltaTime;
        position.y += normalizedVy * speed * deltaTime;
      }

      // Проверка выхода за границы экрана
      const canvasWidth = 1920; // TODO: получить из настроек
      const canvasHeight = 1080;
      
      if (position.x < -bounds.width || position.x > canvasWidth ||
          position.y < -bounds.height || position.y > canvasHeight) {
        entity.addComponent<DestroyedComponent>('destroyed', { reason: 'out_of_bounds' });
      }
    }
  }
}
