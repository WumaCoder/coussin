import IORedis, { Redis, RedisOptions } from "ioredis";
import { Adapter } from "@coussin/core";

export interface RedisCacheOptions extends RedisOptions {
  redis?: Redis;
}

export class RedisAdapter extends Adapter<RedisCacheOptions> {
  private _client: Redis;

  protected init(options: RedisCacheOptions) {
    if (options.redis) {
      this._client = options.redis;
    } else {
      this._client = new IORedis(options);
    }
  }

  get(key: string) {
    return this._client.get(key);
  }

  async set(key: string, value: string, maxAge: number) {
    const ok = await this._client.set(key, value, "EX", maxAge);
    if (ok === "OK") {
      return true;
    }
    return false;
  }

  async del(key: string) {
    if (!key) {
      return false;
    }
    const count = await this._client.del(key);
    if (count === 0) {
      return false;
    }
    return true;
  }

  async keys(pattern: string) {
    let cursor = "0";
    const result = new Set<string>();
    do {
      const [_cursor, findKeys] = await this._client.scan(
        cursor,
        "MATCH",
        pattern,
        "COUNT",
        10
      );
      findKeys.forEach((key) => result.add(key));
      cursor = _cursor;
    } while (cursor !== "0");

    return [...result.values()];
  }

  expire(key: string, maxAge: number) {
    return this._client.expire(key, maxAge);
  }

  ttl(key: string): Promise<number> {
    return this._client.ttl(key);
  }
  destroy() {
    this._client.disconnect();
  }

  async storeDepRelation(entityKeys: string[], cacheKey: string) {
    await Promise.allSettled(
      entityKeys.map((entityKey) => this._client.sadd(entityKey, cacheKey))
    );

    return true;
  }

  async flush(entityKeys: string[]) {
    await Promise.allSettled(
      entityKeys.map((entityKey) =>
        this._client
          .smembers(entityKey)
          .then((keys) => this._client.del(...keys))
      )
    );

    return true;
  }
}
