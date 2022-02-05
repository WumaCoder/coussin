import { Constructor } from "@coussin/shared";
import { Shim } from "./shim";
import { CacheAdapter } from "./cache-adapter";
export declare class CacheOptions<CO, SO> {
    scope?: string;
    maxAge?: number;
    threshold?: number;
    adapter?: Constructor<CacheAdapter<CO>>;
    options?: CO;
    customTypes?: Constructor<any>[];
    shim?: Constructor<Shim<SO>>;
    shimOptions?: SO;
}
export declare type CacheGetOptions = {
    maxAge?: number;
};
export declare class Cache<CO, SO> {
    private _options;
    private _cacheAdapter;
    private _serializer;
    private _shim;
    constructor(options: CacheOptions<CO, SO>);
    get option(): CacheOptions<CO, SO>;
    get cacheAdapter(): CacheAdapter<CO>;
    set<T>(key: string, data: T, options?: CacheGetOptions): Promise<any>;
    get<T>(key: string): Promise<T>;
    tryRenewal(key: string): Promise<void>;
    del(key: string): Promise<any>;
    flush<T>(data: T): Promise<void>;
    destroy(): any;
    private forCacheKey;
    private forDepCacheKey;
    private toEntityKeys;
}
//# sourceMappingURL=cache.d.ts.map