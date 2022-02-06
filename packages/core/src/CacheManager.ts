import { Cache } from "./Cache";

export class CacheManager {
  static store = new Map<string, Cache<any, any>>();

  static get(key: string): Cache<any, any> {
    return CacheManager.store.get(key);
  }

  static set(key: string, value: Cache<any, any>): void {
    if (CacheManager.store.has(key)) {
      console.warn(`cache scope ${key} has been set`);
    }
    CacheManager.store.set(key, value);
  }
}
