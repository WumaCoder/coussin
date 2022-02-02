import ts from "@rollup/plugin-typescript";

export default {
  input: "src/main.ts",
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
  plugins: [ts({})],
};
