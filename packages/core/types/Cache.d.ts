import { CacheResultOptions } from "@coussin/shared";
import { Adapter } from "./CacheAdapter";
import { CacheOptions } from "./CacheOptions";
export declare class Cache<CO, SO> {
    private _options;
    private _cacheAdapter;
    private _serializer;
    private _shim;
    constructor(options: CacheOptions<CO, SO>);
    get option(): CacheOptions<CO, SO>;
    get cacheAdapter(): Adapter<CO>;
    set<T>(key: string, data: T, options?: CacheResultOptions): Promise<any>;
    get<T>(key: string): Promise<T>;
    tryRenewal(key: string): Promise<void>;
    del(key: string): Promise<any>;
    flush<T>(data: T): Promise<void>;
    destroy(): any;
    private forCacheKey;
    private forDepCacheKey;
    private toEntityKeys;
}
//# sourceMappingURL=Cache.d.ts.map