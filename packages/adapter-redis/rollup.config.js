import ts from "@rollup/plugin-typescript";
import { nodeResolve } from "@rollup/plugin-node-resolve";

export default {
  input: "src/index.ts",
  output: [
    {
      file: "lib/coussin-adapter-redis.cjs.js",
      format: "cjs",
    },
    {
      file: "lib/coussin-adapter-redis.es.js",
      format: "es",
    },
  ],
  external: ["ioredis", "jsonpath"],
  plugins: [
    nodeResolve({ extensions: [".ts", ".js"] }),
    ts({ outputToFilesystem: false }),
  ],
};
