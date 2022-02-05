import { CacheAdapter } from "../cache-adapter";

export class MemoryCacheAdapter extends CacheAdapter<null> {
  get(key: string): string | Promise<string> {
    throw new Error("Method not implemented.");
  }
  set(key: string, value: string, maxAge: number) {
    throw new Error("Method not implemented.");
  }
  del(key: string) {
    throw new Error("Method not implemented.");
  }
  expire(key: string, maxAge: number) {
    throw new Error("Method not implemented.");
  }
  ttl(key: string): number | Promise<number> {
    throw new Error("Method not implemented.");
  }
  destroy() {
    throw new Error("Method not implemented.");
  }
  keys(prefix: string): string[] | Promise<string[]> {
    throw new Error("Method not implemented.");
  }
  storeDepRelation(entityKeys: string[], cacheKey: string) {
    throw new Error("Method not implemented.");
  }
  flush(entityKeys: string[]) {
    throw new Error("Method not implemented.");
  }
}
