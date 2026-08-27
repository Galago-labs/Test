/**
 * Система наград за убийство врагов
 */

import { System } from '../../engine/ecs/System';
import { World } from '../../engine/ecs/World';
import { EnemyComponent, HealthComponent, PlayerComponent, DestroyedComponent } from '../components/GameComponents';

export class RewardSystem extends System {
  update(deltaTime: number): void {
    // Находим всех убитых врагов (у которых есть destroyed и enemy компоненты)
    const allEntities = this.world.getAllEntities();
    
    for (const entityId of allEntities) {
      const entity = this.world.getEntity(entityId);
      if (!entity) continue;
      
      // Проверяем, есть ли у сущности компоненты enemy и destroyed
      const enemy = entity.getComponent<EnemyComponent>('enemy');
      const destroyed = entity.getComponent<DestroyedComponent>('destroyed');
      
      if (enemy && destroyed && destroyed.reason === 'killed') {
        // Находим игрока и начисляем награду
        const players = this.world.query(['player', 'playerTag']);
        
        for (const playerId of players) {
          const playerEntity = this.world.getEntity(playerId);
          if (!playerEntity) continue;
          
          const player = playerEntity.getComponent<PlayerComponent>('player');
          
          // Начисляем золото и очки
          player.gold += enemy.rewardGold;
          player.score += enemy.rewardScore;
        }
        
        // Удаляем компонент destroyed, чтобы не начислить награду дважды
        entity.removeComponent('destroyed');
      }
    }
  }
}
