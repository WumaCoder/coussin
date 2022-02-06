import { Constructor } from "@coussin/shared";
import { SpecialType } from "./types";

export class SpecialTypeManager {
  private _specialTypeMap: Map<string, SpecialType> = new Map();
  private _jsSpecialTypes: SpecialType[] = [
    {
      type: "Date",
      toJSON: (data: Date) => data.getTime(),
      toObject: (data: number) => new Date(data),
    },
    {
      type: "RegExp",
      toJSON: (data: RegExp) => data.toString(),
      toObject: (data: string) => new RegExp(data),
    },
    {
      type: "Error",
      toJSON: (data: Error) => data.toString(),
      toObject: (data: string) => new Error(data),
    },
    {
      type: "Map",
      toJSON: (data: Map<any, any>) => Array.from(data.entries()),
      toObject: (data: any[]) => new Map(data),
    },
    {
      type: "Set",
      toJSON: (data: Set<any>) => Array.from(data.values()),
      toObject: (data: any[]) => new Set(data),
    },
    {
      type: "Symbol",
      toJSON: (data: symbol) => data.toString(),
      toObject: (data: string) => Symbol(data),
    },
    {
      type: "BigInt",
      toJSON: (data: bigint) => data.toString(),
      toObject: (data: string) => BigInt(data),
    },
    {
      type: "Buffer",
      toJSON: (data: Buffer) => data.toString("hex"),
      toObject: (data: string) => Buffer.from(data, "hex"),
    },
  ];

  constructor(specialTypes: SpecialType[] = []) {
    this._jsSpecialTypes.forEach((specialType) => this.add(specialType));
    specialTypes.forEach((specialType) => this.add(specialType));
  }

  add(specialType: SpecialType) {
    const typeName = this.getTypeName(specialType.type);
    specialType.type = typeName;
    this._specialTypeMap.set(typeName, specialType);
  }

  get(type: string) {
    return this._specialTypeMap.get(type);
  }

  getTypeName(type: string | Constructor<any>) {
    return typeof type === "string" ? type : type.name;
  }
}
