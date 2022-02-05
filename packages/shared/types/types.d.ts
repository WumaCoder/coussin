export declare type Constructor<T> = new (...args: any[]) => T;
export declare type ConstructorOptions<T> = T extends (options: infer O) => T ? O : JSONObject;
export declare type JSONObject = Record<string | number, any>;
export declare type CacheResultKey = (...args: any[]) => string;
export declare type CacheDeleteKey = (args: any[], returned: any) => string;
export declare type MethodDecorator = (target: any, propertyKey: string, descriptor: PropertyDescriptor) => any;
export declare type IdMapEntityPath = Map<string, {
    entity: Constructor<any>;
    path: string;
}>;
//# sourceMappingURL=types.d.ts.map