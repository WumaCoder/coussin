import { Cache } from "./Cache";
export declare class CacheManager {
    static store: Map<string, Cache<any, any>>;
    static get(key: string): Cache<any, any>;
    static set(key: string, value: Cache<any, any>): void;
}
//# sourceMappingURL=CacheManager.d.ts.map