import { DecoratorKey, CacheFlushOptions, CacheResultOptions } from "@coussin/shared";
export declare function createDecorator(scope?: string): {
    CacheResult(name?: string, key?: DecoratorKey, options?: CacheResultOptions): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => void;
    CacheDelete(name: string, key?: DecoratorKey, options?: CacheResultOptions): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => void;
    CacheFlush(options?: CacheFlushOptions): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => void;
};
export declare const CacheResult: (name?: string, key?: DecoratorKey, options?: CacheResultOptions) => (target: any, propertyKey: string, descriptor: PropertyDescriptor) => void;
export declare const CacheDelete: (name: string, key?: DecoratorKey, options?: CacheResultOptions) => (target: any, propertyKey: string, descriptor: PropertyDescriptor) => void;
export declare const CacheFlush: (options?: CacheFlushOptions) => (target: any, propertyKey: string, descriptor: PropertyDescriptor) => void;
//# sourceMappingURL=createDecorator.d.ts.map