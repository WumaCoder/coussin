import { Cache } from "./cache";
import { make } from "@coussin/shared";
import { MemoryCacheAdapter } from "./adapter/memory-cache.adapter";

class User {
  id: string;
  name: string;
  nick: string;

  roles: Role[];
}

class Role {
  id: string;
  permissions: Permission[];
}

class Permission {
  name: string;
}

describe("Cache", () => {
  it("should be defined", () => {
    const cache = new Cache({
      adapter: MemoryCacheAdapter,
      options: {
        port: 6379,
      },
    });

    expect(cache).toBeDefined();
    expect(cache.cacheAdapter).toBeDefined();
    cache.destroy();
  });

  it("should cache notid data", async () => {
    const cache = new Cache({
      adapter: MemoryCacheAdapter,
      options: {
        port: 6379,
      },
    });
    await cache.set("key", "test");
    expect(await cache.get("key")).toBe("test");
    await cache.set("num", 1234);
    expect(await cache.get("num")).toBe(1234);
    await cache.set("bool", false);
    expect(await cache.get("bool")).toBe(false);
    await cache.set("obj", { test: "test" });
    expect(await cache.get("obj")).toEqual({ test: "test" });
    await cache.set("arrnum", [1, 2, 3]);
    expect(await cache.get("arrnum")).toEqual([1, 2, 3]);
    await cache.set("arrstr", ["a", "b", "c"]);
    expect(await cache.get("arrstr")).toEqual(["a", "b", "c"]);
    await cache.set("arrobj", [{ test: "test" }, { test: "test" }]);
    expect(await cache.get("arrobj")).toEqual([
      { test: "test" },
      { test: "test" },
    ]);
    await cache.set("arrmix", [1, "a", { test: "test" }]);
    expect(await cache.get("arrmix")).toEqual([1, "a", { test: "test" }]);
    await cache.set("objmix", {
      test: "test",
      num: 1234,
      bool: false,
      arr: [1, 2, 3],
      arrmix: [1, "a", { test: "test" }],
    });
    expect(await cache.get("objmix")).toEqual({
      test: "test",
      num: 1234,
      bool: false,
      arr: [1, 2, 3],
      arrmix: [1, "a", { test: "test" }],
    });
    cache.destroy();
  });

  it("should cache user", async () => {
    const cache = new Cache({
      adapter: MemoryCacheAdapter,
      options: {
        port: 6379,
      },
      customTypes: [User, Role, Permission],
    });
    await cache.set(
      "user1",
      make(User, {
        id: "1",
        name: "test",
        nick: "test",
      })
    );
    expect(await cache.get("user1")).toEqual({
      id: "1",
      name: "test",
      nick: "test",
    });
    expect(await cache.get("user1")).toBeInstanceOf(User);
    cache.destroy();
  });

  it("should cache user and role", async () => {
    const cache = new Cache({
      adapter: MemoryCacheAdapter,
      options: {
        port: 6379,
      },
      customTypes: [User, Role, Permission],
    });
    await cache.set(
      "user2",
      make(User, {
        id: "11",
        name: "test",
        nick: "test",
        roles: [
          make(Role, {
            id: "22",
            permissions: [make(Permission, { name: "test" })],
          }),
        ],
      })
    );
    expect(await cache.get("user2")).toStrictEqual(
      make(User, {
        id: "11",
        name: "test",
        nick: "test",
        roles: [
          make(Role, {
            id: "22",
            permissions: [make(Permission, { name: "test" })],
          }),
        ],
      })
    );
    expect(await cache.get("user2")).toBeInstanceOf(User);
    cache.destroy();
  });
});
