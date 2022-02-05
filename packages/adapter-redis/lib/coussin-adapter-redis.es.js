import IORedis from 'ioredis';
import 'jsonpath';

class Adapter {
    constructor(option) {
        this.init(option);
    }
    init(option) {
        // init cache adapter
    }
}

class RedisAdapter extends Adapter {
    _client;
    init(options) {
        if (options.redis) {
            this._client = options.redis;
        }
        else {
            this._client = new IORedis(options);
        }
    }
    get(key) {
        return this._client.get(key);
    }
    async set(key, value, maxAge) {
        const ok = await this._client.set(key, value, "EX", maxAge);
        if (ok === "OK") {
            return true;
        }
        return false;
    }
    async del(key) {
        if (!key) {
            return false;
        }
        const count = await this._client.del(key);
        if (count === 0) {
            return false;
        }
        return true;
    }
    async keys(pattern) {
        let cursor = "0";
        const result = new Set();
        do {
            const [_cursor, findKeys] = await this._client.scan(cursor, "MATCH", pattern, "COUNT", 10);
            findKeys.forEach((key) => result.add(key));
            cursor = _cursor;
        } while (cursor !== "0");
        return [...result.values()];
    }
    expire(key, maxAge) {
        return this._client.expire(key, maxAge);
    }
    ttl(key) {
        return this._client.ttl(key);
    }
    destroy() {
        this._client.disconnect();
    }
    async storeDepRelation(entityKeys, cacheKey) {
        await Promise.allSettled(entityKeys.map((entityKey) => this._client.sadd(entityKey, cacheKey)));
        return true;
    }
    async flush(entityKeys) {
        await Promise.allSettled(entityKeys.map((entityKey) => this._client
            .smembers(entityKey)
            .then((keys) => this._client.del(...keys))));
        return true;
    }
}

export { RedisAdapter };
