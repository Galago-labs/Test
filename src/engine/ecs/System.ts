import { EntityId, Component, ComponentStore } from './ComponentStore';

export abstract class System {
  protected stores: Map<string, ComponentStore<any>> = new Map();

  registerStore<T extends Component>(name: string, store: ComponentStore<T>): void {
    this.stores.set(name, store as ComponentStore<any>);
  }

  getStore<T extends Component>(name: string): ComponentStore<T> | undefined {
    return this.stores.get(name) as ComponentStore<T> | undefined;
  }

  abstract update(dt: number): void;
}
