import ts from "@rollup/plugin-typescript";
import { nodeResolve } from "@rollup/plugin-node-resolve";

export default {
  input: "src/index.ts",
  output: [
    {
      file: "lib/coussin-shared.cjs.js",
      format: "cjs",
    },
    {
      file: "lib/coussin-shared.es.js",
      format: "es",
    },
  ],
  plugins: [nodeResolve({ extensions: ["ts", "js"] }), ts({})],
};
