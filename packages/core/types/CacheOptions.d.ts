import { Constructor } from "@coussin/shared";
import { Shim } from "./Shim";
import { Adapter } from "./CacheAdapter";
export declare class CacheOptions<CO, SO> {
    scope?: string;
    maxAge?: number;
    threshold?: number;
    adapter?: Constructor<Adapter<CO>>;
    options?: CO;
    customTypes?: Constructor<any>[];
    shim?: Constructor<Shim<SO>>;
    shimOptions?: SO;
}
//# sourceMappingURL=CacheOptions.d.ts.map