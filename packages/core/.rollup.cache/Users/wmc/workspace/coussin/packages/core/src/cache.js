import { deepMerge } from "@coussin/shared";
import { Serializer } from "./serializer";
import { NoopShim } from "./shim/noop.shim";
import { MemoryCacheAdapter } from "./adapter/memory-cache.adapter";
export class CacheOptions {
    scope = ""; // 作业域
    maxAge = 10000; // s
    threshold = Math.floor(this.maxAge / 3); // s 当过期时间小于这个数字的时候续租
    adapter = MemoryCacheAdapter;
    options = {};
    customTypes = [];
    shim = NoopShim;
    shimOptions = null;
}
export class Cache {
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
