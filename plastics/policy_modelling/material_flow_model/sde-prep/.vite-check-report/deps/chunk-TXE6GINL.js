import {
  __commonJS
} from "./chunk-PLDDJCW6.js";

// node_modules/assert-never/index.js
var require_assert_never = __commonJS({
  "node_modules/assert-never/index.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.assertNever = assertNever;
    function assertNever(value, errorMessageOrNoThrow) {
      if (typeof errorMessageOrNoThrow === "string") {
        throw new Error(errorMessageOrNoThrow);
      }
      if (typeof errorMessageOrNoThrow === "function") {
        throw new Error(errorMessageOrNoThrow(value));
      }
      if (errorMessageOrNoThrow) {
        return value;
      }
      throw new Error("Unhandled discriminated union member: ".concat(JSON.stringify(value)));
    }
    exports.default = assertNever;
  }
});

export {
  require_assert_never
};
//# sourceMappingURL=chunk-TXE6GINL.js.map
