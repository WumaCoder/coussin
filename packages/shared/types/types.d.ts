export declare type Constructor<T> = new (...args: any[]) => T;
export declare type ConstructorOptions<T> = T extends (options: infer O) => T ? O : JSONObject;
export declare type JSONObject = Record<string | number, any>;
export declare type DecoratorKey = (...args: any[]) => string;
export declare type CacheDeleteKey = (args: any[], returned: any) => string;
export declare type MethodDecorator = (target: any, propertyKey: string, descriptor: PropertyDescriptor) => any;
export declare type IdMapEntityPath = Map<string, {
    entity: Constructor<any>;
    path: string;
}>;
export declare class CacheFlushOptions {
    scope?: string;
}
export declare type CacheGetOptions = {
    maxAge?: number;
};
export declare class CacheResultOptions implements CacheGetOptions {
    scope?: string;
    maxAge?: number;
}
//# sourceMappingURL=types.d.ts.map