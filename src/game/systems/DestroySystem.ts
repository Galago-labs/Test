/**
 * Система уничтожения объектов
 */

import { System } from '../../engine/ecs/System';
import { World } from '../../engine/ecs/World';
import { DestroyedComponent } from '../components/GameComponents';

export class DestroySystem extends System {
  update(deltaTime: number): void {
    const destroyed = this.world.query(['destroyed']);
    
    for (const entityId of destroyed) {
      // Просто помечаем на удаление - World сам удалит сущность
      this.world.destroyEntity(entityId);
    }
  }
}
