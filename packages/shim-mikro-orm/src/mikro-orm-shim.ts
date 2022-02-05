import { Constructor, SpecialType, Shim } from "@coussin/core";
import { IdMapEntityPath, addPath } from "@coussin/shared";
import { AnyEntity, Collection, EntityManager, wrap } from "@mikro-orm/core";

export interface MikroOrmShimOption {
  em?: EntityManager;
  entities?: Constructor<any>[];
}

export class MikroOrmShim extends Shim<MikroOrmShimOption> {
  private _em: EntityManager;
  private _entities: Constructor<any>[];

  protected init(option: MikroOrmShimOption): void {
    this._em = option.em;
    this._entities = option.entities.filter(
      (entity) =>
        this._em.getMetadata().get(entity.name)?.primaryKeys.length > 0
    );
  }

  specialTypes(): SpecialType[] {
    const result = this._entities.map((entity) => ({
      type: entity.name,
      toJSON: (data: any) => {
        const cacheEntity = {
          target: wrap(data)?.toJSON() ?? data,
          populate: wrap(data, true)?.__serializationContext.populate,
        };
        return cacheEntity;
      },
      toObject: (data: any) => {
        const { target, populate } = data || {};
        const entityInstance = this._em.merge(entity, target);
        const populateFields = populate?.map((item) => item.field);
        for (const key in target) {
          const element = entityInstance[key];
          wrap(element)?.populated?.(populateFields.includes(key));
        }
        wrap(entityInstance)?.populated?.(false);
        return entityInstance;
      },
    }));
    return result;
  }

  collect<T extends AnyEntity>(
    target: T,
    idMapEntity: IdMapEntityPath = new Map(),
    path = "$"
  ) {
    if (!target) {
      return;
    }
    if (typeof target !== "object") {
      return;
    }

    if (
      (target instanceof Collection && target.isInitialized()) ||
      Array.isArray(target)
    ) {
      for (let index = 0; index < target.length; index++) {
        const element = target[index];
        this.collect(element, idMapEntity, addPath(path, index));
      }
      return;
    }

    if (!this.isEntity(target)) {
      return;
    }

    const entityId = target.id;
    const entity = idMapEntity.get(entityId);
    if (entity) {
      return;
    }

    idMapEntity.set(entityId, { entity: target, path } as any);

    for (const key in target) {
      const element = target[key];
      this.collect(element, idMapEntity, addPath(path, key));
    }

    return idMapEntity;
  }

  isEntity<T>(target: T) {
    return this._entities.some((entity) => target instanceof entity);
  }
}
