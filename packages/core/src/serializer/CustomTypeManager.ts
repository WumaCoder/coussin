import { Constructor } from "@coussin/shared";

export class CustomTypeManager {
  private _customTypeMap: Map<string, Constructor<any>> = new Map();

  constructor(customTypes: Constructor<any>[] = []) {
    customTypes.forEach((type) => this.addCustomType(type));
    this.addCustomType(Object);
    this.addCustomType(Array);
  }
  addCustomType(type: Constructor<any>) {
    this._customTypeMap.set(type.name, type);
  }

  delCustomType(type: Constructor<any>) {
    this._customTypeMap.delete(type.name);
  }

  get(type: string) {
    return this._customTypeMap.get(type);
  }

  has(type: string): boolean {
    return this._customTypeMap.has(type);
  }
}
