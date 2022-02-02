export function deepClone(data) {
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
