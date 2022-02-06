import { Constructor } from "@coussin/shared";
export declare class CustomTypeManager {
    private _customTypeMap;
    constructor(customTypes?: Constructor<any>[]);
    addCustomType(type: Constructor<any>): void;
    delCustomType(type: Constructor<any>): void;
    get(type: string): Constructor<any>;
    has(type: string): boolean;
}
//# sourceMappingURL=CustomTypeManager.d.ts.map