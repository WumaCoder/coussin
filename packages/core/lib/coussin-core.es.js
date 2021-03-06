import { Ref, addPath, isRef, deepMerge, defaultKey, CacheResultOptions, invader, CacheFlushOptions } from '@coussin/shared';
import jp from 'jsonpath';

class SpecialTypeManager {
    _specialTypeMap = new Map();
    _jsSpecialTypes = [
        {
            type: "Date",
            toJSON: (data) => data.getTime(),
            toObject: (data) => new Date(data),
        },
        {
            type: "RegExp",
            toJSON: (data) => data.toString(),
            toObject: (data) => new RegExp(data),
        },
        {
            type: "Error",
            toJSON: (data) => data.toString(),
            toObject: (data) => new Error(data),
        },
        {
            type: "Map",
            toJSON: (data) => Array.from(data.entries()),
            toObject: (data) => new Map(data),
        },
        {
            type: "Set",
            toJSON: (data) => Array.from(data.values()),
            toObject: (data) => new Set(data),
        },
        {
            type: "Symbol",
            toJSON: (data) => data.toString(),
            toObject: (data) => Symbol(data),
        },
        {
            type: "BigInt",
            toJSON: (data) => data.toString(),
            toObject: (data) => BigInt(data),
        },
        {
            type: "Buffer",
            toJSON: (data) => data.toString("hex"),
            toObject: (data) => Buffer.from(data, "hex"),
        },
    ];
    constructor(specialTypes = []) {
        this._jsSpecialTypes.forEach((specialType) => this.add(specialType));
        specialTypes.forEach((specialType) => this.add(specialType));
    }
    add(specialType) {
        const typeName = this.getTypeName(specialType.type);
        specialType.type = typeName;
        this._specialTypeMap.set(typeName, specialType);
    }
    get(type) {
        return this._specialTypeMap.get(type);
    }
    getTypeName(type) {
        return typeof type === "string" ? type : type.name;
    }
}

class CustomTypeManager {
    _customTypeMap = new Map();
    constructor(customTypes = []) {
        customTypes.forEach((type) => this.addCustomType(type));
        this.addCustomType(Object);
        this.addCustomType(Array);
    }
    addCustomType(type) {
        this._customTypeMap.set(type.name, type);
    }
    delCustomType(type) {
        this._customTypeMap.delete(type.name);
    }
    get(type) {
        return this._customTypeMap.get(type);
    }
    has(type) {
        return this._customTypeMap.has(type);
    }
}

class SerializerOptions {
    customTypes = [];
    customSpecialType = [];
}

