import { Constructor } from "@coussin/shared";
import { SpecialType } from "./types";
export declare class SpecialTypeManager {
    private _specialTypeMap;
    private _jsSpecialTypes;
    constructor(specialTypes?: SpecialType[]);
    add(specialType: SpecialType): void;
    get(type: string): SpecialType;
    getTypeName(type: string | Constructor<any>): string;
}
//# sourceMappingURL=SpecialTypeManager.d.ts.map