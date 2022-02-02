import { typeOf } from './datatype';
describe('DataType', () => {
    it('should get type', () => {
        class Test {
        }
        expect(typeOf(null)).toBe('Null');
        expect(typeOf(undefined)).toBe('Undefined');
        expect(typeOf(BigInt(1222))).toBe('BigInt');
        expect(typeOf(Symbol(1222))).toBe('Symbol');
        expect(typeOf('hello')).toBe('String');
        expect(typeOf(1234)).toBe('Number');
        expect(typeOf(true)).toBe('Boolean');
        expect(typeOf(false)).toBe('Boolean');
        expect(typeOf({ a: 1 })).toBe('Object');
        expect(typeOf([{ a: 1 }])).toBe('Array');
        expect(typeOf(new Test())).toBe('Test');
    });
});
