import { EntityId, Component } from './ComponentStore';
import { EntityPool } from './Entity';

type DeferredCommand = 
  | { type: 'spawn'; entityId: EntityId; components: Map<string, Component> }
  | { type: 'destroy'; entityId: EntityId };

export class Commands {
  private commands: DeferredCommand[] = [];
  private entityPool: EntityPool;

  constructor(entityPool: EntityPool) {
    this.entityPool = entityPool;
  }

  spawn(components: Map<string, Component>): EntityId {
    const entityId = this.entityPool.create().id;
    this.commands.push({ type: 'spawn', entityId, components });
    return entityId;
  }

  destroy(entityId: EntityId): void {
    this.commands.push({ type: 'destroy', entityId });
  }

  execute(
    addComponent: (entityId: EntityId, name: string, component: Component) => void,
    removeComponent: (entityId: EntityId, name: string) => void,
    onEntityDestroyed: (entityId: EntityId) => void
  ): void {
    for (const cmd of this.commands) {
      if (cmd.type === 'spawn') {
        for (const [name, component] of cmd.components.entries()) {
          addComponent(cmd.entityId, name, component);
        }
      } else if (cmd.type === 'destroy') {
        onEntityDestroyed(cmd.entityId);
      }
    }
    this.commands = [];
  }

  clear(): void {
    this.commands = [];
  }
}
