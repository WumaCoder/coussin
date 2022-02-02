import { CacheAdapter } from "../adapter";
export class MemoryCacheAdapter extends CacheAdapter {
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
