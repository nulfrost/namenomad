import { vitePlugin as remix } from "@remix-run/dev";
import { installGlobals } from "@remix-run/node";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import babel from "vite-plugin-babel";

installGlobals();

const ReactCompilerConfig = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sources: (filename: any) => {
    return filename.indexOf("./app") !== -1;
  },
};

export default defineConfig({
  plugins: [
    remix(),
    babel({
      filter: /\.[jt]sx?$/,
      babelConfig: {
        presets: ["@babel/preset-typescript"],
        plugins: [["babel-plugin-react-compiler", ReactCompilerConfig]],
      },
    }),
    tsconfigPaths(),
  ],
});
