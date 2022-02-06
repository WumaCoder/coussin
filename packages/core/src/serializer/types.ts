import { Constructor } from "@coussin/shared";

export type SpecialType = {
  type: string | Constructor<any>;
  toJSON: (data: any) => any;
  toObject: (data: any) => any;
};
