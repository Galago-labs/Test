export type EntityId = number;

export interface Component {
  [key: string]: any;
}

export class ComponentStore<T extends Component> {
  private components: Map<EntityId, T> = new Map();

  set(entityId: EntityId, component: T): void {
    this.components.set(entityId, component);
  }

  get(entityId: EntityId): T | undefined {
    return this.components.get(entityId);
  }

  has(entityId: EntityId): boolean {
    return this.components.has(entityId);
  }

  delete(entityId: EntityId): void {
    this.components.delete(entityId);
  }

  clear(): void {
    this.components.clear();
  }

  entries(): IterableIterator<[EntityId, T]> {
    return this.components.entries();
  }

  keys(): IterableIterator<EntityId> {
    return this.components.keys();
  }
}
