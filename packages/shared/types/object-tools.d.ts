import { Constructor } from "./types";
export declare function fill<T>(instance: T, props: Partial<T>): T;
export declare function getConstructor<T extends Record<string, any>>(entity: T): Constructor<T>;
export declare function make<T>(Entity: Constructor<T>, props: Partial<T>): T;
//# sourceMappingURL=object-tools.d.ts.map