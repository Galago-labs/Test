/**
 * Система отрисовки игровых объектов
 */

import { System } from '../../engine/ecs/System';
import { World } from '../../engine/ecs/World';
import { Renderer2D } from '../../engine/render/Renderer2D';
import { Camera2D } from '../../engine/render/Camera2D';
import { PositionComponent, SpriteComponent, BoundsComponent, AnimationComponent } from '../components/GameComponents';

export class RenderSystem extends System {
  private renderer: Renderer2D;
  private camera: Camera2D;

  constructor(world: World, renderer: Renderer2D, camera: Camera2D) {
    super(world);
    this.renderer = renderer;
    this.camera = camera;
  }

  update(deltaTime: number): void {
    const entities = this.world.query(['position', 'sprite']);
    
    for (const entityId of entities) {
      const entity = this.world.getEntity(entityId);
      if (!entity) continue;

      const position = entity.getComponent<PositionComponent>('position');
      const sprite = entity.getComponent<SpriteComponent>('sprite');
      
      // Обновляем анимацию если есть
      const animation = entity.getComponent<AnimationComponent>('animation');
      if (animation && animation.isPlaying) {
        animation.timer += deltaTime;
        
        const frameDuration = 1 / animation.frameRate;
        while (animation.timer >= frameDuration) {
          animation.timer -= frameDuration;
          animation.currentFrame++;
          
          if (animation.currentFrame >= animation.frames) {
            if (animation.loop) {
              animation.currentFrame = 0;
            } else {
              animation.currentFrame = animation.frames - 1;
              animation.isPlaying = false;
            }
          }
        }
        
        // Обновляем кадр спрайта
        if (sprite && animation) {
          sprite.frameX = animation.currentFrame;
        }
      }

      // Отрисовываем спрайт
      if (sprite && sprite.image) {
        this.renderer.drawSprite(
          sprite.image,
          position.x,
          position.y,
          sprite.frameWidth,
          sprite.frameHeight,
          sprite.frameX,
          sprite.frameY,
          sprite.flipX
        );
      } else {
        // Если нет спрайта, рисуем прямоугольник-заглушку
        const bounds = entity.getComponent<BoundsComponent>('bounds');
        if (bounds) {
          this.renderer.drawRect(position.x, position.y, bounds.width, bounds.height, '#ff00ff');
        }
      }
    }
  }
}
