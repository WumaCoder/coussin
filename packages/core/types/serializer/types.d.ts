import { Constructor } from "@coussin/shared";
export declare type SpecialType = {
    type: string | Constructor<any>;
    toJSON: (data: any) => any;
    toObject: (data: any) => any;
};
//# sourceMappingURL=types.d.ts.map