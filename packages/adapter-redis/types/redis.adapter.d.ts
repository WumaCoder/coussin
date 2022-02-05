import IORedis, { Redis, RedisOptions } from "ioredis";
import { Adapter } from "@coussin/core";
export interface RedisCacheOptions extends RedisOptions {
    redis?: Redis;
}
export declare class RedisAdapter extends Adapter<RedisCacheOptions> {
    private _client;
    protected init(options: RedisCacheOptions): void;
    get(key: string): Promise<string>;
    set(key: string, value: string, maxAge: number): Promise<boolean>;
    del(key: string): Promise<boolean>;
    keys(pattern: string): Promise<string[]>;
    expire(key: string, maxAge: number): Promise<IORedis.BooleanResponse>;
    ttl(key: string): Promise<number>;
    destroy(): void;
    storeDepRelation(entityKeys: string[], cacheKey: string): Promise<boolean>;
    flush(entityKeys: string[]): Promise<boolean>;
}
//# sourceMappingURL=redis.adapter.d.ts.map