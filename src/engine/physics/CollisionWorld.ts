export enum CollisionLayer {
  None = 0,
  Walls = 1 << 0,
  Player = 1 << 1,
  Enemies = 1 << 2,
  Projectiles = 1 << 3,
  Pickups = 1 << 4,
  All = 0xFFFF,
}

export interface Collider {
  x: number;
  y: number;
  width: number;
  height: number;
  layer: CollisionLayer;
  mask: CollisionLayer;
  isTrigger?: boolean;
}

export class CollisionWorld {
  private colliders: Collider[] = [];

  add(collider: Collider): void {
    this.colliders.push(collider);
  }

  remove(collider: Collider): void {
    const index = this.colliders.indexOf(collider);
    if (index !== -1) {
      this.colliders.splice(index, 1);
    }
  }

  clear(): void {
    this.colliders = [];
  }

  checkCollision(a: Collider, b: Collider): boolean {
    // Check layer mask
    if ((a.layer & b.mask) === 0 || (b.layer & a.mask) === 0) {
      return false;
    }

    // AABB collision
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
  }

  collideWith(collidable: Collider): Collider[] {
    const results: Collider[] = [];
    for (const other of this.colliders) {
      if (other !== collidable && this.checkCollision(collidable, other)) {
        results.push(other);
      }
    }
    return results;
  }

  moveAndCollide(
    collider: Collider,
    dx: number,
    dy: number
  ): { x: number; y: number; collided: boolean } {
    let newX = collider.x + dx;
    let newY = collider.y + dy;
    let collided = false;

    // Test X movement
    const testX: Collider = { ...collider, x: newX };
    const hitsX = this.collideWith(testX);
    if (hitsX.length > 0) {
      collided = true;
      // Simple resolution - don't move
      newX = collider.x;
    }

    // Test Y movement
    const testY: Collider = { ...collider, y: newY };
    const hitsY = this.collideWith(testY);
    if (hitsY.length > 0) {
      collided = true;
      // Simple resolution - don't move
      newY = collider.y;
    }

    return { x: newX, y: newY, collided };
  }

  getAllColliders(): Collider[] {
    return [...this.colliders];
  }
}
