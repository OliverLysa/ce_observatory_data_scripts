// src/plugin.ts
import { build, createServer } from "vite";
function vitePlugin(options) {
  return new VitePlugin(options);
}
var VitePlugin = class {
  constructor(options) {
    this.options = options;
  }
  async postGenerate(context) {
    return this.buildIfNeeded(context, "post-generate");
  }
  async postBuild(context) {
    return this.buildIfNeeded(context, "post-build");
  }
  async buildIfNeeded(context, caller) {
    const applyDev = this.options.apply?.development || "post-build";
    const applyProd = this.options.apply?.production || "post-build";
    const shouldBuild = context.config.mode === "development" && applyDev === caller || context.config.mode === "production" && applyProd === caller;
    if (shouldBuild) {
      context.log("info", `Building ${this.options.name}`);
      await build(this.options.config);
    }
    return true;
  }
  async watch() {
    if (this.options.apply?.development === "serve") {
      const server = await createServer(this.options.config);
      await server.listen();
    } else if (this.options.apply?.development === "watch") {
      const config = {
        build: {
          // Enable watch mode
          // TODO: Only do this if not already set up in the given config?
          watch: {}
        },
        ...this.options.config
      };
      await build(config);
    }
  }
};
export {
  vitePlugin
};
//# sourceMappingURL=index.js.map