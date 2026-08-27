import { EntityId, Component, ComponentStore } from './ComponentStore';
import { EntityPool } from './Entity';
import { System } from './System';
import { Commands } from './Commands';

export class World {
  private entityPool: EntityPool;
  private componentStores: Map<string, ComponentStore<any>> = new Map();
  private systems: System[] = [];
  private commands: Commands;

  constructor() {
    this.entityPool = new EntityPool();
    this.commands = new Commands(this.entityPool);
  }

  createComponentStore<T extends Component>(name: string): ComponentStore<T> {
    const store = new ComponentStore<T>();
    this.componentStores.set(name, store as ComponentStore<any>);
    return store;
  }

  getComponentStore<T extends Component>(name: string): ComponentStore<T> | undefined {
    return this.componentStores.get(name) as ComponentStore<T> | undefined;
  }

  addSystem(system: System): void {
    // Register all component stores with the system
    for (const [name, store] of this.componentStores.entries()) {
      system.registerStore(name, store);
    }
    this.systems.push(system);
  }

  spawn(components: Map<string, Component>): EntityId {
    return this.commands.spawn(components);
  }

  destroy(entityId: EntityId): void {
    this.commands.destroy(entityId);
  }

  addComponent(entityId: EntityId, name: string, component: Component): void {
    const store = this.componentStores.get(name);
    if (store) {
      store.set(entityId, component);
    }
  }

  removeComponent(entityId: EntityId, name: string): void {
    const store = this.componentStores.get(name);
    if (store) {
      store.delete(entityId);
    }
  }

  getComponent<T extends Component>(entityId: EntityId, name: string): T | undefined {
    const store = this.componentStores.get(name) as ComponentStore<T> | undefined;
    return store?.get(entityId);
  }

  hasComponent(entityId: EntityId, name: string): boolean {
    const store = this.componentStores.get(name);
    return store?.has(entityId) ?? false;
  }

  isActive(entityId: EntityId): boolean {
    return this.entityPool.isActive(entityId);
  }

  update(dt: number): void {
    // Execute deferred commands first
    this.commands.execute(
      (id, name, comp) => this.addComponent(id, name, comp),
      (id, name) => this.removeComponent(id, name),
      (id) => this.entityPool.destroy(id)
    );

    // Update all systems
    for (const system of this.systems) {
      system.update(dt);
    }
  }

  clear(): void {
    this.entityPool.clear();
    for (const store of this.componentStores.values()) {
      store.clear();
    }
    this.systems = [];
    this.commands.clear();
  }
}
