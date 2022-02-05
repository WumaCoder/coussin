import { Constructor } from "@coussin/shared";
import { JSONObject } from "@coussin/shared";
export declare class SerializeData {
    type: string;
    subType: Record<string, string>;
    body: Record<any, any>;
}
export declare type SpecialType = {
    type: string | Constructor<any>;
    toJSON: (data: any) => any;
    toObject: (data: any) => any;
};
export declare class SerializerOptions {
    customTypes?: Constructor<any>[];
    customSpecialType?: SpecialType[];
}
export declare class Serializer {
    private _customTypeManager;
    private _specialTypeManager;
    private _refMap;
    constructor(_options?: SerializerOptions);
    parse<T>(data: string): T;
    stringify<T>(data: T): string;
    toJSON<T>(data: T, path?: string): JSONObject;
    toObject(data: any, root?: any): any;
    hasType(name: string): boolean;
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
//# sourceMappingURL=serializer.d.ts.map