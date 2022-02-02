type InvaderCtx = {
  args: any[];
  rawMethod: any;
  skip: boolean;
  beforeReturned: any;
  returned: any;
  instance: any;
};

/**
 *
 * @param {object} obj 对象
 * @param {string} methodName 字段
 * @param {{before,after}} param2 拦截器
 */
export function invader<T, K extends keyof T>(
  obj: T,
  methodName: K,
  { before = (ctx: InvaderCtx) => null, after = (ctx: InvaderCtx) => null },
) {
  if (!obj || !obj[methodName]) {
    return () => null;
  }
  const rawMethod: any = obj[methodName];
  Object.defineProperty(obj, methodName, {
    value: function (...args) {
      const ctx: InvaderCtx = {
        args,
        rawMethod: rawMethod.bind(this),
        instance: this,
        skip: false,
        beforeReturned: null,
        returned: null,
      };
      ctx.beforeReturned = before.call(this, ctx);
      if (ctx.skip) {
        return ctx.beforeReturned;
      }
      ctx.returned = rawMethod.apply(this, args);
      after.call(this, ctx);
      return ctx.returned;
    },
    writable: true,
    configurable: true,
  });
  return () => {
    Object.defineProperty(obj, methodName, {
      value: rawMethod,
    });
  };
}
