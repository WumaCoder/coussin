import { defaultKey } from "./defaultKey";

describe("defaultKey", () => {
  it("should is key", () => {
    expect(defaultKey(1, { a: 1 })).toBe(`1,{"a":1}`);
    expect(defaultKey(1)).toBe(`1`);
  });
});
