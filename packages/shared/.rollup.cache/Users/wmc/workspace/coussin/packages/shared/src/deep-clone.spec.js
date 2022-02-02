import { deepClone } from './deep-clone';
class User {
    name;
    nick;
    constructor() {
        this.name = 'test';
        this.nick = 'test';
    }
}
describe('DeepClone', () => {
    it('clone user', () => {
        const user = new User();
        const _user = deepClone(user);
        expect(user).toStrictEqual(_user);
        expect(_user).toBeInstanceOf(User);
    });
});
