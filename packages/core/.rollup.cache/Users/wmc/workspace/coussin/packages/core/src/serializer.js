import jp from "jsonpath";
import { addPath, isRef, Ref } from "@coussin/shared";
export class SerializeData {
    type;
    subType;
    body;
}
export class SerializerOptions {
    customTypes = [];
    customSpecialType = [];
}
class CustomTypeManager {
    _customTypeMap = new Map();
    constructor(customTypes = []) {
        customTypes.forEach((type) => this.addCustomType(type));
        this.addCustomType(Object);
        this.addCustomType(Array);
    }
    addCustomType(type) {
        this._customTypeMap.set(type.name, type);
    }
    delCustomType(type) {
        this._customTypeMap.delete(type.name);
    }
    get(type) {
        return this._customTypeMap.get(type);
    }
    has(type) {
        return this._customTypeMap.has(type);
    }
}
class SpecialTypeManager {
    _specialTypeMap = new Map();
    _jsSpecialTypes = [
        {
            type: "Date",
            toJSON: (data) => data.getTime(),
            toObject: (data) => new Date(data),
        },
        {
            type: "RegExp",
            toJSON: (data) => data.toString(),
            toObject: (data) => new RegExp(data),
        },
        {
            type: "Error",
            toJSON: (data) => data.toString(),
            toObject: (data) => new Error(data),
        },
        {
            type: "Map",
            toJSON: (data) => Array.from(data.entries()),
            toObject: (data) => new Map(data),
        },
        {
            type: "Set",
            toJSON: (data) => Array.from(data.values()),
            toObject: (data) => new Set(data),
        },
        {
            type: "Symbol",
            toJSON: (data) => data.toString(),
            toObject: (data) => Symbol(data),
        },
        {
            type: "BigInt",
            toJSON: (data) => data.toString(),
            toObject: (data) => BigInt(data),
        },
        {
            type: "Buffer",
            toJSON: (data) => data.toString("hex"),
            toObject: (data) => Buffer.from(data, "hex"),
        },
    ];
    constructor(specialTypes = []) {
        this._jsSpecialTypes.forEach((specialType) => this.add(specialType));
        specialTypes.forEach((specialType) => this.add(specialType));
    }
    add(specialType) {
        const typeName = this.getTypeName(specialType.type);
        specialType.type = typeName;
        this._specialTypeMap.set(typeName, specialType);
    }
    get(type) {
        return this._specialTypeMap.get(type);
    }
    getTypeName(type) {
        return typeof type === "string" ? type : type.name;
    }
}
export class Serializer {
    _customTypeManager;
    _specialTypeManager;
    _refMap = new Map();
    constructor(_options = new SerializerOptions()) {
        this._customTypeManager = new CustomTypeManager(_options.customTypes);
        this._specialTypeManager = new SpecialTypeManager(_options.customSpecialType);
    }
    parse(data) {
        return this.toObject(JSON.parse(data));
    }
    stringify(data) {
        const json = this.toJSON(data);
        this._refMap.clear();
        return JSON.stringify(json);
    }
    toJSON(data, path = "$") {
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
                }
                else {
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
            const resJson = {
                _t_: data.constructor.name,
            };
            this._refMap.set(data, { json: resJson, path });
            for (const key in data) {
                if (data.hasOwnProperty(key)) {
                    const value = data[key];
                    if (this._refMap.has(value)) {
                        resJson[key] = Ref(this._refMap.get(value).path);
                    }
                    else {
                        const json = this.toJSON(value, addPath(path, key));
                        resJson[key] = json;
                    }
                }
            }
            return resJson;
        }
        return data; // string, number, boolean, undefined, null
    }
    toObject(data, root = null) {
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
                }
                else {
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
    hasType(name) {
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
