import { SpecialType } from "../Serializer";
import { Shim } from "../Shim";
import { IdMapEntityPath, JSONObject, addPath } from "@coussin/shared";

export class NoopShim extends Shim<null> {
  specialTypes(): SpecialType[] {
    return [];
  }

  collect<T extends JSONObject>(
    target: T,
    idMapEntity: IdMapEntityPath = new Map(),
    path = "$"
  ) {
    if (!target) {
      return;
    }
    if (typeof target !== "object") {
      return;
    }

    if (Array.isArray(target)) {
      for (let index = 0; index < target.length; index++) {
        const element = target[index];
        this.collect(element, idMapEntity, addPath(path, index));
      }
      return;
    }

    if (!target.id) {
      return;
    }

    const entityId = target.id;
    const entity = idMapEntity.get(entityId);
    if (entity) {
      return;
    }

    idMapEntity.set(entityId, { entity: target, path } as any);

    for (const key in target) {
      const element = target[key];
      this.collect(element, idMapEntity, addPath(path, key));
    }

    return idMapEntity;
  }
}
