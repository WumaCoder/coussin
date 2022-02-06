import { Serializer } from "./Serializer";

class Test {
  a = 1;
  b = 2;
}

class A {
  t = new Test();
  a: A;
}

describe("Serializer", () => {
  it("should toJSON", () => {
    const serializer = new Serializer();

    expect(serializer.toJSON(new A())).toEqual({
      t: {
        a: 1,
        b: 2,
        _t_: "Test",
      },
      _t_: "A",
    });
    expect(serializer.toJSON(new Test())).toEqual({
      a: 1,
      b: 2,
      _t_: "Test",
    });
    expect(serializer.toJSON(1)).toEqual(1);
    expect(serializer.toJSON(null)).toEqual(null);
    expect(serializer.toJSON(undefined)).toEqual(undefined);
    expect(serializer.toJSON(true)).toEqual(true);
    expect(serializer.toJSON(false)).toEqual(false);
    expect(serializer.toJSON(new Date("2021-11-12 11:11:11"))).toEqual({
      _t_: "Date",
      v: Date.parse("2021-11-12 11:11:11"),
    });
    expect(serializer.toJSON(new Set([1, 2, 3]))).toEqual({
      _t_: "Set",
      v: [1, 2, 3],
    });
    expect(
      serializer.toJSON(
        new Map([
          ["a", 1],
          ["b", 2],
        ])
      )
    ).toEqual({
      _t_: "Map",
      v: [
        ["a", 1],
        ["b", 2],
      ],
    });
    expect(serializer.toJSON(new Map([["a", 1]]))).toEqual({
      _t_: "Map",
      v: [["a", 1]],
    });
    expect(serializer.toJSON([new A(), new A(), 1])).toEqual([
      { _t_: "A", t: { _t_: "Test", a: 1, b: 2 } },
      { _t_: "A", t: { _t_: "Test", a: 1, b: 2 } },
      1,
    ]);
    expect(serializer.toJSON({ a: new A(), b: new A() })).toEqual({
      a: { _t_: "A", t: { _t_: "Test", a: 1, b: 2 } },
      b: { _t_: "A", t: { _t_: "Test", a: 1, b: 2 } },
      _t_: "Object",
    });
  });

  it("should toJSON for ref object", () => {
    const a = new A();
    a.t = null;
    a.a = a;
    const serializer = new Serializer();
    expect(serializer.toJSON(a)).toEqual({
      _t_: "A",
      t: null,
      a: {
        _t_: "Ref",
        v: "$",
      },
    });
  });

  it("should toJSON for ref array", () => {
    const a = new A();
    a.t = null;
    a.a = a;
    const serializer = new Serializer();
    expect(serializer.toJSON([a, a])).toEqual([
      {
        _t_: "A",
        t: null,
        a: {
          _t_: "Ref",
          v: "$.0",
        },
      },
      {
        _t_: "Ref",
        v: "$.0",
      },
    ]);
  });
  it("should stringify", () => {
    const serializer = new Serializer();
    expect(serializer.stringify("test")).toMatchInlineSnapshot(`"\\"test\\""`);
    expect(serializer.stringify(12345)).toMatchInlineSnapshot(`"12345"`);
    expect(serializer.stringify(true)).toMatchInlineSnapshot(`"true"`);
    expect(serializer.stringify(false)).toMatchInlineSnapshot(`"false"`);
    expect(serializer.stringify(BigInt(122))).toMatchInlineSnapshot(
      `"{\\"_t_\\":\\"BigInt\\",\\"v\\":\\"122\\"}"`
    );
    expect(serializer.stringify(Symbol("xxxx"))).toMatchInlineSnapshot(
      `"{\\"_t_\\":\\"Symbol\\",\\"v\\":\\"Symbol(xxxx)\\"}"`
    );
    expect(serializer.stringify(null)).toMatchInlineSnapshot(`"null"`);
    expect(serializer.stringify(undefined)).toMatchInlineSnapshot(`undefined`);
    expect(serializer.stringify({ a: 1 })).toMatchInlineSnapshot(
      `"{\\"_t_\\":\\"Object\\",\\"a\\":1}"`
    );
    expect(serializer.stringify([{ a: 1 }])).toMatchInlineSnapshot(
      `"[{\\"_t_\\":\\"Object\\",\\"a\\":1}]"`
    );
    expect(serializer.stringify(new Test())).toMatchInlineSnapshot(
      `"{\\"_t_\\":\\"Test\\",\\"a\\":1,\\"b\\":2}"`
    );
    expect(serializer.stringify([new Test()])).toMatchInlineSnapshot(
      `"[{\\"_t_\\":\\"Test\\",\\"a\\":1,\\"b\\":2}]"`
    );
    expect(
      serializer.stringify([new Test(), new Test()])
    ).toMatchInlineSnapshot(
      `"[{\\"_t_\\":\\"Test\\",\\"a\\":1,\\"b\\":2},{\\"_t_\\":\\"Test\\",\\"a\\":1,\\"b\\":2}]"`
    );
    expect(serializer.stringify({ t: new Test() })).toMatchInlineSnapshot(
      `"{\\"_t_\\":\\"Object\\",\\"t\\":{\\"_t_\\":\\"Test\\",\\"a\\":1,\\"b\\":2}}"`
    );
    expect(serializer.stringify(new A())).toMatchInlineSnapshot(
      `"{\\"_t_\\":\\"A\\",\\"t\\":{\\"_t_\\":\\"Test\\",\\"a\\":1,\\"b\\":2}}"`
    );
  });

  it("should toObject", () => {
    const serializer = new Serializer({ customTypes: [A, Test] });
    expect(serializer.toObject("test")).toEqual("test");
    expect(serializer.toObject(12345)).toEqual(12345);
    expect(serializer.toObject(true)).toEqual(true);
    expect(serializer.toObject(false)).toEqual(false);
    expect(serializer.toObject(BigInt(122))).toEqual(BigInt(122));
    expect(serializer.toObject(null)).toEqual(null);
    expect(serializer.toObject(undefined)).toEqual(undefined);
    expect(serializer.toObject({ a: 1 })).toStrictEqual({ a: 1 });
    expect(serializer.toObject([{ a: 1 }])).toStrictEqual([{ a: 1 }]);
    expect(
      serializer.toObject({
        _t_: "Test",
        a: 1,
        b: 2,
      })
    ).toStrictEqual(new Test());
    expect(serializer.toObject([{ _t_: "Test", a: 1, b: 2 }])).toStrictEqual([
      new Test(),
    ]);
    expect(
      serializer.toObject([
        { _t_: "Test", a: 1, b: 2 },
        { _t_: "Test", a: 1, b: 2 },
      ])
    ).toStrictEqual([new Test(), new Test()]);
    expect(
      serializer.toObject({ t: { _t_: "Test", a: 1, b: 2 }, _t_: "Object" })
    ).toStrictEqual({
      t: new Test(),
    });
    expect(
      serializer.toObject({
        _t_: "A",
        t: { _t_: "Test", a: 1, b: 2 },
      })
    ).toStrictEqual(new A());
    expect(
      serializer.toObject({
        _t_: "Object",
        a: {
          _t_: "A",
          t: { _t_: "Test", a: 1, b: 2 },
        },
      })
    ).toStrictEqual({
      a: new A(),
    });
    expect(
      serializer.toObject([
        { _t_: "A", t: { _t_: "Test", a: 1, b: 2 } },
        { _t_: "A", t: { _t_: "Test", a: 1, b: 2 } },
      ])
    ).toStrictEqual([new A(), new A()]);
  });

  it("should toObject for ref object", () => {
    const a = new A();
    a.t = null;
    a.a = a;
    const serializer = new Serializer({ customTypes: [A, Test] });
    const result = serializer.toObject({
      _t_: "A",
      t: null,
      a: {
        _t_: "Ref",
        v: "$",
      },
    });
    expect(result).toStrictEqual(a);
  });

  it("should parse", () => {
    const serializer = new Serializer({ customTypes: [A, Test] });

    expect(serializer.parse('"test"')).toEqual("test");
    expect(
      serializer.parse(`{"_t_":"A","t":{"_t_":"Test","a":1,"b":2}}`)
    ).toStrictEqual(new A());
  });
});
