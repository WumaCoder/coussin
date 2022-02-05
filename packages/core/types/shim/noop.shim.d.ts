import { SpecialType } from "../serializer";
import { Shim } from "../shim";
import { IdMapEntityPath, JSONObject } from "@coussin/shared";
export declare class NoopShim extends Shim<null> {
    specialTypes(): SpecialType[];
    collect<T extends JSONObject>(target: T, idMapEntity?: IdMapEntityPath, path?: string): IdMapEntityPath;
}
//# sourceMappingURL=noop.shim.d.ts.map