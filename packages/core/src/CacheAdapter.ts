export abstract class Adapter<O> {
  constructor(option: O) {
    this.init(option);
  }

  protected init(option: O) {
    // init cache adapter
  }

  abstract get(key: string): string | Promise<string>;
  abstract set(key: string, value: string, maxAge: number): any | Promise<any>;
  abstract del(key: string): any | Promise<any>;
  abstract expire(key: string, maxAge: number): any | Promise<any>;
  abstract ttl(key: string): number | Promise<number>; // 返回过去时间，单位秒
  abstract destroy(): any | Promise<any>;
  abstract keys(prefix: string): string[] | Promise<string[]>;
  abstract storeDepRelation(
    entityKeys: string[],
    cacheKey: string
  ): any | Promise<any>;
  abstract flush(entityKeys: string[]): any | Promise<any>;
}
