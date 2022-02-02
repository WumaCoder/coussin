declare type InvaderCtx = {
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
export declare function invader<T, K extends keyof T>(obj: T, methodName: K, { before, after }: {
    before?: (ctx: InvaderCtx) => any;
    after?: (ctx: InvaderCtx) => any;
}): () => any;
export {};
