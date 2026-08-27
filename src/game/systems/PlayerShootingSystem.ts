/**
 * Система стрельбы игрока
 */

import { System } from '../../engine/ecs/System';
import { World } from '../../engine/ecs/World';
import { InputManager } from '../../engine/input/InputManager';
import { audio } from '../../engine/audio/SynthAudio';
import { PositionComponent, PlayerComponent, BoundsComponent } from '../components/GameComponents';
import { EntityFactory } from '../factories/EntityFactory';

export class PlayerShootingSystem extends System {
  private input: InputManager;
  private entityFactory: EntityFactory;

  constructor(world: World, input: InputManager, entityFactory: EntityFactory) {
    super(world);
    this.input = input;
    this.entityFactory = entityFactory;
  }

  update(deltaTime: number): void {
    const players = this.world.query(['position', 'player', 'playerTag']);
    
    for (const entityId of players) {
      const entity = this.world.getEntity(entityId);
      if (!entity) continue;

      const position = entity.getComponent<PositionComponent>('position');
      const player = entity.getComponent<PlayerComponent>('player');
      const bounds = entity.getComponent<BoundsComponent>('bounds');

      // Обновляем кулдаун
      if (player.currentCooldown > 0) {
        player.currentCooldown -= deltaTime;
      }

      // Проверяем ввод стрельбы
      if (this.input.isMouseDown(0) && player.currentCooldown <= 0) {
        // Получаем позицию мыши в мире
        const mousePos = this.input.getMouseWorldPosition();
        
        // Вычисляем направление к мыши
        const centerX = position.x + bounds.width / 2;
        const centerY = position.y + bounds.height / 2;
        
        const dx = mousePos.x - centerX;
        const dy = mousePos.y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
          const vx = (dx / distance) * player.damage;
          const vy = (dy / distance) * player.damage;
          
          // Создаем пулю
          this.entityFactory.createProjectile({
            x: centerX,
            y: centerY,
            vx: vx,
            vy: vy,
            damage: player.damage,
            speed: 500,
            lifetime: 2,
            pierce: 1,
          });
          
          // Воспроизводим звук выстрела
          audio.playShoot();
          
          // Сбрасываем кулдаун
          player.currentCooldown = player.attackCooldown;
        }
      }
    }
  }
}
