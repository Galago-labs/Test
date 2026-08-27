import { EntityId, Component } from './ComponentStore';

export class Entity {
  public readonly id: EntityId;
  private componentStores: Map<string, any>;

  constructor(id: EntityId, componentStores: Map<string, any>) {
    this.id = id;
    this.componentStores = componentStores;
  }

  addComponent<T extends Component>(name: string, component: T): void {
    const store = this.componentStores.get(name);
    if (store) {
      store.set(this.id, component);
    }
  }

  getComponent<T extends Component>(name: string): T | undefined {
    const store = this.componentStores.get(name);
    return store?.get(this.id);
  }

  hasComponent(name: string): boolean {
    const store = this.componentStores.get(name);
    return store?.has(this.id) ?? false;
  }
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
    return new Entity(id, new Map()); // Компоненты добавляются через World
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
