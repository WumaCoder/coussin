export type Constructor<T> = new (...args: any[]) => T;

export type ConstructorOptions<T> = T extends (options: infer O) => T
  ? O
  : JSONObject;

export type JSONObject = Record<string | number, any>;

export type DecoratorKey = (...args: any[]) => string;

export type CacheDeleteKey = (args: any[], returned: any) => string;

export type MethodDecorator = (
  target: any,
  propertyKey: string,
  descriptor: PropertyDescriptor
) => any;

export type IdMapEntityPath = Map<
  string,
  { entity: Constructor<any>; path: string }
>;

export class CacheFlushOptions {
  scope?: string = "";
}

export type CacheGetOptions = {
  maxAge?: number; // ms
};

export class CacheResultOptions implements CacheGetOptions {
  scope?: string = "";
  maxAge?: number; // ms
}
