import { Adapter } from "../CacheAdapter";
export declare class MemoryAdapter extends Adapter<null> {
    get(key: string): string | Promise<string>;
    set(key: string, value: string, maxAge: number): void;
    del(key: string): void;
    expire(key: string, maxAge: number): void;
    ttl(key: string): number | Promise<number>;
    destroy(): void;
    keys(prefix: string): string[] | Promise<string[]>;
    storeDepRelation(entityKeys: string[], cacheKey: string): void;
    flush(entityKeys: string[]): void;
}
//# sourceMappingURL=memory-cache.adapter.d.ts.map