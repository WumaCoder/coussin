import { Constructor } from "./types";
export type typeToString<T> = T extends string
  ? "String"
  : T extends number
  ? "Number"
  : T extends boolean
  ? "Boolean"
  : T extends undefined
  ? "Undefined"
  : T extends null
  ? "Null"
  : T extends RegExp
  ? "RegExp"
  : T extends Date
  ? "Date"
  : T extends Array<any>
  ? "Array"
  : T extends Record<string, any>
  ? "Object"
  : T extends Constructor<any>
  ? string
  : // eslint-disable-next-line @typescript-eslint/ban-types
  T extends Function
  ? "Function"
  : "NaN";

export function typeOf<T>(data: T): typeToString<T> {
  if (data === null) {
    return "Null" as typeToString<T>;
  }
  if (data === undefined) {
    return "Undefined" as typeToString<T>;
  }

  const type = Object.prototype.toString.call(data).slice(8, -1);

  if (type === "Object" && data.constructor && data.constructor.name) {
    return data.constructor.name as typeToString<T>;
  }
  if (type === "Number" && isNaN(data as any)) {
    return "NaN" as typeToString<T>;
  }
  return type;
}
