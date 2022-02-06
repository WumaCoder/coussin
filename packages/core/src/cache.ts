import { CacheResultOptions, deepMerge } from "@coussin/shared";
import { Serializer } from "./serializer";
import { Shim } from "./Shim";
import { Adapter } from "./CacheAdapter";
import { IdMapEntityPath } from "@coussin/shared";
import { CacheOptions } from "./CacheOptions";
import { CacheManager } from "./CacheManager";

export class Cache<CO, SO> {
  private _options: CacheOptions<CO, SO>;
  private _cacheAdapter: Adapter<CO>;
  private _serializer: Serializer;
  private _shim: Shim<SO>;

  constructor(options: CacheOptions<CO, SO>) {
    deepMerge(options, new CacheOptions());
    this._options = options;
    this._cacheAdapter = new this._options.adapter(options.options);
    this._shim = new this._options.shim(this._options.shimOptions);
    this._serializer = new Serializer({
      customTypes: options.customTypes,
      customSpecialType: this._shim.specialTypes(),
    });
    CacheManager.set(this._options.scope, this);

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

  async set<T>(key: string, data: T, options?: CacheResultOptions) {
    const cacheKey = this.forCacheKey(key);
    const idMapEntity: IdMapEntityPath = new Map();
    this._shim.collect(data, idMapEntity, "$");

    const maxAge = options?.maxAge ?? this._options.maxAge;

    await this._cacheAdapter.storeDepRelation(
      this.toEntityKeys(idMapEntity),
      cacheKey
    );

    const cacheData = this._serializer.stringify(data);

    return await this._cacheAdapter.set(cacheKey, cacheData, maxAge);
  }

  async get<T>(key: string): Promise<T> {
    this.tryRenewal(key);
    const cacheData = await this._cacheAdapter.get(this.forCacheKey(key));
    return this._serializer.parse<T>(cacheData);
  }

  async tryRenewal(key: string) {
    const cacheKey = this.forCacheKey(key);
    if ((await this._cacheAdapter.ttl(cacheKey)) >= this._options.threshold) {
      return;
    }
    const keys = await this._cacheAdapter.keys(`*${cacheKey}`);
    keys.map((key) => this._cacheAdapter.expire(key, this.option.maxAge)); // 刷新依赖的过期时间
    this._cacheAdapter.expire(cacheKey, this.option.maxAge); // 刷新自己的过期时间
  }

  async del(key: string) {
    return await this._cacheAdapter.del(this.forCacheKey(key));
  }

  async flush<T>(data: T) {
    const idMapEntity: IdMapEntityPath = new Map();
    this._shim.collect(data, idMapEntity, "$");
    await this._cacheAdapter.flush(this.toEntityKeys(idMapEntity));
  }

  destroy() {
    return this._cacheAdapter.destroy();
  }

  private forCacheKey(key: string) {
    return `c:${this._options.scope}:${key}`;
  }

  private forDepCacheKey(key: string) {
    return this.forCacheKey(`_dep_:${key}`);
  }

  private toEntityKeys(idMapEntity: IdMapEntityPath) {
    return [...idMapEntity.keys()].map((id) =>
      this.forDepCacheKey(
        `${idMapEntity.get(id).entity?.constructor?.name}:${id}`
      )
    );
  }
}
