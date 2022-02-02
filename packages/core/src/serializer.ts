import { Constructor } from "@coussin/shared";
import jp from "jsonpath";
import { addPath, isRef, Ref, JSONObject } from "@coussin/shared";

export class SerializeData {
  type: string;
  subType: Record<string, string>;
  body: Record<any, any>;
}

export type SpecialType = {
  type: string | Constructor<any>;
  toJSON: (data: any) => any;
  toObject: (data: any) => any;
};

export class SerializerOptions {
  customTypes?: Constructor<any>[] = [];
  customSpecialType?: SpecialType[] = [];
}

class CustomTypeManager {
  private _customTypeMap: Map<string, Constructor<any>> = new Map();

  constructor(customTypes: Constructor<any>[] = []) {
    customTypes.forEach((type) => this.addCustomType(type));
    this.addCustomType(Object);
    this.addCustomType(Array);
  }
  addCustomType(type: Constructor<any>) {
    this._customTypeMap.set(type.name, type);
  }

  delCustomType(type: Constructor<any>) {
    this._customTypeMap.delete(type.name);
  }

  get(type: string) {
    return this._customTypeMap.get(type);
  }

  has(type: string): boolean {
    return this._customTypeMap.has(type);
  }
}

class SpecialTypeManager {
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

export class Serializer {
  private _customTypeManager: CustomTypeManager;
  private _specialTypeManager: SpecialTypeManager;
  private _refMap: Map<any, any> = new Map();

  constructor(_options: SerializerOptions = new SerializerOptions()) {
    this._customTypeManager = new CustomTypeManager(_options.customTypes);
    this._specialTypeManager = new SpecialTypeManager(
      _options.customSpecialType
    );
  }

  parse<T>(data: string): T {
    return this.toObject(JSON.parse(data));
  }

  stringify<T>(data: T): string {
    const json = this.toJSON(data);
    this._refMap.clear();
    return JSON.stringify(json);
  }

  toJSON<T>(data: T, path: string = "$"): JSONObject {
    if (data === null) {
      return null;
    }

    if (Array.isArray(data)) {
      const resJson = [];
      this._refMap.set(data, { json: resJson, path });
      data.forEach((item, index) => {
        if (this._refMap.has(item)) {
          const ref = this._refMap.get(item);
          resJson[index] = Ref(ref.path);
        } else {
          resJson[index] = this.toJSON(item, addPath(path, index));
        }
      });
      return resJson;
    }

    const transform = this._specialTypeManager.get(data?.constructor.name);

    if (transform) {
      // SpecialType
      const resJson = {
        _t_: transform.type,
        v: transform.toJSON(data),
      };
      this._refMap.set(data, { json: resJson, path });
      return resJson;
    }

    if (typeof data === "object") {
      const resJson: JSONObject = {
        _t_: data.constructor.name,
      };
      this._refMap.set(data, { json: resJson, path });
      for (const key in data) {
        if (data.hasOwnProperty(key)) {
          const value = data[key];
          if (this._refMap.has(value)) {
            resJson[key] = Ref(this._refMap.get(value).path);
          } else {
            const json = this.toJSON(value, addPath(path, key));
            resJson[key] = json;
          }
        }
      }
      return resJson;
    }

    return data; // string, number, boolean, undefined, null
  }

  toObject(data: any, root = null) {
    if (data === null) {
      return null;
    }

    if (typeof data !== "object") {
      return data;
    }

    if (Array.isArray(data)) {
      const arr = [];
      for (let i = 0; i < data.length; i++) {
        const item = data[i];
        arr.push(this.toObject(item, root || arr));
      }
      return arr;
    }

    if (data._t_ === "Ref") {
      return jp.query(root, data.v)[0];
    }

    const transform = this._specialTypeManager.get(data._t_);
    if (transform) {
      // SpecialType
      return transform.toObject(data.v);
    }

    const Type = this._customTypeManager.get(data._t_);
    if (Type) {
      const instance = new Type();
      const refList = [];
      for (const key in data) {
        if (key === "_t_") {
          continue;
        }
        if (key === "_r_") {
          Object.defineProperty(instance, key, {
            value: data[key],
            enumerable: false,
          });
          continue;
        }
        if (isRef(data[key])) {
          refList.push(key);
        } else {
          instance[key] = this.toObject(data[key], root || instance);
        }
      }
      for (const key of refList) {
        instance[key] = this.toObject(data[key], root || instance);
      }
      return instance;
    }

    return data; // string, number, boolean, undefined, null
  }

  hasType(name: string): boolean {
    return this._customTypeManager.has(name);
  }
}

/**
 * 序列化
 * 1 - 实体对象 转 JSON
 * 2 - JSON 序列化
 */

/**
 * 反序列化
 * 1 - JSON 反序列化
 * 2 - JSON 转 实体对象
 */
