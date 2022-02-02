export function addPath(path, key) {
    return path + '.' + key;
}
export function Ref(path) {
    return {
        _t_: 'Ref',
        v: path,
    };
}
export function isRef(data) {
    return data && typeof data === 'object' && data._t_ === 'Ref';
}
