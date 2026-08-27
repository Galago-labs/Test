import { System } from '../../engine/ecs/System';
import { EntityId } from '../../engine/ecs/ComponentStore';
import { PositionComponent, EnemyComponent, PathFollowingComponent } from '../components/GameComponents';

export class EnemyMovementSystem extends System {
  constructor() {
    super();
  }

  update(deltaTime: number): void {
    const positionStore = this.getStore<PositionComponent>('position');
    const enemyStore = this.getStore<EnemyComponent>('enemy');
    const pathStore = this.getStore<PathFollowingComponent>('pathFollowing');

    if (!positionStore || !enemyStore || !pathStore) return;

    for (const entityId of this.getActiveEntities()) {
      const position = positionStore.get(entityId);
      const enemy = enemyStore.get(entityId);
      const pathFollowing = pathStore.get(entityId);

      if (!position || !enemy || !pathFollowing || pathFollowing.path.length === 0) continue;

      const targetPoint = pathFollowing.path[pathFollowing.currentPointIndex];
      const dx = targetPoint.x - position.x;
      const dy = targetPoint.y - position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 5) {
        pathFollowing.currentPointIndex = (pathFollowing.currentPointIndex + 1) % pathFollowing.path.length;
        continue;
      }

      const vx = (dx / distance) * enemy.speed;
      const vy = (dy / distance) * enemy.speed;

      position.x += vx * deltaTime;
      position.y += vy * deltaTime;
    }
  }

  private getActiveEntities(): EntityId[] {
    const positionStore = this.getStore<PositionComponent>('position');
    const enemyStore = this.getStore<EnemyComponent>('enemy');
    const pathStore = this.getStore<PathFollowingComponent>('pathFollowing');

    if (!positionStore || !enemyStore || !pathStore) return [];

    const result: EntityId[] = [];
    for (const entityId of positionStore.keys()) {
      if (enemyStore.has(entityId) && pathStore.has(entityId)) {
        result.push(entityId);
      }
    }
    return result;
  }
}
