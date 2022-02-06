class CacheFlushOptions {
    scope = "";
}
class CacheResultOptions {
    scope = "";
    maxAge; // ms
}

function typeOf(data) {
    if (data === null) {
        return "Null";
    }
    if (data === undefined) {
        return "Undefined";
    }
    const type = Object.prototype.toString.call(data).slice(8, -1);
    if (type === "Object" && data.constructor && data.constructor.name) {
        return data.constructor.name;
    }
    if (type === "Number" && isNaN(data)) {
        return "NaN";
    }
    return type;
}

function deepClone(data) {
    if (!data) {
        return data;
    }
    if (typeof data !== "object") {
        return data;
    }
    if (Array.isArray(data)) {
        return data.map(deepClone);
    }
    else {
        const result = new data.constructor() ?? {};
        for (const key in data) {
            result[key] = deepClone(data[key]);
        }
        return result;
    }
}

/**
 *
 * @param {object} obj 对象
 * @param {string} methodName 字段
 * @param {{before,after}} param2 拦截器
 */
function invader(obj, methodName, { before = (ctx) => null, after = (ctx) => null }) {
    if (!obj || !obj[methodName]) {
        return () => null;
    }
    const rawMethod = obj[methodName];
    Object.defineProperty(obj, methodName, {
        value: function (...args) {
            const ctx = {
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

function addPath(path, key) {
    return path + '.' + key;
}
function Ref(path) {
    return {
        _t_: 'Ref',
        v: path,
    };
}
function isRef(data) {
    return data && typeof data === 'object' && data._t_ === 'Ref';
}

function deepMerge(target, obj) {
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

function fill(instance, props) {
    for (const key in props) {
        if (Object.prototype.hasOwnProperty.call(props, key)) {
            const prop = props[key];
            if (prop !== undefined && prop !== null) {
                instance[key] = prop;
            }
        }
    }
    return instance;
}
function getConstructor(entity) {
    return entity.constructor;
}
function make(Entity, props) {
    if (!props) {
        return undefined;
    }
    return fill(new Entity(), props);
}

function defaultKey(...args) {
    return args.map((item) => JSON.stringify(item)).join(",");
}

export { CacheFlushOptions, CacheResultOptions, Ref, addPath, deepClone, deepMerge, defaultKey, fill, getConstructor, invader, isRef, make, typeOf };
