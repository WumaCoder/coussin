import { SpecialType } from "../Serializer";
import { Shim } from "../Shim";
import { IdMapEntityPath, JSONObject } from "@coussin/shared";
export declare class NoopShim extends Shim<null> {
    specialTypes(): SpecialType[];
    collect<T extends JSONObject>(target: T, idMapEntity?: IdMapEntityPath, path?: string): IdMapEntityPath;
}
//# sourceMappingURL=noop.shim.d.ts.map