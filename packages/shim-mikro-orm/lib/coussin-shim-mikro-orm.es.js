import 'jsonpath';
import { wrap, Collection } from '@mikro-orm/core';

/**
 * 序列化
 * 1 - 实体对象 转 JSON
 * 2 - JSON 序列化
 */
/**
 * 反序列化
 * 1 - JSON 反序列化
 * 2 - JSON 转 实体对象
 */

class Shim {
    constructor(option) {
        this.init(option);
    }
    init(option) {
        // init shim
    }
}

function addPath(path, key) {
    return path + '.' + key;
}

class MikroOrmShim extends Shim {
    _em;
    _entities;
    init(option) {
        this._em = option.em;
        this._entities = option.entities.filter((entity) => this._em.getMetadata().get(entity.name)?.primaryKeys.length > 0);
    }
    specialTypes() {
        const result = this._entities.map((entity) => ({
            type: entity.name,
            toJSON: (data) => {
                const cacheEntity = {
                    target: wrap(data)?.toJSON() ?? data,
                    populate: wrap(data, true)?.__serializationContext.populate,
                };
                return cacheEntity;
            },
            toObject: (data) => {
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
    collect(target, idMapEntity = new Map(), path = "$") {
        if (!target) {
            return;
        }
        if (typeof target !== "object") {
            return;
        }
        if ((target instanceof Collection && target.isInitialized()) ||
            Array.isArray(target)) {
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
        idMapEntity.set(entityId, { entity: target, path });
        for (const key in target) {
            const element = target[key];
            this.collect(element, idMapEntity, addPath(path, key));
        }
        return idMapEntity;
    }
    isEntity(target) {
        return this._entities.some((entity) => target instanceof entity);
    }
}

export { MikroOrmShim };
