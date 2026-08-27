import { EntityId, ComponentStore } from './ComponentStore';

export class Query {
  private requiredStores: string[];
  private optionalStores: string[];

  constructor(required: string[] = [], optional: string[] = []) {
    this.requiredStores = required;
    this.optionalStores = optional;
  }

  execute(stores: Map<string, ComponentStore<any>>): EntityId[] {
    const results: EntityId[] = [];
    
    // Get all entities from first required store or all stores combined
    let candidateEntities: Set<EntityId>;
    
    if (this.requiredStores.length > 0) {
      const firstStore = stores.get(this.requiredStores[0]);
      if (!firstStore) return results;
      candidateEntities = new Set(Array.from(firstStore.entries()).map(([id]) => id));
      
      // Filter by other required stores
      for (let i = 1; i < this.requiredStores.length; i++) {
        const store = stores.get(this.requiredStores[i]);
        if (!store) return results;
        const storeEntities = new Set(Array.from(store.entries()).map(([id]) => id));
        candidateEntities = new Set([...candidateEntities].filter(e => storeEntities.has(e)));
      }
    } else {
      // No required stores, collect from optional stores
      candidateEntities = new Set();
      for (const storeName of this.optionalStores) {
        const store = stores.get(storeName);
        if (store) {
          Array.from(store.entries()).forEach(([id]) => candidateEntities.add(id));
        }
      }
    }

    // Check optional stores don't exclude anything (they're truly optional)
    results.push(...candidateEntities);
    return results;
  }

  matches(entityId: EntityId, stores: Map<string, ComponentStore<any>>): boolean {
    // Check all required components exist
    for (const storeName of this.requiredStores) {
      const store = stores.get(storeName);
      if (!store || !store.has(entityId)) {
        return false;
      }
    }
    return true;
  }
}
