import ts from "@rollup/plugin-typescript";
import { nodeResolve } from "@rollup/plugin-node-resolve";

export default {
  input: "src/index.ts",
  output: [
    {
      file: "lib/coussin-shim-mikro-orm.cjs.js",
      format: "cjs",
    },
    {
      file: "lib/coussin-shim-mikro-orm.es.js",
      format: "es",
    },
  ],
  external: ["@mikro-orm/core"],
  plugins: [
    nodeResolve({ extensions: [".ts"] }),
    ts({ outputToFilesystem: false }),
  ],
};
