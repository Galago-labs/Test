import { Vector2 } from '../math/Vector2';

export class Camera2D {
  position: Vector2 = new Vector2(0, 0);
  zoom: number = 1;
  viewportWidth: number = 480;
  viewportHeight: number = 270;

  constructor(viewportWidth: number = 480, viewportHeight: number = 270) {
    this.viewportWidth = viewportWidth;
    this.viewportHeight = viewportHeight;
  }

  worldToScreen(worldPos: Vector2): Vector2 {
    return new Vector2(
      (worldPos.x - this.position.x) * this.zoom + this.viewportWidth / 2,
      (worldPos.y - this.position.y) * this.zoom + this.viewportHeight / 2
    );
  }

  screenToWorld(screenPos: Vector2): Vector2 {
    return new Vector2(
      (screenPos.x - this.viewportWidth / 2) / this.zoom + this.position.x,
      (screenPos.y - this.viewportHeight / 2) / this.zoom + this.position.y
    );
  }

  lookAt(target: Vector2): void {
    this.position = target.clone();
  }

  clampToBounds(minX: number, minY: number, maxX: number, maxY: number): void {
    const halfViewW = (this.viewportWidth / this.zoom) / 2;
    const halfViewH = (this.viewportHeight / this.zoom) / 2;

    this.position.x = Math.max(minX + halfViewW, Math.min(maxX - halfViewW, this.position.x));
    this.position.y = Math.max(minY + halfViewH, Math.min(maxY - halfViewH, this.position.y));
  }
}
