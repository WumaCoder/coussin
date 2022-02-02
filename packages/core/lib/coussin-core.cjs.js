'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var jp = require('jsonpath');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var jp__default = /*#__PURE__*/_interopDefaultLegacy(jp);

function addPath(path, key) {
    return path + '.' + key;
}
function Ref(path) {
    return {
        _t_: 'Ref',
        v: path,
    };
}
function isRef(data) {
    return data && typeof data === 'object' && data._t_ === 'Ref';
}

function deepMerge(target, obj) {
    // 1 - 基础类型优先存储target[key]
    // 2 - target[key] 如果为null或undef 则读取obj[key]
    // 3 - target 如果是数组则与 obj.length 比较 一样的话进行递归
    if (target && typeof target === "object") {
        for (const key in obj) {
            Reflect.set(target, key, deepMerge(target[key], obj[key]));
        }
        return target;
    }
    else if (Array.isArray(target)) {
        if (target?.length !== obj?.length) {
            return target;
        }
        for (let i = 0; i < target.length; i++) {
            target[i] = deepMerge(target[i], obj[i]);
        }
        return target;
    }
    else {
        return target === null || target === undefined ? obj : target;
    }
}

class SerializerOptions {
    customTypes = [];
    customSpecialType = [];
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
            return jp__default["default"].query(root, data.v)[0];
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

class CacheAdapter {
    constructor(option) {
        this.init(option);
    }
    init(option) {
        // init cache adapter
    }
}

class MemoryCacheAdapter extends CacheAdapter {
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
    scope = ""; // 作业域
    maxAge = 10000; // s
    threshold = Math.floor(this.maxAge / 3); // s 当过期时间小于这个数字的时候续租
    adapter = MemoryCacheAdapter;
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
        keys.map((key) => this._cacheAdapter.expire(key, this.option.maxAge)); // 刷新依赖的过期时间
        this._cacheAdapter.expire(cacheKey, this.option.maxAge); // 刷新自己的过期时间
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

exports.Cache = Cache;
exports.CacheOptions = CacheOptions;
