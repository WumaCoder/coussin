import {
  DecoratorKey,
  invader,
  CacheFlushOptions,
  CacheResultOptions,
  defaultKey,
} from "@coussin/shared";
import { CacheManager } from "./CacheManager";

export function createDecorator(scope: string = "default") {
  return {
    CacheResult(
      name?: string,
      key: DecoratorKey = defaultKey,
      options?: CacheResultOptions
    ) {
      options = Object.assign({}, new CacheResultOptions(), { scope }, options);
      return function (
        target: any,
        propertyKey: string,
        descriptor: PropertyDescriptor
      ) {
        name = name ?? `${target.constructor.name}:${propertyKey}`;
        invader(descriptor, "value", {
          async before(ctx) {
            ctx.skip = true;

            const cache = CacheManager.get(options.scope);
            const cacheKey = `${name}:${key(...ctx.args)}`;

            let cacheData = await cache.get(cacheKey);
            if (!cacheData) {
              cacheData = await ctx.rawMethod(...ctx.args);
              await cache.set(cacheKey, cacheData, options);
            }

            return cacheData;
          },
        });
      };
    },
    CacheDelete(
      name: string,
      key: DecoratorKey = () => "*",
      options?: CacheResultOptions
    ) {
      options = Object.assign({}, new CacheResultOptions(), { scope }, options);
      return function (
        target: any,
        propertyKey: string,
        descriptor: PropertyDescriptor
      ) {
        invader(descriptor, "value", {
          async before(ctx) {
            const cache = CacheManager.get(options.scope);
            const cacheKey = `${name}:${key(ctx.args, ctx.returned)}`;

            await cache.del(cacheKey);
          },
        });
      };
    },
    CacheFlush(options?: CacheFlushOptions) {
      options = Object.assign({}, new CacheFlushOptions(), { scope }, options);
      return function (
        target: any,
        propertyKey: string,
        descriptor: PropertyDescriptor
      ) {
        invader(descriptor, "value", {
          async before(ctx) {
            ctx.skip = true;
            const cache = CacheManager.get(options.scope);
            const result = await ctx.rawMethod(...ctx.args);
            await cache.flush(result);
            return result;
          },
        });
      };
    },
  };
}

const defaultDecorator = createDecorator();

export const CacheResult = defaultDecorator.CacheResult;
export const CacheDelete = defaultDecorator.CacheDelete;
export const CacheFlush = defaultDecorator.CacheFlush;
