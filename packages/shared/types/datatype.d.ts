import { Constructor } from "./types";
export declare type typeToString<T> = T extends string ? "String" : T extends number ? "Number" : T extends boolean ? "Boolean" : T extends undefined ? "Undefined" : T extends null ? "Null" : T extends RegExp ? "RegExp" : T extends Date ? "Date" : T extends Array<any> ? "Array" : T extends Record<string, any> ? "Object" : T extends Constructor<any> ? string : T extends Function ? "Function" : "NaN";
export declare function typeOf<T>(data: T): typeToString<T>;
//# sourceMappingURL=datatype.d.ts.map