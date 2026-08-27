/**
 * Система коллизий
 */

import { System } from '../../engine/ecs/System';
import { World } from '../../engine/ecs/World';
import { audio } from '../../engine/audio/SynthAudio';
import { 
  PositionComponent, 
  BoundsComponent, 
  HealthComponent, 
  ProjectileComponent, 
  EnemyComponent, 
  PlayerComponent,
  EnemyTag,
  ProjectileTag,
  PlayerTag,
  DestroyedComponent,
  PickupComponent,
} from '../components/GameComponents';
import { Rect } from '../../engine/math/Rect';

export class CollisionSystem extends System {
  update(deltaTime: number): void {
    this.checkProjectileEnemyCollisions();
    this.checkPlayerEnemyCollisions();
    this.checkPlayerPickupCollisions();
  }

  private checkProjectileEnemyCollisions(): void {
    const projectiles = this.world.query(['position', 'bounds', 'projectile', 'projectileTag']);
    const enemies = this.world.query(['position', 'bounds', 'enemy', 'enemyTag', 'health']);

    for (const projId of projectiles) {
      const projectileEntity = this.world.getEntity(projId);
      if (!projectileEntity) continue;
      
      const projPosition = projectileEntity.getComponent<PositionComponent>('position');
      const projBounds = projectileEntity.getComponent<BoundsComponent>('bounds');
      const projectile = projectileEntity.getComponent<ProjectileComponent>('projectile');
      
      const projRect = new Rect(projPosition.x, projPosition.y, projBounds.width, projBounds.height);

      for (const enemyId of enemies) {
        // Пропускаем врагов, которых уже задел этот снаряд
        if (projectile.hitEnemies.includes(enemyId)) {
          continue;
        }

        const enemyEntity = this.world.getEntity(enemyId);
        if (!enemyEntity) continue;
        
        const enemyPosition = enemyEntity.getComponent<PositionComponent>('position');
        const enemyBounds = enemyEntity.getComponent<BoundsComponent>('bounds');
        const health = enemyEntity.getComponent<HealthComponent>('health');
        
        const enemyRect = new Rect(enemyPosition.x, enemyPosition.y, enemyBounds.width, enemyBounds.height);

        if (projRect.intersects(enemyRect)) {
          // Наносим урон
          health.current -= projectile.damage;
          
          // Помечаем врага как задетого этим снарядом
          projectile.hitEnemies.push(enemyId);
          
          // Воспроизводим звук попадания
          audio.playHit();
          
          // Проверяем смерть врага
          if (health.current <= 0) {
            enemyEntity.addComponent<DestroyedComponent>('destroyed', { reason: 'killed' });
          }
          
          // Проверяем пробитие
          projectile.pierce--;
          if (projectile.pierce <= 0) {
            projectileEntity.addComponent<DestroyedComponent>('destroyed', { reason: 'hit' });
            break;
          }
        }
      }
    }
  }

  private checkPlayerEnemyCollisions(): void {
    const players = this.world.query(['position', 'bounds', 'player', 'playerTag', 'health']);
    const enemies = this.world.query(['position', 'bounds', 'enemy', 'enemyTag']);

    for (const playerId of players) {
      const playerEntity = this.world.getEntity(playerId);
      if (!playerEntity) continue;
      
      const playerPosition = playerEntity.getComponent<PositionComponent>('position');
      const playerBounds = playerEntity.getComponent<BoundsComponent>('bounds');
      const playerHealth = playerEntity.getComponent<HealthComponent>('health');
      
      const playerRect = new Rect(playerPosition.x, playerPosition.y, playerBounds.width, playerBounds.height);

      for (const enemyId of enemies) {
        const enemyEntity = this.world.getEntity(enemyId);
        if (!enemyEntity) continue;
        
        const enemyPosition = enemyEntity.getComponent<PositionComponent>('position');
        const enemyBounds = enemyEntity.getComponent<BoundsComponent>('bounds');
        const enemy = enemyEntity.getComponent<EnemyComponent>('enemy');
        
        const enemyRect = new Rect(enemyPosition.x, enemyPosition.y, enemyBounds.width, enemyBounds.height);

        if (playerRect.intersects(enemyRect)) {
          // Наносим урон игроку
          playerHealth.current -= enemy.damage * deltaTime;
          
          // Воспроизводим звук получения урона
          audio.playHit();
        }
      }
    }
  }

  private checkPlayerPickupCollisions(): void {
    const players = this.world.query(['position', 'bounds', 'player', 'playerTag']);
    const pickups = this.world.query(['position', 'bounds', 'pickup']);

    for (const playerId of players) {
      const playerEntity = this.world.getEntity(playerId);
      if (!playerEntity) continue;
      
      const playerPosition = playerEntity.getComponent<PositionComponent>('position');
      const playerBounds = playerEntity.getComponent<BoundsComponent>('bounds');
      const player = playerEntity.getComponent<PlayerComponent>('player');
      const playerHealth = playerEntity.getComponent<HealthComponent>('health');
      
      const playerRect = new Rect(playerPosition.x, playerPosition.y, playerBounds.width, playerBounds.height);

      for (const pickupId of pickups) {
        const pickupEntity = this.world.getEntity(pickupId);
        if (!pickupEntity) continue;
        
        const pickupPosition = pickupEntity.getComponent<PositionComponent>('position');
        const pickupBounds = pickupEntity.getComponent<BoundsComponent>('bounds');
        const pickup = pickupEntity.getComponent<PickupComponent>('pickup');
        
        const pickupRect = new Rect(pickupPosition.x, pickupPosition.y, pickupBounds.width, pickupBounds.height);

        if (playerRect.intersects(pickupRect)) {
          // Подбираем предмет в зависимости от типа
          switch (pickup.type) {
            case 'gold':
              player.gold += pickup.value;
              audio.playCollect();
              break;
            case 'health':
              playerHealth.current = Math.min(playerHealth.max, playerHealth.current + pickup.value);
              audio.playCollect();
              break;
            case 'upgrade':
              // TODO: логика улучшения
              break;
          }
          
          // Уничтожаем подобранный предмет
          pickupEntity.addComponent<DestroyedComponent>('destroyed', { reason: 'collected' });
        }
      }
    }
  }
}
