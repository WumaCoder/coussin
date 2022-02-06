import { IdMapEntityPath } from "@coussin/shared";
import { SpecialType } from "./Serializer";

export abstract class Shim<O> {
  constructor(option: O) {
    this.init(option);
  }

  protected init(option: O) {
    // init shim
  }

  abstract specialTypes(): SpecialType[];

  abstract collect<T>(
    target: T,
    idMapEntity: IdMapEntityPath,
    path: string
  ): any;
}
