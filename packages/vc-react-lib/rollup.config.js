import peerDepsExternal from "rollup-plugin-peer-deps-external";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "rollup-plugin-typescript2";
import scss from "rollup-plugin-scss";
import Module from "node:module";

const require = Module.createRequire(import.meta.url);

const packageJSON = require("./package.json");

export default {
  input: "src/index.ts",
  output: [
    {
      file: packageJSON.main,
      format: "cjs",
      sourcemap: true,
    },
    {
      file: packageJSON.module,
      format: "esm",
      sourcemap: true,
    },
  ],
  plugins: [
    peerDepsExternal(),
    resolve(),
    commonjs(),
    typescript({
      useTsconfigDeclarationDir: true,
    }),
    scss(),
  ],
};
