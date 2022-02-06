import { Constructor } from "@coussin/shared";
import { SpecialType } from "./types";

export class SerializerOptions {
  customTypes?: Constructor<any>[] = [];
  customSpecialType?: SpecialType[] = [];
}
