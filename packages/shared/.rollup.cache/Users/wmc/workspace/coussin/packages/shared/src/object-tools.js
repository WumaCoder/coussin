export function fill(instance, props) {
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
export function getConstructor(entity) {
    return entity.constructor;
}
export function make(Entity, props) {
    if (!props) {
        return undefined;
    }
    return fill(new Entity(), props);
}
