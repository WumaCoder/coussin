import jp from "jsonpath";
import { addPath, isRef, Ref, JSONObject } from "@coussin/shared";
import { SpecialTypeManager } from "./SpecialTypeManager";
import { CustomTypeManager } from "./CustomTypeManager";
import { SerializerOptions } from "./SerializerOptions";

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
