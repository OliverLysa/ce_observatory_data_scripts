var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  vitePlugin: () => vitePlugin
});
module.exports = __toCommonJS(src_exports);

// src/plugin.ts
var import_vite = require("vite");
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
      await (0, import_vite.build)(this.options.config);
    }
    return true;
  }
  async watch() {
    if (this.options.apply?.development === "serve") {
      const server = await (0, import_vite.createServer)(this.options.config);
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
      await (0, import_vite.build)(config);
    }
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  vitePlugin
});
//# sourceMappingURL=index.cjs.map