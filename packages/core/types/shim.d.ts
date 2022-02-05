import { IdMapEntityPath } from "@coussin/shared";
import { SpecialType } from "./serializer";
export declare abstract class Shim<O> {
    constructor(option: O);
    protected init(option: O): void;
    abstract specialTypes(): SpecialType[];
    abstract collect<T>(target: T, idMapEntity: IdMapEntityPath, path: string): any;
}
//# sourceMappingURL=shim.d.ts.map