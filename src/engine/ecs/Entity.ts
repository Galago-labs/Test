import { EntityId } from './ComponentStore';

export class Entity {
  constructor(public readonly id: EntityId) {}
}

export class EntityPool {
  private nextId: EntityId = 0;
  private active: Set<EntityId> = new Set();
  private recycled: EntityId[] = [];

  create(): Entity {
    let id: EntityId;
    if (this.recycled.length > 0) {
      id = this.recycled.pop()!;
    } else {
      id = this.nextId++;
    }
    this.active.add(id);
    return new Entity(id);
  }

  destroy(id: EntityId): void {
    this.active.delete(id);
    this.recycled.push(id);
  }

  isActive(id: EntityId): boolean {
    return this.active.has(id);
  }

  getActiveEntities(): EntityId[] {
    return Array.from(this.active);
  }

  clear(): void {
    this.active.clear();
    this.recycled = [];
  }
}
