export function typeOf(data) {
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
