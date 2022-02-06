import { Constructor } from "@coussin/shared";
import { Shim } from "./Shim";
import { NoopShim } from "./shim/noop.shim";
import { Adapter } from "./CacheAdapter";
import { MemoryAdapter } from "./adapter/memory-cache.adapter";

export class CacheOptions<CO, SO> {
  scope?: string = ""; // 作业域
  maxAge?: number = 10000; // s
  threshold?: number = Math.floor(this.maxAge / 3); // s 当过期时间小于这个数字的时候续租
  adapter?: Constructor<Adapter<CO>> = MemoryAdapter;
  options?: CO = {} as CO;
  customTypes?: Constructor<any>[] = [];
  shim?: Constructor<Shim<SO>> = NoopShim;
  shimOptions?: SO = null;
}
