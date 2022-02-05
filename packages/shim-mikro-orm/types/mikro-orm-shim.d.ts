import { Constructor, SpecialType, Shim } from "@coussin/core";
import { IdMapEntityPath } from "@coussin/shared";
import { AnyEntity, EntityManager } from "@mikro-orm/core";
export interface MikroOrmShimOption {
    em?: EntityManager;
    entities?: Constructor<any>[];
}
export declare class MikroOrmShim extends Shim<MikroOrmShimOption> {
    private _em;
    private _entities;
    protected init(option: MikroOrmShimOption): void;
    specialTypes(): SpecialType[];
    collect<T extends AnyEntity>(target: T, idMapEntity?: IdMapEntityPath, path?: string): IdMapEntityPath;
    isEntity<T>(target: T): boolean;
}
//# sourceMappingURL=mikro-orm-shim.d.ts.map