class Serializer {
    _customTypeManager;
    _specialTypeManager;
    _refMap = new Map();
    constructor(_options = new SerializerOptions()) {
        this._customTypeManager = new CustomTypeManager(_options.customTypes);
        this._specialTypeManager = new SpecialTypeManager(_options.customSpecialType);
    }
    parse(data) {
        return this.toObject(JSON.parse(data));
    }
    stringify(data) {
        const json = this.toJSON(data);
        this._refMap.clear();
        return JSON.stringify(json);
    }
    toJSON(data, path = "$") {
        if (data === null) {
            return null;
        }
        if (Array.isArray(data)) {
            const resJson = [];
            this._refMap.set(data, { json: resJson, path });
            data.forEach((item, index) => {
                if (this._refMap.has(item)) {
                    const ref = this._refMap.get(item);
                    resJson[index] = Ref(ref.path);
                }
                else {
                    resJson[index] = this.toJSON(item, addPath(path, index));
                }
            });
            return resJson;
        }
        const transform = this._specialTypeManager.get(data?.constructor.name);
        if (transform) {
            // SpecialType
            const resJson = {
                _t_: transform.type,
                v: transform.toJSON(data),
            };
            this._refMap.set(data, { json: resJson, path });
            return resJson;
        }
        if (typeof data === "object") {
            const resJson = {
                _t_: data.constructor.name,
            };
            this._refMap.set(data, { json: resJson, path });
            for (const key in data) {
                if (data.hasOwnProperty(key)) {
                    const value = data[key];
                    if (this._refMap.has(value)) {
                        resJson[key] = Ref(this._refMap.get(value).path);
                    }
                    else {
                        const json = this.toJSON(value, addPath(path, key));
                        resJson[key] = json;
                    }
                }
            }
            return resJson;
        }
        return data; // string, number, boolean, undefined, null
    }
    toObject(data, root = null) {
        if (data === null) {
            return null;
        }
        if (typeof data !== "object") {
            return data;
        }
        if (Array.isArray(data)) {
            const arr = [];
            for (let i = 0; i < data.length; i++) {
                const item = data[i];
                arr.push(this.toObject(item, root || arr));
            }
            return arr;
        }
        if (data._t_ === "Ref") {
            return jp.query(root, data.v)[0];
        }
        const transform = this._specialTypeManager.get(data._t_);
        if (transform) {
            // SpecialType
            return transform.toObject(data.v);
        }
        const Type = this._customTypeManager.get(data._t_);
        if (Type) {
            const instance = new Type();
            const refList = [];
            for (const key in data) {
                if (key === "_t_") {
                    continue;
                }
                if (key === "_r_") {
                    Object.defineProperty(instance, key, {
                        value: data[key],
                        enumerable: false,
                    });
                    continue;
                }
                if (isRef(data[key])) {
                    refList.push(key);
                }
                else {
                    instance[key] = this.toObject(data[key], root || instance);
                }
            }
            for (const key of refList) {
                instance[key] = this.toObject(data[key], root || instance);
            }
            return instance;
        }
        return data; // string, number, boolean, undefined, null
    }
    hasType(name) {
        return this._customTypeManager.has(name);
    }
}
/**
 * ?????????
 * 1 - ???????????? ??? JSON
 * 2 - JSON ?????????
 */
/**
 * ????????????
 * 1 - JSON ????????????
 * 2 - JSON ??? ????????????
 */

class Shim {
    constructor(option) {
        this.init(option);
    }
    init(option) {
        // init shim
    }
}

