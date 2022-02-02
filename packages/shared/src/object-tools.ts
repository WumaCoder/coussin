import { Constructor } from "./types";

export function fill<T>(instance: T, props: Partial<T>): T {
  for (const key in props) {
    if (Object.prototype.hasOwnProperty.call(props, key)) {
      const prop = props[key];
      if (prop !== undefined && prop !== null) {
        instance[key] = prop;
      }
    }
  }
  return instance;
}

export function getConstructor<T extends Record<string, any>>(
  entity: T
): Constructor<T> {
  return entity.constructor as Constructor<T>;
}

export function make<T>(Entity: Constructor<T>, props: Partial<T>) {
  if (!props) {
    return undefined;
  }
  return fill(new Entity(), props);
}
