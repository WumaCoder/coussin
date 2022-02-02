export function deepMerge(target, obj) {
    // 1 - 基础类型优先存储target[key]
    // 2 - target[key] 如果为null或undef 则读取obj[key]
    // 3 - target 如果是数组则与 obj.length 比较 一样的话进行递归
    if (target && typeof target === "object") {
        for (const key in obj) {
            Reflect.set(target, key, deepMerge(target[key], obj[key]));
        }
        return target;
    }
    else if (Array.isArray(target)) {
        if (target?.length !== obj?.length) {
            return target;
        }
        for (let i = 0; i < target.length; i++) {
            target[i] = deepMerge(target[i], obj[i]);
        }
        return target;
    }
    else {
        return target === null || target === undefined ? obj : target;
    }
}