class NoopShim extends Shim {
    specialTypes() {
        return [];
    }
    collect(target, idMapEntity = new Map(), path = "$") {
        if (!target) {
            return;
        }
        if (typeof target !== "object") {
            return;
        }
        if (Array.isArray(target)) {
            for (let index = 0; index < target.length; index++) {
                const element = target[index];
                this.collect(element, idMapEntity, addPath(path, index));
            }
            return;
        }
        if (!target.id) {
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
}

class Adapter {
    constructor(option) {
        this.init(option);
    }
    init(option) {
        // init cache adapter
    }
}

class MemoryAdapter extends Adapter {
    get(key) {
        throw new Error("Method not implemented.");
    }
    set(key, value, maxAge) {
        throw new Error("Method not implemented.");
    }
    del(key) {
        throw new Error("Method not implemented.");
    }
    expire(key, maxAge) {
        throw new Error("Method not implemented.");
    }
    ttl(key) {
        throw new Error("Method not implemented.");
    }
    destroy() {
        throw new Error("Method not implemented.");
    }
    keys(prefix) {
        throw new Error("Method not implemented.");
    }
    storeDepRelation(entityKeys, cacheKey) {
        throw new Error("Method not implemented.");
    }
    flush(entityKeys) {
        throw new Error("Method not implemented.");
    }
}

class CacheOptions {
    scope = ""; // ?????????
    maxAge = 10000; // s
    threshold = Math.floor(this.maxAge / 3); // s ????????????????????????????????????????????????
    adapter = MemoryAdapter;
    options = {};
    customTypes = [];
    shim = NoopShim;
    shimOptions = null;
}

class Cache {
    _options;
    _cacheAdapter;
    _serializer;
    _shim;
    constructor(options) {
        deepMerge(options, new CacheOptions());
        this._options = options;
        this._cacheAdapter = new this._options.adapter(options.options);
        this._shim = new this._options.shim(this._options.shimOptions);
        this._serializer = new Serializer({
            customTypes: options.customTypes,
            customSpecialType: this._shim.specialTypes(),
        });
        process.on("exit", async () => {
            await this.destroy();
        });
    }
    get option() {
        return this._options;
    }
    get cacheAdapter() {
        return this._cacheAdapter;
    }
    async set(key, data, options) {
        const cacheKey = this.forCacheKey(key);
        const idMapEntity = new Map();
        this._shim.collect(data, idMapEntity, "$");
        const maxAge = options?.maxAge ?? this._options.maxAge;
        await this._cacheAdapter.storeDepRelation(this.toEntityKeys(idMapEntity), cacheKey);
        const cacheData = this._serializer.stringify(data);
        return await this._cacheAdapter.set(cacheKey, cacheData, maxAge);
    }
    async get(key) {
        this.tryRenewal(key);
        const cacheData = await this._cacheAdapter.get(this.forCacheKey(key));
        return this._serializer.parse(cacheData);
    }
    async tryRenewal(key) {
        const cacheKey = this.forCacheKey(key);
        if ((await this._cacheAdapter.ttl(cacheKey)) >= this._options.threshold) {
            return;
        }
        const keys = await this._cacheAdapter.keys(`*${cacheKey}`);
        keys.map((key) => this._cacheAdapter.expire(key, this.option.maxAge)); // ???????????????????????????
        this._cacheAdapter.expire(cacheKey, this.option.maxAge); // ???????????????????????????
    }
    async del(key) {
        return await this._cacheAdapter.del(this.forCacheKey(key));
    }
    async flush(data) {
        const idMapEntity = new Map();
        this._shim.collect(data, idMapEntity, "$");
        await this._cacheAdapter.flush(this.toEntityKeys(idMapEntity));
    }
    destroy() {
        return this._cacheAdapter.destroy();
    }
    forCacheKey(key) {
        return `c:${this._options.scope}:${key}`;
    }
    forDepCacheKey(key) {
        return this.forCacheKey(`_dep_:${key}`);
    }
    toEntityKeys(idMapEntity) {
        return [...idMapEntity.keys()].map((id) => this.forDepCacheKey(`${idMapEntity.get(id).entity?.constructor?.name}:${id}`));
    }
}

class CacheManager {
    static store = new Map();
    static get(key) {
        return CacheManager.store.get(key);
    }
    static set(key, value) {
        if (CacheManager.store.has(key)) {
            console.warn(`cache scope ${key} has been set`);
        }
        CacheManager.store.set(key, value);
    }
}

function createDecorator(scope = "default") {
    return {
        CacheResult(name, key = defaultKey, options) {
            options = Object.assign({}, new CacheResultOptions(), { scope }, options);
            return function (target, propertyKey, descriptor) {
                name = name ?? `${target.constructor.name}:${propertyKey}`;
                invader(descriptor, "value", {
                    async before(ctx) {
                        ctx.skip = true;
                        const cache = CacheManager.get(options.scope);
                        const cacheKey = `${name}:${key(...ctx.args)}`;
                        let cacheData = await cache.get(cacheKey);
                        if (!cacheData) {
                            cacheData = await ctx.rawMethod(...ctx.args);
                            await cache.set(cacheKey, cacheData, options);
                        }
                        return cacheData;
                    },
                });
            };
        },
        CacheDelete(name, key = () => "*", options) {
            options = Object.assign({}, new CacheResultOptions(), { scope }, options);
            return function (target, propertyKey, descriptor) {
                invader(descriptor, "value", {
                    async before(ctx) {
                        const cache = CacheManager.get(options.scope);
                        const cacheKey = `${name}:${key(ctx.args, ctx.returned)}`;
                        await cache.del(cacheKey);
                    },
                });
            };
        },
        CacheFlush(options) {
            options = Object.assign({}, new CacheFlushOptions(), { scope }, options);
            return function (target, propertyKey, descriptor) {
                invader(descriptor, "value", {
                    async before(ctx) {
                        ctx.skip = true;
                        const cache = CacheManager.get(options.scope);
                        const result = await ctx.rawMethod(...ctx.args);
                        await cache.flush(result);
                        return result;
                    },
                });
            };
        },
    };
}
const defaultDecorator = createDecorator();
const CacheResult = defaultDecorator.CacheResult;
const CacheDelete = defaultDecorator.CacheDelete;
const CacheFlush = defaultDecorator.CacheFlush;

export { Adapter, Cache, CacheDelete, CacheFlush, CacheManager, CacheResult, MemoryAdapter, Shim, createDecorator };
