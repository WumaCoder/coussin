import ts from "@rollup/plugin-typescript";
import { nodeResolve } from "@rollup/plugin-node-resolve";

export default {
  input: "src/index.ts",
  output: [
    {
      file: "lib/coussin-core.cjs.js",
      format: "cjs",
    },
    {
      file: "lib/coussin-core.es.js",
      format: "es",
    },
  ],
  external: ["jsonpath"],
  plugins: [
    nodeResolve({ extensions: [".ts", ".js"] }),
    ts({
      outputToFilesystem: false,
    }),
  ],
};
