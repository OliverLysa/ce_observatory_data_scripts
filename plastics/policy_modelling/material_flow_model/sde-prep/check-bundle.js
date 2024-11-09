import * as worker_threads from "worker_threads";
import { EventEmitter } from "events";
import { cpus } from "os";
import * as path from "path";
import { fileURLToPath } from "url";
let __non_webpack_require__ = () => worker_threads;
const DefaultErrorSerializer = {
  deserialize(e) {
    return Object.assign(Error(e.message), {
      name: e.name,
      stack: e.stack
    });
  },
  serialize(e) {
    return {
      __error_marker: "$$error",
      message: e.message,
      name: e.name,
      stack: e.stack
    };
  }
}, isSerializedError = (e) => e && typeof e == "object" && "__error_marker" in e && e.__error_marker === "$$error", DefaultSerializer = {
  deserialize(e) {
    return isSerializedError(e) ? DefaultErrorSerializer.deserialize(e) : e;
  },
  serialize(e) {
    return e instanceof Error ? DefaultErrorSerializer.serialize(e) : e;
  }
};
let registeredSerializer = DefaultSerializer;
function deserialize(e) {
  return registeredSerializer.deserialize(e);
}
function serialize(e) {
  return registeredSerializer.serialize(e);
}
let bundleURL;
function getBundleURLCached() {
  return bundleURL || (bundleURL = getBundleURL()), bundleURL;
}
function getBundleURL() {
  try {
    throw new Error();
  } catch (e) {
    const t = ("" + e.stack).match(/(https?|file|ftp|chrome-extension|moz-extension):\/\/[^)\n]+/g);
    if (t)
      return getBaseURL(t[0]);
  }
  return "/";
}
function getBaseURL(e) {
  return ("" + e).replace(/^((?:https?|file|ftp|chrome-extension|moz-extension):\/\/.+)?\/[^/]+(?:\?.*)?$/, "$1") + "/";
}
const defaultPoolSize$1 = typeof navigator < "u" && navigator.hardwareConcurrency ? navigator.hardwareConcurrency : 4, isAbsoluteURL = (e) => /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(e);
function createSourceBlobURL(e) {
  const t = new Blob([e], { type: "application/javascript" });
  return URL.createObjectURL(t);
}
function selectWorkerImplementation$1() {
  if (typeof Worker > "u")
    return class {
      constructor() {
        throw Error("No web worker implementation available. You might have tried to spawn a worker within a worker in a browser that doesn't support workers in workers.");
      }
    };
  class e extends Worker {
    constructor(n, s) {
      var o, a;
      typeof n == "string" && s && s._baseURL ? n = new URL(n, s._baseURL) : typeof n == "string" && !isAbsoluteURL(n) && getBundleURLCached().match(/^file:\/\//i) && (n = new URL(n, getBundleURLCached().replace(/\/[^\/]+$/, "/")), (!((o = s == null ? void 0 : s.CORSWorkaround) !== null && o !== void 0) || o) && (n = createSourceBlobURL(`importScripts(${JSON.stringify(n)});`))), typeof n == "string" && isAbsoluteURL(n) && (!((a = s == null ? void 0 : s.CORSWorkaround) !== null && a !== void 0) || a) && (n = createSourceBlobURL(`importScripts(${JSON.stringify(n)});`)), super(n, s);
    }
  }
  class t extends e {
    constructor(n, s) {
      const o = window.URL.createObjectURL(n);
      super(o, s);
    }
    static fromText(n, s) {
      const o = new window.Blob([n], { type: "text/javascript" });
      return new t(o, s);
    }
  }
  return {
    blob: t,
    default: e
  };
}
let implementation$3;
function getWorkerImplementation$2() {
  return implementation$3 || (implementation$3 = selectWorkerImplementation$1()), implementation$3;
}
function isWorkerRuntime$4() {
  const e = typeof self < "u" && typeof Window < "u" && self instanceof Window;
  return !!(typeof self < "u" && self.postMessage && !e);
}
const BrowserImplementation = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  defaultPoolSize: defaultPoolSize$1,
  getWorkerImplementation: getWorkerImplementation$2,
  isWorkerRuntime: isWorkerRuntime$4
}, Symbol.toStringTag, { value: "Module" })), getCallsites = {};
let tsNodeAvailable;
const defaultPoolSize = cpus().length;
function detectTsNode() {
  if (typeof __non_webpack_require__ == "function")
    return !1;
  if (tsNodeAvailable)
    return tsNodeAvailable;
  try {
    eval("require").resolve("ts-node"), tsNodeAvailable = !0;
  } catch (e) {
    if (e && e.code === "MODULE_NOT_FOUND")
      tsNodeAvailable = !1;
    else
      throw e;
  }
  return tsNodeAvailable;
}
function createTsNodeModule(e) {
  return `
    require("ts-node/register/transpile-only");
    require(${JSON.stringify(e)});
  `;
}
function rebaseScriptPath(e, t) {
  const r = getCallsites().find((a) => {
    const l = a.getFileName();
    return !!(l && !l.match(t) && !l.match(/[\/\\]master[\/\\]implementation/) && !l.match(/^internal\/process/));
  }), n = r ? r.getFileName() : null;
  let s = n || null;
  return s && s.startsWith("file:") && (s = fileURLToPath(s)), s ? path.join(path.dirname(s), e) : e;
}
function resolveScriptPath(scriptPath, baseURL) {
  const makeRelative = (filePath) => path.isAbsolute(filePath) ? filePath : path.join(baseURL || eval("__dirname"), filePath), workerFilePath = typeof __non_webpack_require__ == "function" ? __non_webpack_require__.resolve(makeRelative(scriptPath)) : eval("require").resolve(makeRelative(rebaseScriptPath(scriptPath, /[\/\\]worker_threads[\/\\]/)));
  return workerFilePath;
}
function initWorkerThreadsWorker() {
  const NativeWorker = typeof __non_webpack_require__ == "function" ? __non_webpack_require__("worker_threads").Worker : eval("require")("worker_threads").Worker;
  let allWorkers = [];
  class Worker extends NativeWorker {
    constructor(t, r) {
      const n = r && r.fromSource ? null : resolveScriptPath(t, (r || {})._baseURL);
      if (n)
        n.match(/\.tsx?$/i) && detectTsNode() ? super(createTsNodeModule(n), Object.assign(Object.assign({}, r), { eval: !0 })) : n.match(/\.asar[\/\\]/) ? super(n.replace(/\.asar([\/\\])/, ".asar.unpacked$1"), r) : super(n, r);
      else {
        const s = t;
        super(s, Object.assign(Object.assign({}, r), { eval: !0 }));
      }
      this.mappedEventListeners = /* @__PURE__ */ new WeakMap(), allWorkers.push(this);
    }
    addEventListener(t, r) {
      const n = (s) => {
        r({ data: s });
      };
      this.mappedEventListeners.set(r, n), this.on(t, n);
    }
    removeEventListener(t, r) {
      const n = this.mappedEventListeners.get(r) || r;
      this.off(t, n);
    }
  }
  const terminateWorkersAndMaster = () => {
    Promise.all(allWorkers.map((e) => e.terminate())).then(() => process.exit(0), () => process.exit(1)), allWorkers = [];
  };
  process.on("SIGINT", () => terminateWorkersAndMaster()), process.on("SIGTERM", () => terminateWorkersAndMaster());
  class BlobWorker extends Worker {
    constructor(t, r) {
      super(Buffer.from(t).toString("utf-8"), Object.assign(Object.assign({}, r), { fromSource: !0 }));
    }
    static fromText(t, r) {
      return new Worker(t, Object.assign(Object.assign({}, r), { fromSource: !0 }));
    }
  }
  return {
    blob: BlobWorker,
    default: Worker
  };
}
function initTinyWorker() {
  const e = require("tiny-worker");
  let t = [];
  class r extends e {
    constructor(a, l) {
      const c = l && l.fromSource ? null : process.platform === "win32" ? `file:///${resolveScriptPath(a).replace(/\\/g, "/")}` : resolveScriptPath(a);
      if (c)
        c.match(/\.tsx?$/i) && detectTsNode() ? super(new Function(createTsNodeModule(resolveScriptPath(a))), [], { esm: !0 }) : c.match(/\.asar[\/\\]/) ? super(c.replace(/\.asar([\/\\])/, ".asar.unpacked$1"), [], { esm: !0 }) : super(c, [], { esm: !0 });
      else {
        const u = a;
        super(new Function(u), [], { esm: !0 });
      }
      t.push(this), this.emitter = new EventEmitter(), this.onerror = (u) => this.emitter.emit("error", u), this.onmessage = (u) => this.emitter.emit("message", u);
    }
    addEventListener(a, l) {
      this.emitter.addListener(a, l);
    }
    removeEventListener(a, l) {
      this.emitter.removeListener(a, l);
    }
    terminate() {
      return t = t.filter((a) => a !== this), super.terminate();
    }
  }
  const n = () => {
    Promise.all(t.map((o) => o.terminate())).then(() => process.exit(0), () => process.exit(1)), t = [];
  };
  process.on("SIGINT", () => n()), process.on("SIGTERM", () => n());
  class s extends r {
    constructor(a, l) {
      super(Buffer.from(a).toString("utf-8"), Object.assign(Object.assign({}, l), { fromSource: !0 }));
    }
    static fromText(a, l) {
      return new r(a, Object.assign(Object.assign({}, l), { fromSource: !0 }));
    }
  }
  return {
    blob: s,
    default: r
  };
}
let implementation$2, isTinyWorker;
function selectWorkerImplementation() {
  try {
    return isTinyWorker = !1, initWorkerThreadsWorker();
  } catch {
    return console.debug("Node worker_threads not available. Trying to fall back to tiny-worker polyfill..."), isTinyWorker = !0, initTinyWorker();
  }
}
function getWorkerImplementation$1() {
  return implementation$2 || (implementation$2 = selectWorkerImplementation()), implementation$2;
}
function isWorkerRuntime$3() {
  if (isTinyWorker)
    return !!(typeof self < "u" && self.postMessage);
  {
    const isMainThread = typeof __non_webpack_require__ == "function" ? __non_webpack_require__("worker_threads").isMainThread : eval("require")("worker_threads").isMainThread;
    return !isMainThread;
  }
}
const NodeImplementation = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  defaultPoolSize,
  getWorkerImplementation: getWorkerImplementation$1,
  isWorkerRuntime: isWorkerRuntime$3
}, Symbol.toStringTag, { value: "Module" })), runningInNode$1 = typeof process < "u" && process.arch !== "browser" && "pid" in process, implementation$1 = runningInNode$1 ? NodeImplementation : BrowserImplementation, getWorkerImplementation = implementation$1.getWorkerImplementation;
function getDefaultExportFromCjs(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
var browser = { exports: {} }, ms, hasRequiredMs;
function requireMs() {
  if (hasRequiredMs) return ms;
  hasRequiredMs = 1;
  var e = 1e3, t = e * 60, r = t * 60, n = r * 24, s = n * 7, o = n * 365.25;
  ms = function(i, d) {
    d = d || {};
    var f = typeof i;
    if (f === "string" && i.length > 0)
      return a(i);
    if (f === "number" && isFinite(i))
      return d.long ? c(i) : l(i);
    throw new Error(
      "val is not a non-empty string or a valid number. val=" + JSON.stringify(i)
    );
  };
  function a(i) {
    if (i = String(i), !(i.length > 100)) {
      var d = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(
        i
      );
      if (d) {
        var f = parseFloat(d[1]), p = (d[2] || "ms").toLowerCase();
        switch (p) {
          case "years":
          case "year":
          case "yrs":
          case "yr":
          case "y":
            return f * o;
          case "weeks":
          case "week":
          case "w":
            return f * s;
          case "days":
          case "day":
          case "d":
            return f * n;
          case "hours":
          case "hour":
          case "hrs":
          case "hr":
          case "h":
            return f * r;
          case "minutes":
          case "minute":
          case "mins":
          case "min":
          case "m":
            return f * t;
          case "seconds":
          case "second":
          case "secs":
          case "sec":
          case "s":
            return f * e;
          case "milliseconds":
          case "millisecond":
          case "msecs":
          case "msec":
          case "ms":
            return f;
          default:
            return;
        }
      }
    }
  }
  function l(i) {
    var d = Math.abs(i);
    return d >= n ? Math.round(i / n) + "d" : d >= r ? Math.round(i / r) + "h" : d >= t ? Math.round(i / t) + "m" : d >= e ? Math.round(i / e) + "s" : i + "ms";
  }
  function c(i) {
    var d = Math.abs(i);
    return d >= n ? u(i, d, n, "day") : d >= r ? u(i, d, r, "hour") : d >= t ? u(i, d, t, "minute") : d >= e ? u(i, d, e, "second") : i + " ms";
  }
  function u(i, d, f, p) {
    var v = d >= f * 1.5;
    return Math.round(i / f) + " " + p + (v ? "s" : "");
  }
  return ms;
}
function setup(e) {
  r.debug = r, r.default = r, r.coerce = c, r.disable = o, r.enable = s, r.enabled = a, r.humanize = requireMs(), r.destroy = u, Object.keys(e).forEach((i) => {
    r[i] = e[i];
  }), r.names = [], r.skips = [], r.formatters = {};
  function t(i) {
    let d = 0;
    for (let f = 0; f < i.length; f++)
      d = (d << 5) - d + i.charCodeAt(f), d |= 0;
    return r.colors[Math.abs(d) % r.colors.length];
  }
  r.selectColor = t;
  function r(i) {
    let d, f = null, p, v;
    function b(...h) {
      if (!b.enabled)
        return;
      const y = b, I = Number(/* @__PURE__ */ new Date()), _ = I - (d || I);
      y.diff = _, y.prev = d, y.curr = I, d = I, h[0] = r.coerce(h[0]), typeof h[0] != "string" && h.unshift("%O");
      let m = 0;
      h[0] = h[0].replace(/%([a-zA-Z%])/g, (g, w) => {
        if (g === "%%")
          return "%";
        m++;
        const M = r.formatters[w];
        if (typeof M == "function") {
          const k = h[m];
          g = M.call(y, k), h.splice(m, 1), m--;
        }
        return g;
      }), r.formatArgs.call(y, h), (y.log || r.log).apply(y, h);
    }
    return b.namespace = i, b.useColors = r.useColors(), b.color = r.selectColor(i), b.extend = n, b.destroy = r.destroy, Object.defineProperty(b, "enabled", {
      enumerable: !0,
      configurable: !1,
      get: () => f !== null ? f : (p !== r.namespaces && (p = r.namespaces, v = r.enabled(i)), v),
      set: (h) => {
        f = h;
      }
    }), typeof r.init == "function" && r.init(b), b;
  }
  function n(i, d) {
    const f = r(this.namespace + (typeof d > "u" ? ":" : d) + i);
    return f.log = this.log, f;
  }
  function s(i) {
    r.save(i), r.namespaces = i, r.names = [], r.skips = [];
    let d;
    const f = (typeof i == "string" ? i : "").split(/[\s,]+/), p = f.length;
    for (d = 0; d < p; d++)
      f[d] && (i = f[d].replace(/\*/g, ".*?"), i[0] === "-" ? r.skips.push(new RegExp("^" + i.slice(1) + "$")) : r.names.push(new RegExp("^" + i + "$")));
  }
  function o() {
    const i = [
      ...r.names.map(l),
      ...r.skips.map(l).map((d) => "-" + d)
    ].join(",");
    return r.enable(""), i;
  }
  function a(i) {
    if (i[i.length - 1] === "*")
      return !0;
    let d, f;
    for (d = 0, f = r.skips.length; d < f; d++)
      if (r.skips[d].test(i))
        return !1;
    for (d = 0, f = r.names.length; d < f; d++)
      if (r.names[d].test(i))
        return !0;
    return !1;
  }
  function l(i) {
    return i.toString().substring(2, i.toString().length - 2).replace(/\.\*\?$/, "*");
  }
  function c(i) {
    return i instanceof Error ? i.stack || i.message : i;
  }
  function u() {
    console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.");
  }
  return r.enable(r.load()), r;
}
var common = setup;
(function(e, t) {
  t.formatArgs = n, t.save = s, t.load = o, t.useColors = r, t.storage = a(), t.destroy = /* @__PURE__ */ (() => {
    let c = !1;
    return () => {
      c || (c = !0, console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`."));
    };
  })(), t.colors = [
    "#0000CC",
    "#0000FF",
    "#0033CC",
    "#0033FF",
    "#0066CC",
    "#0066FF",
    "#0099CC",
    "#0099FF",
    "#00CC00",
    "#00CC33",
    "#00CC66",
    "#00CC99",
    "#00CCCC",
    "#00CCFF",
    "#3300CC",
    "#3300FF",
    "#3333CC",
    "#3333FF",
    "#3366CC",
    "#3366FF",
    "#3399CC",
    "#3399FF",
    "#33CC00",
    "#33CC33",
    "#33CC66",
    "#33CC99",
    "#33CCCC",
    "#33CCFF",
    "#6600CC",
    "#6600FF",
    "#6633CC",
    "#6633FF",
    "#66CC00",
    "#66CC33",
    "#9900CC",
    "#9900FF",
    "#9933CC",
    "#9933FF",
    "#99CC00",
    "#99CC33",
    "#CC0000",
    "#CC0033",
    "#CC0066",
    "#CC0099",
    "#CC00CC",
    "#CC00FF",
    "#CC3300",
    "#CC3333",
    "#CC3366",
    "#CC3399",
    "#CC33CC",
    "#CC33FF",
    "#CC6600",
    "#CC6633",
    "#CC9900",
    "#CC9933",
    "#CCCC00",
    "#CCCC33",
    "#FF0000",
    "#FF0033",
    "#FF0066",
    "#FF0099",
    "#FF00CC",
    "#FF00FF",
    "#FF3300",
    "#FF3333",
    "#FF3366",
    "#FF3399",
    "#FF33CC",
    "#FF33FF",
    "#FF6600",
    "#FF6633",
    "#FF9900",
    "#FF9933",
    "#FFCC00",
    "#FFCC33"
  ];
  function r() {
    if (typeof window < "u" && window.process && (window.process.type === "renderer" || window.process.__nwjs))
      return !0;
    if (typeof navigator < "u" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/))
      return !1;
    let c;
    return typeof document < "u" && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance || // Is firebug? http://stackoverflow.com/a/398120/376773
    typeof window < "u" && window.console && (window.console.firebug || window.console.exception && window.console.table) || // Is firefox >= v31?
    // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
    typeof navigator < "u" && navigator.userAgent && (c = navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/)) && parseInt(c[1], 10) >= 31 || // Double check webkit in userAgent just in case we are in a worker
    typeof navigator < "u" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/);
  }
  function n(c) {
    if (c[0] = (this.useColors ? "%c" : "") + this.namespace + (this.useColors ? " %c" : " ") + c[0] + (this.useColors ? "%c " : " ") + "+" + e.exports.humanize(this.diff), !this.useColors)
      return;
    const u = "color: " + this.color;
    c.splice(1, 0, u, "color: inherit");
    let i = 0, d = 0;
    c[0].replace(/%[a-zA-Z%]/g, (f) => {
      f !== "%%" && (i++, f === "%c" && (d = i));
    }), c.splice(d, 0, u);
  }
  t.log = console.debug || console.log || (() => {
  });
  function s(c) {
    try {
      c ? t.storage.setItem("debug", c) : t.storage.removeItem("debug");
    } catch {
    }
  }
  function o() {
    let c;
    try {
      c = t.storage.getItem("debug");
    } catch {
    }
    return !c && typeof process < "u" && "env" in process && (c = process.env.DEBUG), c;
  }
  function a() {
    try {
      return localStorage;
    } catch {
    }
  }
  e.exports = common(t);
  const { formatters: l } = e.exports;
  l.j = function(c) {
    try {
      return JSON.stringify(c);
    } catch (u) {
      return "[UnexpectedJSONParseError]: " + u.message;
    }
  };
})(browser, browser.exports);
var browserExports = browser.exports;
const DebugLogger = /* @__PURE__ */ getDefaultExportFromCjs(browserExports), hasSymbols = () => typeof Symbol == "function", hasSymbol = (e) => hasSymbols() && !!Symbol[e], getSymbol = (e) => hasSymbol(e) ? Symbol[e] : "@@" + e;
hasSymbol("asyncIterator") || (Symbol.asyncIterator = Symbol.asyncIterator || Symbol.for("Symbol.asyncIterator"));
const SymbolIterator = getSymbol("iterator"), SymbolObservable = getSymbol("observable"), SymbolSpecies = getSymbol("species");
function getMethod(e, t) {
  const r = e[t];
  if (r != null) {
    if (typeof r != "function")
      throw new TypeError(r + " is not a function");
    return r;
  }
}
function getSpecies(e) {
  let t = e.constructor;
  return t !== void 0 && (t = t[SymbolSpecies], t === null && (t = void 0)), t !== void 0 ? t : Observable;
}
function isObservable(e) {
  return e instanceof Observable;
}
function hostReportError(e) {
  hostReportError.log ? hostReportError.log(e) : setTimeout(() => {
    throw e;
  }, 0);
}
function enqueue(e) {
  Promise.resolve().then(() => {
    try {
      e();
    } catch (t) {
      hostReportError(t);
    }
  });
}
function cleanupSubscription(e) {
  const t = e._cleanup;
  if (t !== void 0 && (e._cleanup = void 0, !!t))
    try {
      if (typeof t == "function")
        t();
      else {
        const r = getMethod(t, "unsubscribe");
        r && r.call(t);
      }
    } catch (r) {
      hostReportError(r);
    }
}
function closeSubscription(e) {
  e._observer = void 0, e._queue = void 0, e._state = "closed";
}
function flushSubscription(e) {
  const t = e._queue;
  if (t) {
    e._queue = void 0, e._state = "ready";
    for (const r of t)
      if (notifySubscription(e, r.type, r.value), e._state === "closed")
        break;
  }
}
function notifySubscription(e, t, r) {
  e._state = "running";
  const n = e._observer;
  try {
    const s = n ? getMethod(n, t) : void 0;
    switch (t) {
      case "next":
        s && s.call(n, r);
        break;
      case "error":
        if (closeSubscription(e), s)
          s.call(n, r);
        else
          throw r;
        break;
      case "complete":
        closeSubscription(e), s && s.call(n);
        break;
    }
  } catch (s) {
    hostReportError(s);
  }
  e._state === "closed" ? cleanupSubscription(e) : e._state === "running" && (e._state = "ready");
}
function onNotify(e, t, r) {
  if (e._state !== "closed") {
    if (e._state === "buffering") {
      e._queue = e._queue || [], e._queue.push({ type: t, value: r });
      return;
    }
    if (e._state !== "ready") {
      e._state = "buffering", e._queue = [{ type: t, value: r }], enqueue(() => flushSubscription(e));
      return;
    }
    notifySubscription(e, t, r);
  }
}
class Subscription {
  constructor(t, r) {
    this._cleanup = void 0, this._observer = t, this._queue = void 0, this._state = "initializing";
    const n = new SubscriptionObserver(this);
    try {
      this._cleanup = r.call(void 0, n);
    } catch (s) {
      n.error(s);
    }
    this._state === "initializing" && (this._state = "ready");
  }
  get closed() {
    return this._state === "closed";
  }
  unsubscribe() {
    this._state !== "closed" && (closeSubscription(this), cleanupSubscription(this));
  }
}
class SubscriptionObserver {
  constructor(t) {
    this._subscription = t;
  }
  get closed() {
    return this._subscription._state === "closed";
  }
  next(t) {
    onNotify(this._subscription, "next", t);
  }
  error(t) {
    onNotify(this._subscription, "error", t);
  }
  complete() {
    onNotify(this._subscription, "complete");
  }
}
class Observable {
  constructor(t) {
    if (!(this instanceof Observable))
      throw new TypeError("Observable cannot be called as a function");
    if (typeof t != "function")
      throw new TypeError("Observable initializer must be a function");
    this._subscriber = t;
  }
  subscribe(t, r, n) {
    return (typeof t != "object" || t === null) && (t = {
      next: t,
      error: r,
      complete: n
    }), new Subscription(t, this._subscriber);
  }
  pipe(t, ...r) {
    let n = this;
    for (const s of [t, ...r])
      n = s(n);
    return n;
  }
  tap(t, r, n) {
    const s = typeof t != "object" || t === null ? {
      next: t,
      error: r,
      complete: n
    } : t;
    return new Observable((o) => this.subscribe({
      next(a) {
        s.next && s.next(a), o.next(a);
      },
      error(a) {
        s.error && s.error(a), o.error(a);
      },
      complete() {
        s.complete && s.complete(), o.complete();
      },
      start(a) {
        s.start && s.start(a);
      }
    }));
  }
  forEach(t) {
    return new Promise((r, n) => {
      if (typeof t != "function") {
        n(new TypeError(t + " is not a function"));
        return;
      }
      function s() {
        o.unsubscribe(), r(void 0);
      }
      const o = this.subscribe({
        next(a) {
          try {
            t(a, s);
          } catch (l) {
            n(l), o.unsubscribe();
          }
        },
        error(a) {
          n(a);
        },
        complete() {
          r(void 0);
        }
      });
    });
  }
  map(t) {
    if (typeof t != "function")
      throw new TypeError(t + " is not a function");
    const r = getSpecies(this);
    return new r((n) => this.subscribe({
      next(s) {
        let o = s;
        try {
          o = t(s);
        } catch (a) {
          return n.error(a);
        }
        n.next(o);
      },
      error(s) {
        n.error(s);
      },
      complete() {
        n.complete();
      }
    }));
  }
  filter(t) {
    if (typeof t != "function")
      throw new TypeError(t + " is not a function");
    const r = getSpecies(this);
    return new r((n) => this.subscribe({
      next(s) {
        try {
          if (!t(s))
            return;
        } catch (o) {
          return n.error(o);
        }
        n.next(s);
      },
      error(s) {
        n.error(s);
      },
      complete() {
        n.complete();
      }
    }));
  }
  reduce(t, r) {
    if (typeof t != "function")
      throw new TypeError(t + " is not a function");
    const n = getSpecies(this), s = arguments.length > 1;
    let o = !1, a = r;
    return new n((l) => this.subscribe({
      next(c) {
        const u = !o;
        if (o = !0, !u || s)
          try {
            a = t(a, c);
          } catch (i) {
            return l.error(i);
          }
        else
          a = c;
      },
      error(c) {
        l.error(c);
      },
      complete() {
        if (!o && !s)
          return l.error(new TypeError("Cannot reduce an empty sequence"));
        l.next(a), l.complete();
      }
    }));
  }
  concat(...t) {
    const r = getSpecies(this);
    return new r((n) => {
      let s, o = 0;
      function a(l) {
        s = l.subscribe({
          next(c) {
            n.next(c);
          },
          error(c) {
            n.error(c);
          },
          complete() {
            o === t.length ? (s = void 0, n.complete()) : a(r.from(t[o++]));
          }
        });
      }
      return a(this), () => {
        s && (s.unsubscribe(), s = void 0);
      };
    });
  }
  flatMap(t) {
    if (typeof t != "function")
      throw new TypeError(t + " is not a function");
    const r = getSpecies(this);
    return new r((n) => {
      const s = [], o = this.subscribe({
        next(l) {
          let c;
          if (t)
            try {
              c = t(l);
            } catch (i) {
              return n.error(i);
            }
          else
            c = l;
          const u = r.from(c).subscribe({
            next(i) {
              n.next(i);
            },
            error(i) {
              n.error(i);
            },
            complete() {
              const i = s.indexOf(u);
              i >= 0 && s.splice(i, 1), a();
            }
          });
          s.push(u);
        },
        error(l) {
          n.error(l);
        },
        complete() {
          a();
        }
      });
      function a() {
        o.closed && s.length === 0 && n.complete();
      }
      return () => {
        s.forEach((l) => l.unsubscribe()), o.unsubscribe();
      };
    });
  }
  [SymbolObservable]() {
    return this;
  }
  static from(t) {
    const r = typeof this == "function" ? this : Observable;
    if (t == null)
      throw new TypeError(t + " is not an object");
    const n = getMethod(t, SymbolObservable);
    if (n) {
      const s = n.call(t);
      if (Object(s) !== s)
        throw new TypeError(s + " is not an object");
      return isObservable(s) && s.constructor === r ? s : new r((o) => s.subscribe(o));
    }
    if (hasSymbol("iterator")) {
      const s = getMethod(t, SymbolIterator);
      if (s)
        return new r((o) => {
          enqueue(() => {
            if (!o.closed) {
              for (const a of s.call(t))
                if (o.next(a), o.closed)
                  return;
              o.complete();
            }
          });
        });
    }
    if (Array.isArray(t))
      return new r((s) => {
        enqueue(() => {
          if (!s.closed) {
            for (const o of t)
              if (s.next(o), s.closed)
                return;
            s.complete();
          }
        });
      });
    throw new TypeError(t + " is not observable");
  }
  static of(...t) {
    const r = typeof this == "function" ? this : Observable;
    return new r((n) => {
      enqueue(() => {
        if (!n.closed) {
          for (const s of t)
            if (n.next(s), n.closed)
              return;
          n.complete();
        }
      });
    });
  }
  static get [SymbolSpecies]() {
    return this;
  }
}
hasSymbols() && Object.defineProperty(Observable, Symbol("extensions"), {
  value: {
    symbol: SymbolObservable,
    hostReportError
  },
  configurable: !0
});
function unsubscribe(e) {
  typeof e == "function" ? e() : e && typeof e.unsubscribe == "function" && e.unsubscribe();
}
class MulticastSubject extends Observable {
  constructor() {
    super((t) => (this._observers.add(t), () => this._observers.delete(t))), this._observers = /* @__PURE__ */ new Set();
  }
  next(t) {
    for (const r of this._observers)
      r.next(t);
  }
  error(t) {
    for (const r of this._observers)
      r.error(t);
  }
  complete() {
    for (const t of this._observers)
      t.complete();
  }
}
function multicast(e) {
  const t = new MulticastSubject();
  let r, n = 0;
  return new Observable((s) => {
    r || (r = e.subscribe(t));
    const o = t.subscribe(s);
    return n++, () => {
      n--, o.unsubscribe(), n === 0 && (unsubscribe(r), r = void 0);
    };
  });
}
const $errors = Symbol("thread.errors"), $events = Symbol("thread.events"), $terminate = Symbol("thread.terminate"), $transferable = Symbol("thread.transferable"), $worker = Symbol("thread.worker");
function fail$1(e) {
  throw Error(e);
}
const Thread = {
  /** Return an observable that can be used to subscribe to all errors happening in the thread. */
  errors(e) {
    return e[$errors] || fail$1("Error observable not found. Make sure to pass a thread instance as returned by the spawn() promise.");
  },
  /** Return an observable that can be used to subscribe to internal events happening in the thread. Useful for debugging. */
  events(e) {
    return e[$events] || fail$1("Events observable not found. Make sure to pass a thread instance as returned by the spawn() promise.");
  },
  /** Terminate a thread. Remember to terminate every thread when you are done using it. */
  terminate(e) {
    return e[$terminate]();
  }
}, doNothing$1 = () => {
};
function createPromiseWithResolver() {
  let e = !1, t, r = doNothing$1;
  return [new Promise((o) => {
    e ? o(t) : r = o;
  }), (o) => {
    e = !0, t = o, r(t);
  }];
}
var WorkerEventType;
(function(e) {
  e.internalError = "internalError", e.message = "message", e.termination = "termination";
})(WorkerEventType || (WorkerEventType = {}));
const doNothing = () => {
}, returnInput = (e) => e, runDeferred = (e) => Promise.resolve().then(e);
function fail(e) {
  throw e;
}
function isThenable(e) {
  return e && typeof e.then == "function";
}
class ObservablePromise extends Observable {
  constructor(t) {
    super((r) => {
      const n = this, s = Object.assign(Object.assign({}, r), {
        complete() {
          r.complete(), n.onCompletion();
        },
        error(o) {
          r.error(o), n.onError(o);
        },
        next(o) {
          r.next(o), n.onNext(o);
        }
      });
      try {
        return this.initHasRun = !0, t(s);
      } catch (o) {
        s.error(o);
      }
    }), this.initHasRun = !1, this.fulfillmentCallbacks = [], this.rejectionCallbacks = [], this.firstValueSet = !1, this.state = "pending";
  }
  onNext(t) {
    this.firstValueSet || (this.firstValue = t, this.firstValueSet = !0);
  }
  onError(t) {
    this.state = "rejected", this.rejection = t;
    for (const r of this.rejectionCallbacks)
      runDeferred(() => r(t));
  }
  onCompletion() {
    this.state = "fulfilled";
    for (const t of this.fulfillmentCallbacks)
      runDeferred(() => t(this.firstValue));
  }
  then(t, r) {
    const n = t || returnInput, s = r || fail;
    let o = !1;
    return new Promise((a, l) => {
      const c = (i) => {
        if (!o) {
          o = !0;
          try {
            a(s(i));
          } catch (d) {
            l(d);
          }
        }
      }, u = (i) => {
        try {
          a(n(i));
        } catch (d) {
          c(d);
        }
      };
      if (this.initHasRun || this.subscribe({ error: c }), this.state === "fulfilled")
        return a(n(this.firstValue));
      if (this.state === "rejected")
        return o = !0, a(s(this.rejection));
      this.fulfillmentCallbacks.push(u), this.rejectionCallbacks.push(c);
    });
  }
  catch(t) {
    return this.then(void 0, t);
  }
  finally(t) {
    const r = t || doNothing;
    return this.then((n) => (r(), n), () => r());
  }
  static from(t) {
    return isThenable(t) ? new ObservablePromise((r) => {
      const n = (o) => {
        r.next(o), r.complete();
      }, s = (o) => {
        r.error(o);
      };
      t.then(n, s);
    }) : super.from(t);
  }
}
function isTransferable(e) {
  return !(!e || typeof e != "object");
}
function isTransferDescriptor(e) {
  return e && typeof e == "object" && e[$transferable];
}
function Transfer(e, t) {
  if (!t) {
    if (!isTransferable(e))
      throw Error();
    t = [e];
  }
  return {
    [$transferable]: !0,
    send: e,
    transferables: t
  };
}
var MasterMessageType;
(function(e) {
  e.cancel = "cancel", e.run = "run";
})(MasterMessageType || (MasterMessageType = {}));
var WorkerMessageType;
(function(e) {
  e.error = "error", e.init = "init", e.result = "result", e.running = "running", e.uncaughtError = "uncaughtError";
})(WorkerMessageType || (WorkerMessageType = {}));
const debugMessages$1 = DebugLogger("threads:master:messages");
let nextJobUID = 1;
const dedupe = (e) => Array.from(new Set(e)), isJobErrorMessage = (e) => e && e.type === WorkerMessageType.error, isJobResultMessage = (e) => e && e.type === WorkerMessageType.result, isJobStartMessage = (e) => e && e.type === WorkerMessageType.running;
function createObservableForJob(e, t) {
  return new Observable((r) => {
    let n;
    const s = (o) => {
      if (debugMessages$1("Message from worker:", o.data), !(!o.data || o.data.uid !== t)) {
        if (isJobStartMessage(o.data))
          n = o.data.resultType;
        else if (isJobResultMessage(o.data))
          n === "promise" ? (typeof o.data.payload < "u" && r.next(deserialize(o.data.payload)), r.complete(), e.removeEventListener("message", s)) : (o.data.payload && r.next(deserialize(o.data.payload)), o.data.complete && (r.complete(), e.removeEventListener("message", s)));
        else if (isJobErrorMessage(o.data)) {
          const a = deserialize(o.data.error);
          r.error(a), e.removeEventListener("message", s);
        }
      }
    };
    return e.addEventListener("message", s), () => {
      if (n === "observable" || !n) {
        const o = {
          type: MasterMessageType.cancel,
          uid: t
        };
        e.postMessage(o);
      }
      e.removeEventListener("message", s);
    };
  });
}
function prepareArguments(e) {
  if (e.length === 0)
    return {
      args: [],
      transferables: []
    };
  const t = [], r = [];
  for (const n of e)
    isTransferDescriptor(n) ? (t.push(serialize(n.send)), r.push(...n.transferables)) : t.push(serialize(n));
  return {
    args: t,
    transferables: r.length === 0 ? r : dedupe(r)
  };
}
function createProxyFunction(e, t) {
  return (...r) => {
    const n = nextJobUID++, { args: s, transferables: o } = prepareArguments(r), a = {
      type: MasterMessageType.run,
      uid: n,
      method: t,
      args: s
    };
    debugMessages$1("Sending command to run function to worker:", a);
    try {
      e.postMessage(a, o);
    } catch (l) {
      return ObservablePromise.from(Promise.reject(l));
    }
    return ObservablePromise.from(multicast(createObservableForJob(e, n)));
  };
}
function createProxyModule(e, t) {
  const r = {};
  for (const n of t)
    r[n] = createProxyFunction(e, n);
  return r;
}
var __awaiter$1 = function(e, t, r, n) {
  function s(o) {
    return o instanceof r ? o : new r(function(a) {
      a(o);
    });
  }
  return new (r || (r = Promise))(function(o, a) {
    function l(i) {
      try {
        u(n.next(i));
      } catch (d) {
        a(d);
      }
    }
    function c(i) {
      try {
        u(n.throw(i));
      } catch (d) {
        a(d);
      }
    }
    function u(i) {
      i.done ? o(i.value) : s(i.value).then(l, c);
    }
    u((n = n.apply(e, t || [])).next());
  });
};
const debugMessages = DebugLogger("threads:master:messages"), debugSpawn = DebugLogger("threads:master:spawn"), debugThreadUtils = DebugLogger("threads:master:thread-utils"), isInitMessage = (e) => e && e.type === "init", isUncaughtErrorMessage = (e) => e && e.type === "uncaughtError", initMessageTimeout = typeof process < "u" && process.env.THREADS_WORKER_INIT_TIMEOUT ? Number.parseInt(process.env.THREADS_WORKER_INIT_TIMEOUT, 10) : 1e4;
function withTimeout(e, t, r) {
  return __awaiter$1(this, void 0, void 0, function* () {
    let n;
    const s = new Promise((a, l) => {
      n = setTimeout(() => l(Error(r)), t);
    }), o = yield Promise.race([
      e,
      s
    ]);
    return clearTimeout(n), o;
  });
}
function receiveInitMessage(e) {
  return new Promise((t, r) => {
    const n = (s) => {
      debugMessages("Message from worker before finishing initialization:", s.data), isInitMessage(s.data) ? (e.removeEventListener("message", n), t(s.data)) : isUncaughtErrorMessage(s.data) && (e.removeEventListener("message", n), r(deserialize(s.data.error)));
    };
    e.addEventListener("message", n);
  });
}
function createEventObservable(e, t) {
  return new Observable((r) => {
    const n = (o) => {
      const a = {
        type: WorkerEventType.message,
        data: o.data
      };
      r.next(a);
    }, s = (o) => {
      debugThreadUtils("Unhandled promise rejection event in thread:", o);
      const a = {
        type: WorkerEventType.internalError,
        error: Error(o.reason)
      };
      r.next(a);
    };
    e.addEventListener("message", n), e.addEventListener("unhandledrejection", s), t.then(() => {
      const o = {
        type: WorkerEventType.termination
      };
      e.removeEventListener("message", n), e.removeEventListener("unhandledrejection", s), r.next(o), r.complete();
    });
  });
}
function createTerminator(e) {
  const [t, r] = createPromiseWithResolver();
  return { terminate: () => __awaiter$1(this, void 0, void 0, function* () {
    debugThreadUtils("Terminating worker"), yield e.terminate(), r();
  }), termination: t };
}
function setPrivateThreadProps(e, t, r, n) {
  const s = r.filter((o) => o.type === WorkerEventType.internalError).map((o) => o.error);
  return Object.assign(e, {
    [$errors]: s,
    [$events]: r,
    [$terminate]: n,
    [$worker]: t
  });
}
function spawn(e, t) {
  return __awaiter$1(this, void 0, void 0, function* () {
    debugSpawn("Initializing new thread");
    const r = initMessageTimeout, s = (yield withTimeout(receiveInitMessage(e), r, `Timeout: Did not receive an init message from worker after ${r}ms. Make sure the worker calls expose().`)).exposed, { termination: o, terminate: a } = createTerminator(e), l = createEventObservable(e, o);
    if (s.type === "function") {
      const c = createProxyFunction(e);
      return setPrivateThreadProps(c, e, l, a);
    } else if (s.type === "module") {
      const c = createProxyModule(e, s.methods);
      return setPrivateThreadProps(c, e, l, a);
    } else {
      const c = s.type;
      throw Error(`Worker init message states unexpected type of expose(): ${c}`);
    }
  });
}
const BlobWorker = getWorkerImplementation().blob, Worker$1 = getWorkerImplementation().default, isWorkerRuntime$2 = function e() {
  const t = typeof self < "u" && typeof Window < "u" && self instanceof Window;
  return !!(typeof self < "u" && self.postMessage && !t);
}, postMessageToMaster$2 = function e(t, r) {
  self.postMessage(t, r);
}, subscribeToMasterMessages$2 = function e(t) {
  const r = (s) => {
    t(s.data);
  }, n = () => {
    self.removeEventListener("message", r);
  };
  return self.addEventListener("message", r), n;
}, WebWorkerImplementation = {
  isWorkerRuntime: isWorkerRuntime$2,
  postMessageToMaster: postMessageToMaster$2,
  subscribeToMasterMessages: subscribeToMasterMessages$2
};
typeof self > "u" && (global.self = global);
const isWorkerRuntime$1 = function e() {
  return !!(typeof self < "u" && self.postMessage);
}, postMessageToMaster$1 = function e(t) {
  self.postMessage(t);
};
let muxingHandlerSetUp = !1;
const messageHandlers = /* @__PURE__ */ new Set(), subscribeToMasterMessages$1 = function e(t) {
  return muxingHandlerSetUp || (self.addEventListener("message", (n) => {
    messageHandlers.forEach((s) => s(n.data));
  }), muxingHandlerSetUp = !0), messageHandlers.add(t), () => messageHandlers.delete(t);
}, TinyWorkerImplementation = {
  isWorkerRuntime: isWorkerRuntime$1,
  postMessageToMaster: postMessageToMaster$1,
  subscribeToMasterMessages: subscribeToMasterMessages$1
};
let implementation;
function selectImplementation() {
  return typeof __non_webpack_require__ == "function" ? __non_webpack_require__("worker_threads") : eval("require")("worker_threads");
}
function getImplementation() {
  return implementation || (implementation = selectImplementation()), implementation;
}
function assertMessagePort(e) {
  if (!e)
    throw Error("Invariant violation: MessagePort to parent is not available.");
  return e;
}
const isWorkerRuntime = function e() {
  return !getImplementation().isMainThread;
}, postMessageToMaster = function e(t, r) {
  assertMessagePort(getImplementation().parentPort).postMessage(t, r);
}, subscribeToMasterMessages = function e(t) {
  const r = getImplementation().parentPort;
  if (!r)
    throw Error("Invariant violation: MessagePort to parent is not available.");
  const n = (o) => {
    t(o);
  }, s = () => {
    assertMessagePort(r).off("message", n);
  };
  return assertMessagePort(r).on("message", n), s;
};
function testImplementation() {
  getImplementation();
}
const WorkerThreadsImplementation = {
  isWorkerRuntime,
  postMessageToMaster,
  subscribeToMasterMessages,
  testImplementation
}, runningInNode = typeof process < "u" && process.arch !== "browser" && "pid" in process;
function selectNodeImplementation() {
  try {
    return WorkerThreadsImplementation.testImplementation(), WorkerThreadsImplementation;
  } catch {
    return TinyWorkerImplementation;
  }
}
const Implementation = runningInNode ? selectNodeImplementation() : WebWorkerImplementation;
Implementation.isWorkerRuntime;
function postUncaughtErrorMessage(e) {
  try {
    const t = {
      type: WorkerMessageType.uncaughtError,
      error: serialize(e)
    };
    Implementation.postMessageToMaster(t);
  } catch (t) {
    console.error(`Not reporting uncaught error back to master thread as it occured while reporting an uncaught error already.
Latest error:`, t, `
Original error:`, e);
  }
}
typeof self < "u" && typeof self.addEventListener == "function" && Implementation.isWorkerRuntime() && (self.addEventListener("error", (e) => {
  setTimeout(() => postUncaughtErrorMessage(e.error || e), 250);
}), self.addEventListener("unhandledrejection", (e) => {
  const t = e.reason;
  t && typeof t.message == "string" && setTimeout(() => postUncaughtErrorMessage(t), 250);
}));
typeof process < "u" && typeof process.on == "function" && Implementation.isWorkerRuntime() && (process.on("uncaughtException", (e) => {
  setTimeout(() => postUncaughtErrorMessage(e), 250);
}), process.on("unhandledRejection", (e) => {
  e && typeof e.message == "string" && setTimeout(() => postUncaughtErrorMessage(e), 250);
}));
var ok = function(e) {
  return new Ok(e);
}, err = function(e) {
  return new Err(e);
}, Ok = (
  /** @class */
  function() {
    function e(t) {
      var r = this;
      this.value = t, this.match = function(n, s) {
        return n(r.value);
      };
    }
    return e.prototype.isOk = function() {
      return !0;
    }, e.prototype.isErr = function() {
      return !this.isOk();
    }, e.prototype.map = function(t) {
      return ok(t(this.value));
    }, e.prototype.mapErr = function(t) {
      return ok(this.value);
    }, e.prototype.andThen = function(t) {
      return t(this.value);
    }, e.prototype.asyncAndThen = function(t) {
      return t(this.value);
    }, e.prototype.asyncMap = function(t) {
      return ResultAsync.fromPromise(t(this.value));
    }, e.prototype.unwrapOr = function(t) {
      return this.value;
    }, e.prototype._unsafeUnwrap = function() {
      return this.value;
    }, e.prototype._unsafeUnwrapErr = function() {
      throw new Error("Called `_unsafeUnwrapErr` on an Ok");
    }, e;
  }()
), Err = (
  /** @class */
  function() {
    function e(t) {
      var r = this;
      this.error = t, this.match = function(n, s) {
        return s(r.error);
      };
    }
    return e.prototype.isOk = function() {
      return !1;
    }, e.prototype.isErr = function() {
      return !this.isOk();
    }, e.prototype.map = function(t) {
      return err(this.error);
    }, e.prototype.mapErr = function(t) {
      return err(t(this.error));
    }, e.prototype.andThen = function(t) {
      return err(this.error);
    }, e.prototype.asyncAndThen = function(t) {
      return errAsync(this.error);
    }, e.prototype.asyncMap = function(t) {
      return errAsync(this.error);
    }, e.prototype.unwrapOr = function(t) {
      return t;
    }, e.prototype._unsafeUnwrap = function() {
      throw new Error("Called `_unsafeUnwrap` on an Err");
    }, e.prototype._unsafeUnwrapErr = function() {
      return this.error;
    }, e;
  }()
);
/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
function __awaiter(e, t, r, n) {
  function s(o) {
    return o instanceof r ? o : new r(function(a) {
      a(o);
    });
  }
  return new (r || (r = Promise))(function(o, a) {
    function l(i) {
      try {
        u(n.next(i));
      } catch (d) {
        a(d);
      }
    }
    function c(i) {
      try {
        u(n.throw(i));
      } catch (d) {
        a(d);
      }
    }
    function u(i) {
      i.done ? o(i.value) : s(i.value).then(l, c);
    }
    u((n = n.apply(e, [])).next());
  });
}
function __generator(e, t) {
  var r = { label: 0, sent: function() {
    if (o[0] & 1) throw o[1];
    return o[1];
  }, trys: [], ops: [] }, n, s, o, a;
  return a = { next: l(0), throw: l(1), return: l(2) }, typeof Symbol == "function" && (a[Symbol.iterator] = function() {
    return this;
  }), a;
  function l(u) {
    return function(i) {
      return c([u, i]);
    };
  }
  function c(u) {
    if (n) throw new TypeError("Generator is already executing.");
    for (; r; ) try {
      if (n = 1, s && (o = u[0] & 2 ? s.return : u[0] ? s.throw || ((o = s.return) && o.call(s), 0) : s.next) && !(o = o.call(s, u[1])).done) return o;
      switch (s = 0, o && (u = [u[0] & 2, o.value]), u[0]) {
        case 0:
        case 1:
          o = u;
          break;
        case 4:
          return r.label++, { value: u[1], done: !1 };
        case 5:
          r.label++, s = u[1], u = [0];
          continue;
        case 7:
          u = r.ops.pop(), r.trys.pop();
          continue;
        default:
          if (o = r.trys, !(o = o.length > 0 && o[o.length - 1]) && (u[0] === 6 || u[0] === 2)) {
            r = 0;
            continue;
          }
          if (u[0] === 3 && (!o || u[1] > o[0] && u[1] < o[3])) {
            r.label = u[1];
            break;
          }
          if (u[0] === 6 && r.label < o[1]) {
            r.label = o[1], o = u;
            break;
          }
          if (o && r.label < o[2]) {
            r.label = o[2], r.ops.push(u);
            break;
          }
          o[2] && r.ops.pop(), r.trys.pop();
          continue;
      }
      u = t.call(e, r);
    } catch (i) {
      u = [6, i], s = 0;
    } finally {
      n = o = 0;
    }
    if (u[0] & 5) throw u[1];
    return { value: u[0] ? u[1] : void 0, done: !0 };
  }
}
var logWarning = function(e) {
  if (typeof process != "object" || process.env.NODE_ENV !== "test" && process.env.NODE_ENV !== "production") {
    var t = "\x1B[33m%s\x1B[0m", r = ["[neverthrow]", e].join(" - ");
    console.warn(t, r);
  }
}, ResultAsync = (
  /** @class */
  function() {
    function e(t) {
      this._promise = t;
    }
    return e.fromPromise = function(t, r) {
      var n = t.then(function(o) {
        return new Ok(o);
      });
      if (r)
        n = n.catch(function(o) {
          return new Err(r(o));
        });
      else {
        var s = [
          "`fromPromise` called without a promise rejection handler",
          "Ensure that you are catching promise rejections yourself, or pass a second argument to `fromPromise` to convert a caught exception into an `Err` instance"
        ].join(" - ");
        logWarning(s);
      }
      return new e(n);
    }, e.prototype.map = function(t) {
      var r = this;
      return new e(this._promise.then(function(n) {
        return __awaiter(r, void 0, void 0, function() {
          var s;
          return __generator(this, function(o) {
            switch (o.label) {
              case 0:
                return n.isErr() ? [2, new Err(n.error)] : (s = Ok.bind, [4, t(n.value)]);
              case 1:
                return [2, new (s.apply(Ok, [void 0, o.sent()]))()];
            }
          });
        });
      }));
    }, e.prototype.mapErr = function(t) {
      var r = this;
      return new e(this._promise.then(function(n) {
        return __awaiter(r, void 0, void 0, function() {
          var s;
          return __generator(this, function(o) {
            switch (o.label) {
              case 0:
                return n.isOk() ? [2, new Ok(n.value)] : (s = Err.bind, [4, t(n.error)]);
              case 1:
                return [2, new (s.apply(Err, [void 0, o.sent()]))()];
            }
          });
        });
      }));
    }, e.prototype.andThen = function(t) {
      return new e(this._promise.then(function(r) {
        if (r.isErr())
          return new Err(r.error);
        var n = t(r.value);
        return n instanceof e ? n._promise : n;
      }));
    }, e.prototype.match = function(t, r) {
      return this._promise.then(function(n) {
        return n.match(t, r);
      });
    }, e.prototype.unwrapOr = function(t) {
      return this._promise.then(function(r) {
        return r.unwrapOr(t);
      });
    }, e.prototype.then = function(t) {
      return this._promise.then(t);
    }, e;
  }()
), errAsync = function(e) {
  return new ResultAsync(Promise.resolve(new Err(e)));
}, __defProp = Object.defineProperty, __getOwnPropSymbols = Object.getOwnPropertySymbols, __hasOwnProp = Object.prototype.hasOwnProperty, __propIsEnum = Object.prototype.propertyIsEnumerable, __defNormalProp = (e, t, r) => t in e ? __defProp(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r, __spreadValues = (e, t) => {
  for (var r in t || (t = {}))
    __hasOwnProp.call(t, r) && __defNormalProp(e, r, t[r]);
  if (__getOwnPropSymbols)
    for (var r of __getOwnPropSymbols(t))
      __propIsEnum.call(t, r) && __defNormalProp(e, r, t[r]);
  return e;
};
function createInputValue(e, t, r) {
  let n = t;
  const s = {}, o = () => n, a = (c) => {
    var u;
    c !== n && (n = c, (u = s.onSet) == null || u.call(s));
  };
  return { varId: e, get: o, set: a, reset: () => {
    a(t);
  }, callbacks: s };
}
var Series = class S {
  /**
   * @param varId The ID for the output variable (as used by SDEverywhere).
   * @param points The data points for the variable, one point per time increment.
   */
  constructor(t, r) {
    this.varId = t, this.points = r;
  }
  /**
   * Return the Y value at the given time.  Note that this does not attempt to interpolate
   * if there is no data point defined for the given time and will return undefined in
   * that case.
   *
   * @param time The x (time) value.
   * @return The y value for the given time, or undefined if there is no data point defined
   * for the given time.
   */
  getValueAtTime(t) {
    var r;
    return (r = this.points.find((n) => n.x === t)) == null ? void 0 : r.y;
  }
  /**
   * Create a new `Series` instance that is a copy of this one.
   */
  copy() {
    const t = this.points.map((r) => __spreadValues({}, r));
    return new S(this.varId, t);
  }
}, Outputs = class {
  /**
   * @param varIds The output variable identifiers.
   * @param startTime The start time for the model.
   * @param endTime The end time for the model.
   * @param saveFreq The frequency with which output values are saved (aka `SAVEPER`).
   */
  constructor(e, t, r, n = 1) {
    this.varIds = e, this.startTime = t, this.endTime = r, this.saveFreq = n, this.seriesLength = Math.round((r - t) / n) + 1, this.varSeries = new Array(e.length);
    for (let s = 0; s < e.length; s++) {
      const o = new Array(this.seriesLength);
      for (let l = 0; l < this.seriesLength; l++)
        o[l] = { x: t + l * n, y: 0 };
      const a = e[s];
      this.varSeries[s] = new Series(a, o);
    }
  }
  /**
   * The optional set of specs that dictate which variables from the model will be
   * stored in this `Outputs` instance.  If undefined, the default set of outputs
   * will be stored (as configured in `varIds`).
   * @hidden This is not yet part of the public API; it is exposed here for use
   * in experimental testing tools.
   */
  setVarSpecs(e) {
    if (e.length !== this.varIds.length)
      throw new Error("Length of output varSpecs must match that of varIds");
    this.varSpecs = e;
  }
  /**
   * Parse the given raw float buffer (produced by the model) and store the values
   * into this `Outputs` instance.
   *
   * Note that the length of `outputsBuffer` must be greater than or equal to
   * the capacity of this `Outputs` instance.  The `Outputs` instance is allowed
   * to be smaller to support the case where you want to extract a subset of
   * the time range in the buffer produced by the model.
   *
   * @param outputsBuffer The raw outputs buffer produced by the model.
   * @param rowLength The number of elements per row (one element per save point).
   * @return An `ok` result if the buffer is valid, otherwise an `err` result.
   */
  updateFromBuffer(e, t) {
    const r = parseOutputsBuffer(e, t, this);
    return r.isOk() ? ok(void 0) : err(r.error);
  }
  /**
   * Return the series for the given output variable.
   *
   * @param varId The ID of the output variable (as used by SDEverywhere).
   */
  getSeriesForVar(e) {
    const t = this.varIds.indexOf(e);
    if (t >= 0)
      return this.varSeries[t];
  }
};
function parseOutputsBuffer(e, t, r) {
  const n = r.varIds.length, s = r.seriesLength;
  if (t < s || e.length < n * s)
    return err("invalid-point-count");
  for (let o = 0; o < n; o++) {
    const a = r.varSeries[o];
    let l = t * o;
    for (let c = 0; c < s; c++)
      a.points[c].y = validateNumber(e[l]), l++;
  }
  return ok(r);
}
function validateNumber(e) {
  if (!isNaN(e) && e > -1e32)
    return e;
}
function getEncodedVarIndicesLength(e) {
  var t;
  let r = 1;
  for (const n of e) {
    r += 2;
    const s = ((t = n.subscriptIndices) == null ? void 0 : t.length) || 0;
    r += s;
  }
  return r;
}
function encodeVarIndices(e, t) {
  let r = 0;
  t[r++] = e.length;
  for (const n of e) {
    t[r++] = n.varIndex;
    const s = n.subscriptIndices, o = (s == null ? void 0 : s.length) || 0;
    t[r++] = o;
    for (let a = 0; a < o; a++)
      t[r++] = s[a];
  }
}
function getEncodedLookupBufferLengths(e) {
  var t;
  let r = 1, n = 0;
  for (const s of e) {
    const o = s.varRef.varSpec;
    if (o === void 0)
      throw new Error("Cannot compute lookup buffer lengths until all lookup var specs are defined");
    r += 2;
    const a = ((t = o.subscriptIndices) == null ? void 0 : t.length) || 0;
    r += a, r += 2, n += s.points.length;
  }
  return {
    lookupIndicesLength: r,
    lookupsLength: n
  };
}
function encodeLookups(e, t, r) {
  let n = 0;
  t[n++] = e.length;
  let s = 0;
  for (const o of e) {
    const a = o.varRef.varSpec;
    t[n++] = a.varIndex;
    const l = a.subscriptIndices, c = (l == null ? void 0 : l.length) || 0;
    t[n++] = c;
    for (let u = 0; u < c; u++)
      t[n++] = l[u];
    t[n++] = s, t[n++] = o.points.length, r == null || r.set(o.points, s), s += o.points.length;
  }
}
function decodeLookups(e, t) {
  const r = [];
  let n = 0;
  const s = e[n++];
  for (let o = 0; o < s; o++) {
    const a = e[n++], l = e[n++], c = l > 0 ? Array(l) : void 0;
    for (let p = 0; p < l; p++)
      c[p] = e[n++];
    const u = e[n++], i = e[n++], d = {
      varIndex: a,
      subscriptIndices: c
    };
    let f;
    t ? f = t.slice(u, u + i) : f = new Float64Array(0), r.push({
      varRef: {
        varSpec: d
      },
      points: f
    });
  }
  return r;
}
var ModelListing = class {
  constructor(e) {
    this.varSpecs = /* @__PURE__ */ new Map();
    const t = /* @__PURE__ */ new Map();
    for (const s of e.dimensions) {
      const o = s.id, a = [];
      for (let l = 0; l < s.subIds.length; l++)
        a.push({
          id: s.subIds[l],
          index: l
        });
      t.set(o, {
        id: o,
        subscripts: a
      });
    }
    function r(s) {
      const o = t.get(s);
      if (o === void 0)
        throw new Error(`No dimension info found for id=${s}`);
      return o;
    }
    const n = /* @__PURE__ */ new Set();
    for (const s of e.variables) {
      const o = varIdWithoutSubscripts(s.id);
      if (!n.has(o)) {
        const l = (s.dimIds || []).map(r);
        if (l.length > 0) {
          const c = [];
          for (const i of l)
            c.push(i.subscripts);
          const u = cartesianProductOf(c);
          for (const i of u) {
            const d = i.map((v) => v.id).join(","), f = i.map((v) => v.index), p = `${o}[${d}]`;
            this.varSpecs.set(p, {
              varIndex: s.index,
              subscriptIndices: f
            });
          }
        } else
          this.varSpecs.set(o, {
            varIndex: s.index
          });
        n.add(o);
      }
    }
  }
  /**
   * Return the `VarSpec` for the given variable ID, or undefined if there is no spec defined
   * in the listing for that variable.
   */
  getSpecForVarId(e) {
    return this.varSpecs.get(e);
  }
  /**
   * Return the `VarSpec` for the given variable name, or undefined if there is no spec defined
   * in the listing for that variable.
   */
  getSpecForVarName(e) {
    const t = sdeVarIdForVensimVarName(e);
    return this.varSpecs.get(t);
  }
  /**
   * Create a new `Outputs` instance that uses the same start/end years as the given "normal"
   * `Outputs` instance but is prepared for reading the specified internal variables from the model.
   *
   * @param normalOutputs The `Outputs` that is used to access normal output variables from the model.
   * @param varIds The variable IDs to include with the new `Outputs` instance.
   */
  deriveOutputs(e, t) {
    const r = [];
    for (const s of t) {
      const o = this.varSpecs.get(s);
      o !== void 0 ? r.push(o) : console.warn(`WARNING: No output var spec found for id=${s}`);
    }
    const n = new Outputs(t, e.startTime, e.endTime, e.saveFreq);
    return n.varSpecs = r, n;
  }
};
function varIdWithoutSubscripts(e) {
  const t = e.indexOf("[");
  return t >= 0 ? e.substring(0, t) : e;
}
function cartesianProductOf(e) {
  return e.reduce(
    (t, r) => t.map((n) => r.map((s) => n.concat([s]))).reduce((n, s) => n.concat(s), []),
    [[]]
  );
}
function sdeVarIdForVensimName(e) {
  return "_" + e.trim().replace(/"/g, "_").replace(/\s+!$/g, "!").replace(/\s/g, "_").replace(/,/g, "_").replace(/-/g, "_").replace(/\./g, "_").replace(/\$/g, "_").replace(/'/g, "_").replace(/&/g, "_").replace(/%/g, "_").replace(/\//g, "_").replace(/\|/g, "_").toLowerCase();
}
function sdeVarIdForVensimVarName(e) {
  const t = e.match(/([^[]+)(?:\[([^\]]+)\])?/);
  if (!t)
    throw new Error(`Invalid Vensim name: ${e}`);
  let r = sdeVarIdForVensimName(t[1]);
  if (t[2]) {
    const n = t[2].split(",").map((s) => sdeVarIdForVensimName(s));
    r += `[${n.join(",")}]`;
  }
  return r;
}
function resolveVarRef(e, t, r) {
  if (!t.varSpec) {
    if (e === void 0)
      throw new Error(
        `Unable to resolve ${r} variable references by name or identifier when model listing is unavailable`
      );
    if (t.varId) {
      const n = e == null ? void 0 : e.getSpecForVarId(t.varId);
      if (n)
        t.varSpec = n;
      else
        throw new Error(`Failed to resolve ${r} variable reference for varId=${t.varId}`);
    } else {
      const n = e == null ? void 0 : e.getSpecForVarName(t.varName);
      if (n)
        t.varSpec = n;
      else
        throw new Error(`Failed to resolve ${r} variable reference for varName='${t.varId}'`);
    }
  }
}
var headerLengthInElements = 16, extrasLengthInElements = 1, Int32Section = class {
  constructor() {
    this.offsetInBytes = 0, this.lengthInElements = 0;
  }
  update(e, t, r) {
    this.view = r > 0 ? new Int32Array(e, t, r) : void 0, this.offsetInBytes = t, this.lengthInElements = r;
  }
}, Float64Section = class {
  constructor() {
    this.offsetInBytes = 0, this.lengthInElements = 0;
  }
  update(e, t, r) {
    this.view = r > 0 ? new Float64Array(e, t, r) : void 0, this.offsetInBytes = t, this.lengthInElements = r;
  }
}, BufferedRunModelParams = class {
  /**
   * @param listing The model listing that is used to locate a variable that is referenced by
   * name or identifier.  If undefined, variables cannot be referenced by name or identifier,
   * and can only be referenced using a valid `VarSpec`.
   */
  constructor(e) {
    this.listing = e, this.header = new Int32Section(), this.extras = new Float64Section(), this.inputs = new Float64Section(), this.outputs = new Float64Section(), this.outputIndices = new Int32Section(), this.lookups = new Float64Section(), this.lookupIndices = new Int32Section();
  }
  /**
   * Return the encoded buffer from this instance, which can be passed to `updateFromEncodedBuffer`.
   */
  getEncodedBuffer() {
    return this.encoded;
  }
  // from RunModelParams interface
  getInputs() {
    return this.inputs.view;
  }
  // from RunModelParams interface
  copyInputs(e, t) {
    this.inputs.lengthInElements !== 0 && ((e === void 0 || e.length < this.inputs.lengthInElements) && (e = t(this.inputs.lengthInElements)), e.set(this.inputs.view));
  }
  // from RunModelParams interface
  getOutputIndicesLength() {
    return this.outputIndices.lengthInElements;
  }
  // from RunModelParams interface
  getOutputIndices() {
    return this.outputIndices.view;
  }
  // from RunModelParams interface
  copyOutputIndices(e, t) {
    this.outputIndices.lengthInElements !== 0 && ((e === void 0 || e.length < this.outputIndices.lengthInElements) && (e = t(this.outputIndices.lengthInElements)), e.set(this.outputIndices.view));
  }
  // from RunModelParams interface
  getOutputsLength() {
    return this.outputs.lengthInElements;
  }
  // from RunModelParams interface
  getOutputs() {
    return this.outputs.view;
  }
  // from RunModelParams interface
  getOutputsObject() {
  }
  // from RunModelParams interface
  storeOutputs(e) {
    this.outputs.view !== void 0 && (e.length > this.outputs.view.length ? this.outputs.view.set(e.subarray(0, this.outputs.view.length)) : this.outputs.view.set(e));
  }
  // from RunModelParams interface
  getLookups() {
    if (this.lookupIndices.lengthInElements !== 0)
      return decodeLookups(this.lookupIndices.view, this.lookups.view);
  }
  // from RunModelParams interface
  getElapsedTime() {
    return this.extras.view[0];
  }
  // from RunModelParams interface
  storeElapsedTime(e) {
    this.extras.view[0] = e;
  }
  /**
   * Copy the outputs buffer to the given `Outputs` instance.  This should be called
   * after the `runModel` call has completed so that the output values are copied from
   * the internal buffer to the `Outputs` instance that was passed to `runModel`.
   *
   * @param outputs The `Outputs` instance into which the output values will be copied.
   */
  finalizeOutputs(e) {
    this.outputs.view && e.updateFromBuffer(this.outputs.view, e.seriesLength), e.runTimeInMillis = this.getElapsedTime();
  }
  /**
   * Update this instance using the parameters that are passed to a `runModel` call.
   *
   * @param inputs The model input values (must be in the same order as in the spec file).
   * @param outputs The structure into which the model outputs will be stored.
   * @param options Additional options that influence the model run.
   */
  updateFromParams(e, t, r) {
    const n = e.length, s = t.varIds.length * t.seriesLength;
    let o;
    const a = t.varSpecs;
    a !== void 0 && a.length > 0 ? o = getEncodedVarIndicesLength(a) : o = 0;
    let l, c;
    if ((r == null ? void 0 : r.lookups) !== void 0 && r.lookups.length > 0) {
      for (const w of r.lookups)
        resolveVarRef(this.listing, w.varRef, "lookup");
      const g = getEncodedLookupBufferLengths(r.lookups);
      l = g.lookupsLength, c = g.lookupIndicesLength;
    } else
      l = 0, c = 0;
    let u = 0;
    function i(g, w) {
      const M = u, k = g === "float64" ? Float64Array.BYTES_PER_ELEMENT : Int32Array.BYTES_PER_ELEMENT, T = Math.round(w * k), L = Math.ceil(T / 8) * 8;
      return u += L, M;
    }
    const d = i("int32", headerLengthInElements), f = i("float64", extrasLengthInElements), p = i("float64", n), v = i("float64", s), b = i("int32", o), h = i("float64", l), y = i("int32", c), I = u;
    if (this.encoded === void 0 || this.encoded.byteLength < I) {
      const g = Math.ceil(I * 1.2);
      this.encoded = new ArrayBuffer(g), this.header.update(this.encoded, d, headerLengthInElements);
    }
    const _ = this.header.view;
    let m = 0;
    _[m++] = f, _[m++] = extrasLengthInElements, _[m++] = p, _[m++] = n, _[m++] = v, _[m++] = s, _[m++] = b, _[m++] = o, _[m++] = h, _[m++] = l, _[m++] = y, _[m++] = c, this.inputs.update(this.encoded, p, n), this.extras.update(this.encoded, f, extrasLengthInElements), this.outputs.update(this.encoded, v, s), this.outputIndices.update(this.encoded, b, o), this.lookups.update(this.encoded, h, l), this.lookupIndices.update(this.encoded, y, c);
    const E = this.inputs.view;
    for (let g = 0; g < e.length; g++) {
      const w = e[g];
      typeof w == "number" ? E[g] = w : E[g] = w.get();
    }
    this.outputIndices.view && encodeVarIndices(a, this.outputIndices.view), c > 0 && encodeLookups(r.lookups, this.lookupIndices.view, this.lookups.view);
  }
  /**
   * Update this instance using the values contained in the encoded buffer from another
   * `BufferedRunModelParams` instance.
   *
   * @param buffer An encoded buffer returned by `getEncodedBuffer`.
   */
  updateFromEncodedBuffer(e) {
    const t = headerLengthInElements * Int32Array.BYTES_PER_ELEMENT;
    if (e.byteLength < t)
      throw new Error("Buffer must be long enough to contain header section");
    this.encoded = e, this.header.update(this.encoded, 0, headerLengthInElements);
    const n = this.header.view;
    let s = 0;
    const o = n[s++], a = n[s++], l = n[s++], c = n[s++], u = n[s++], i = n[s++], d = n[s++], f = n[s++], p = n[s++], v = n[s++], b = n[s++], h = n[s++], y = a * Float64Array.BYTES_PER_ELEMENT, I = c * Float64Array.BYTES_PER_ELEMENT, _ = i * Float64Array.BYTES_PER_ELEMENT, m = f * Int32Array.BYTES_PER_ELEMENT, E = v * Float64Array.BYTES_PER_ELEMENT, g = h * Int32Array.BYTES_PER_ELEMENT, w = t + y + I + _ + m + E + g;
    if (e.byteLength < w)
      throw new Error("Buffer must be long enough to contain sections declared in header");
    this.extras.update(this.encoded, o, a), this.inputs.update(this.encoded, l, c), this.outputs.update(this.encoded, u, i), this.outputIndices.update(this.encoded, d, f), this.lookups.update(this.encoded, p, v), this.lookupIndices.update(this.encoded, b, h);
  }
};
async function spawnAsyncModelRunner(e) {
  return e.path ? spawnAsyncModelRunnerWithWorker(new Worker$1(e.path)) : spawnAsyncModelRunnerWithWorker(BlobWorker.fromText(e.source));
}
async function spawnAsyncModelRunnerWithWorker(e) {
  const t = await spawn(e), r = await t.initModel(), n = r.modelListing ? new ModelListing(r.modelListing) : void 0, s = new BufferedRunModelParams(n);
  let o = !1, a = !1;
  return {
    createOutputs: () => new Outputs(r.outputVarIds, r.startTime, r.endTime, r.saveFreq),
    runModel: async (l, c, u) => {
      if (a)
        throw new Error("Async model runner has already been terminated");
      if (o)
        throw new Error("Async model runner only supports one `runModel` call at a time");
      o = !0, s.updateFromParams(l, c, u);
      let i;
      try {
        i = await t.runModel(Transfer(s.getEncodedBuffer()));
      } finally {
        o = !1;
      }
      return s.updateFromEncodedBuffer(i), s.finalizeOutputs(c), c;
    },
    terminate: () => a ? Promise.resolve() : (a = !0, Thread.terminate(t))
  };
}
var assertNever$1 = {};
Object.defineProperty(assertNever$1, "__esModule", { value: !0 });
var assertNever_2 = assertNever$1.assertNever = assertNever;
function assertNever(e, t) {
  if (typeof t == "string")
    throw new Error(t);
  if (typeof t == "function")
    throw new Error(t(e));
  if (t)
    return e;
  throw new Error("Unhandled discriminated union member: ".concat(JSON.stringify(e)));
}
assertNever$1.default = assertNever;
function getInputVars(e) {
  const t = /* @__PURE__ */ new Map();
  for (const r of e) {
    const n = r.varId, s = {
      inputId: r.inputId,
      varId: n,
      varName: r.varName,
      defaultValue: r.defaultValue,
      minValue: r.minValue,
      maxValue: r.maxValue,
      value: createInputValue(n, r.defaultValue)
    };
    t.set(n, s);
  }
  return t;
}
function setInputsForScenario(e, t) {
  function r(u, i) {
    i < u.minValue ? (console.warn(
      `WARNING: Scenario input value ${i} is < min value (${u.minValue}) for input '${u.varName}'`
    ), i = u.minValue) : i > u.maxValue && (console.warn(
      `WARNING: Scenario input value ${i} is > max value (${u.maxValue}) for input '${u.varName}'`
    ), i = u.maxValue), u.value.set(i);
  }
  function n(u) {
    u.value.reset();
  }
  function s(u) {
    u.value.set(u.minValue);
  }
  function o(u) {
    u.value.set(u.minValue);
  }
  function a() {
    e.forEach(n);
  }
  function l() {
    e.forEach(s);
  }
  function c() {
    e.forEach(o);
  }
  switch (t.kind) {
    case "all-inputs": {
      switch (t.position) {
        case "at-default":
          a();
          break;
        case "at-minimum":
          l();
          break;
        case "at-maximum":
          c();
          break;
      }
      break;
    }
    case "input-settings": {
      a();
      for (const u of t.settings) {
        const i = e.get(u.inputVarId);
        if (i)
          switch (u.kind) {
            case "position":
              switch (u.position) {
                case "at-default":
                  n(i);
                  break;
                case "at-minimum":
                  s(i);
                  break;
                case "at-maximum":
                  o(i);
                  break;
                default:
                  assertNever_2(u.position);
              }
              break;
            case "value":
              r(i, u.value);
              break;
            default:
              assertNever_2(u);
          }
        else
          console.log(`No model input for scenario input ${u.inputVarId}`);
      }
      break;
    }
    default:
      assertNever_2(t);
  }
}
function getOutputVars(e) {
  const t = /* @__PURE__ */ new Map();
  for (const r of e) {
    const n = r.varId, s = datasetKeyForOutputVar(void 0, n);
    t.set(s, {
      sourceName: void 0,
      varId: n,
      varName: r.varName
    });
  }
  return t;
}
function datasetKeyForOutputVar(e, t) {
  return `Model_${t}`;
}
const inputSpecs = [{ inputId: "1", varId: "_la_collected_household", varName: "la collected household", defaultValue: 0.5, minValue: -0.5, maxValue: 1.5 }], outputSpecs = [{ varId: "_placed_on_market", varName: "Placed on market" }, { varId: "_sent_for_recycling", varName: "Sent for recycling" }, { varId: "_waste_collected", varName: "Waste collected" }], modelSizeInBytes = 10476, dataSizeInBytes = 0, modelWorkerJs = '(function(){"use strict";var commonjsGlobal=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};function getDefaultExportFromCjs(e){return e&&e.__esModule&&Object.prototype.hasOwnProperty.call(e,"default")?e.default:e}var worker={},isObservable=e=>e?typeof Symbol.observable=="symbol"&&typeof e[Symbol.observable]=="function"?e===e[Symbol.observable]():typeof e["@@observable"]=="function"?e===e["@@observable"]():!1:!1,common={},serializers={};Object.defineProperty(serializers,"__esModule",{value:!0}),serializers.DefaultSerializer=serializers.extendSerializer=void 0;function extendSerializer(e,n){const r=e.deserialize.bind(e),t=e.serialize.bind(e);return{deserialize(s){return n.deserialize(s,r)},serialize(s){return n.serialize(s,t)}}}serializers.extendSerializer=extendSerializer;const DefaultErrorSerializer={deserialize(e){return Object.assign(Error(e.message),{name:e.name,stack:e.stack})},serialize(e){return{__error_marker:"$$error",message:e.message,name:e.name,stack:e.stack}}},isSerializedError=e=>e&&typeof e=="object"&&"__error_marker"in e&&e.__error_marker==="$$error";serializers.DefaultSerializer={deserialize(e){return isSerializedError(e)?DefaultErrorSerializer.deserialize(e):e},serialize(e){return e instanceof Error?DefaultErrorSerializer.serialize(e):e}},Object.defineProperty(common,"__esModule",{value:!0}),common.serialize=common.deserialize=common.registerSerializer=void 0;const serializers_1=serializers;let registeredSerializer=serializers_1.DefaultSerializer;function registerSerializer(e){registeredSerializer=serializers_1.extendSerializer(registeredSerializer,e)}common.registerSerializer=registerSerializer;function deserialize(e){return registeredSerializer.deserialize(e)}common.deserialize=deserialize;function serialize(e){return registeredSerializer.serialize(e)}common.serialize=serialize;var transferable={},symbols={};Object.defineProperty(symbols,"__esModule",{value:!0}),symbols.$worker=symbols.$transferable=symbols.$terminate=symbols.$events=symbols.$errors=void 0,symbols.$errors=Symbol("thread.errors"),symbols.$events=Symbol("thread.events"),symbols.$terminate=Symbol("thread.terminate"),symbols.$transferable=Symbol("thread.transferable"),symbols.$worker=Symbol("thread.worker"),Object.defineProperty(transferable,"__esModule",{value:!0}),transferable.Transfer=transferable.isTransferDescriptor=void 0;const symbols_1=symbols;function isTransferable(e){return!(!e||typeof e!="object")}function isTransferDescriptor(e){return e&&typeof e=="object"&&e[symbols_1.$transferable]}transferable.isTransferDescriptor=isTransferDescriptor;function Transfer$1(e,n){if(!n){if(!isTransferable(e))throw Error();n=[e]}return{[symbols_1.$transferable]:!0,send:e,transferables:n}}transferable.Transfer=Transfer$1;var messages={};(function(e){Object.defineProperty(e,"__esModule",{value:!0}),e.WorkerMessageType=e.MasterMessageType=void 0,function(n){n.cancel="cancel",n.run="run"}(e.MasterMessageType||(e.MasterMessageType={})),function(n){n.error="error",n.init="init",n.result="result",n.running="running",n.uncaughtError="uncaughtError"}(e.WorkerMessageType||(e.WorkerMessageType={}))})(messages);var implementation$1={},implementation_browser={};Object.defineProperty(implementation_browser,"__esModule",{value:!0});const isWorkerRuntime$2=function(){const n=typeof self<"u"&&typeof Window<"u"&&self instanceof Window;return!!(typeof self<"u"&&self.postMessage&&!n)},postMessageToMaster$2=function(n,r){self.postMessage(n,r)},subscribeToMasterMessages$2=function(n){const r=s=>{n(s.data)},t=()=>{self.removeEventListener("message",r)};return self.addEventListener("message",r),t};implementation_browser.default={isWorkerRuntime:isWorkerRuntime$2,postMessageToMaster:postMessageToMaster$2,subscribeToMasterMessages:subscribeToMasterMessages$2};var implementation_tinyWorker={};Object.defineProperty(implementation_tinyWorker,"__esModule",{value:!0}),typeof self>"u"&&(commonjsGlobal.self=commonjsGlobal);const isWorkerRuntime$1=function(){return!!(typeof self<"u"&&self.postMessage)},postMessageToMaster$1=function(n){self.postMessage(n)};let muxingHandlerSetUp=!1;const messageHandlers=new Set,subscribeToMasterMessages$1=function(n){return muxingHandlerSetUp||(self.addEventListener("message",t=>{messageHandlers.forEach(s=>s(t.data))}),muxingHandlerSetUp=!0),messageHandlers.add(n),()=>messageHandlers.delete(n)};implementation_tinyWorker.default={isWorkerRuntime:isWorkerRuntime$1,postMessageToMaster:postMessageToMaster$1,subscribeToMasterMessages:subscribeToMasterMessages$1};var implementation_worker_threads={},worker_threads={};Object.defineProperty(worker_threads,"__esModule",{value:!0});let implementation;function selectImplementation(){return typeof __non_webpack_require__=="function"?__non_webpack_require__("worker_threads"):eval("require")("worker_threads")}function getImplementation(){return implementation||(implementation=selectImplementation()),implementation}worker_threads.default=getImplementation;var __importDefault$1=commonjsGlobal&&commonjsGlobal.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(implementation_worker_threads,"__esModule",{value:!0});const worker_threads_1=__importDefault$1(worker_threads);function assertMessagePort(e){if(!e)throw Error("Invariant violation: MessagePort to parent is not available.");return e}const isWorkerRuntime=function e(){return!worker_threads_1.default().isMainThread},postMessageToMaster=function e(n,r){assertMessagePort(worker_threads_1.default().parentPort).postMessage(n,r)},subscribeToMasterMessages=function e(n){const r=worker_threads_1.default().parentPort;if(!r)throw Error("Invariant violation: MessagePort to parent is not available.");const t=a=>{n(a)},s=()=>{assertMessagePort(r).off("message",t)};return assertMessagePort(r).on("message",t),s};function testImplementation(){worker_threads_1.default()}implementation_worker_threads.default={isWorkerRuntime,postMessageToMaster,subscribeToMasterMessages,testImplementation};var __importDefault=commonjsGlobal&&commonjsGlobal.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(implementation$1,"__esModule",{value:!0});const implementation_browser_1=__importDefault(implementation_browser),implementation_tiny_worker_1=__importDefault(implementation_tinyWorker),implementation_worker_threads_1=__importDefault(implementation_worker_threads),runningInNode=typeof process<"u"&&process.arch!=="browser"&&"pid"in process;function selectNodeImplementation(){try{return implementation_worker_threads_1.default.testImplementation(),implementation_worker_threads_1.default}catch{return implementation_tiny_worker_1.default}}implementation$1.default=runningInNode?selectNodeImplementation():implementation_browser_1.default,function(e){var n=commonjsGlobal&&commonjsGlobal.__awaiter||function(o,d,m,M){function O(k){return k instanceof m?k:new m(function(B){B(k)})}return new(m||(m=Promise))(function(k,B){function W(z){try{P(M.next(z))}catch(x){B(x)}}function R(z){try{P(M.throw(z))}catch(x){B(x)}}function P(z){z.done?k(z.value):O(z.value).then(W,R)}P((M=M.apply(o,d||[])).next())})},r=commonjsGlobal&&commonjsGlobal.__importDefault||function(o){return o&&o.__esModule?o:{default:o}};Object.defineProperty(e,"__esModule",{value:!0}),e.expose=e.isWorkerRuntime=e.Transfer=e.registerSerializer=void 0;const t=r(isObservable),s=common,a=transferable,i=messages,u=r(implementation$1);var c=common;Object.defineProperty(e,"registerSerializer",{enumerable:!0,get:function(){return c.registerSerializer}});var l=transferable;Object.defineProperty(e,"Transfer",{enumerable:!0,get:function(){return l.Transfer}}),e.isWorkerRuntime=u.default.isWorkerRuntime;let _=!1;const p=new Map,I=o=>o&&o.type===i.MasterMessageType.cancel,h=o=>o&&o.type===i.MasterMessageType.run,v=o=>t.default(o)||T(o);function T(o){return o&&typeof o=="object"&&typeof o.subscribe=="function"}function E(o){return a.isTransferDescriptor(o)?{payload:o.send,transferables:o.transferables}:{payload:o,transferables:void 0}}function L(){const o={type:i.WorkerMessageType.init,exposed:{type:"function"}};u.default.postMessageToMaster(o)}function w(o){const d={type:i.WorkerMessageType.init,exposed:{type:"module",methods:o}};u.default.postMessageToMaster(d)}function f(o,d){const{payload:m,transferables:M}=E(d),O={type:i.WorkerMessageType.error,uid:o,error:s.serialize(m)};u.default.postMessageToMaster(O,M)}function g(o,d,m){const{payload:M,transferables:O}=E(m),k={type:i.WorkerMessageType.result,uid:o,complete:d?!0:void 0,payload:M};u.default.postMessageToMaster(k,O)}function S(o,d){const m={type:i.WorkerMessageType.running,uid:o,resultType:d};u.default.postMessageToMaster(m)}function b(o){try{const d={type:i.WorkerMessageType.uncaughtError,error:s.serialize(o)};u.default.postMessageToMaster(d)}catch(d){console.error(`Not reporting uncaught error back to master thread as it occured while reporting an uncaught error already.\nLatest error:`,d,`\nOriginal error:`,o)}}function y(o,d,m){return n(this,void 0,void 0,function*(){let M;try{M=d(...m)}catch(k){return f(o,k)}const O=v(M)?"observable":"promise";if(S(o,O),v(M)){const k=M.subscribe(B=>g(o,!1,s.serialize(B)),B=>{f(o,s.serialize(B)),p.delete(o)},()=>{g(o,!0),p.delete(o)});p.set(o,k)}else try{const k=yield M;g(o,!0,s.serialize(k))}catch(k){f(o,s.serialize(k))}})}function A(o){if(!u.default.isWorkerRuntime())throw Error("expose() called in the master thread.");if(_)throw Error("expose() called more than once. This is not possible. Pass an object to expose() if you want to expose multiple functions.");if(_=!0,typeof o=="function")u.default.subscribeToMasterMessages(d=>{h(d)&&!d.method&&y(d.uid,o,d.args.map(s.deserialize))}),L();else if(typeof o=="object"&&o){u.default.subscribeToMasterMessages(m=>{h(m)&&m.method&&y(m.uid,o[m.method],m.args.map(s.deserialize))});const d=Object.keys(o).filter(m=>typeof o[m]=="function");w(d)}else throw Error(`Invalid argument passed to expose(). Expected a function or an object, got: ${o}`);u.default.subscribeToMasterMessages(d=>{if(I(d)){const m=d.uid,M=p.get(m);M&&(M.unsubscribe(),p.delete(m))}})}e.expose=A,typeof self<"u"&&typeof self.addEventListener=="function"&&u.default.isWorkerRuntime()&&(self.addEventListener("error",o=>{setTimeout(()=>b(o.error||o),250)}),self.addEventListener("unhandledrejection",o=>{const d=o.reason;d&&typeof d.message=="string"&&setTimeout(()=>b(d),250)})),typeof process<"u"&&typeof process.on=="function"&&u.default.isWorkerRuntime()&&(process.on("uncaughtException",o=>{setTimeout(()=>b(o),250)}),process.on("unhandledRejection",o=>{o&&typeof o.message=="string"&&setTimeout(()=>b(o),250)}))}(worker);const WorkerContext=getDefaultExportFromCjs(worker),expose=WorkerContext.expose;WorkerContext.registerSerializer;const Transfer=WorkerContext.Transfer;function getEncodedVarIndicesLength(e){var n;let r=1;for(const t of e){r+=2;const s=((n=t.subscriptIndices)==null?void 0:n.length)||0;r+=s}return r}function encodeVarIndices(e,n){let r=0;n[r++]=e.length;for(const t of e){n[r++]=t.varIndex;const s=t.subscriptIndices,a=(s==null?void 0:s.length)||0;n[r++]=a;for(let i=0;i<a;i++)n[r++]=s[i]}}function getEncodedLookupBufferLengths(e){var n;let r=1,t=0;for(const s of e){const a=s.varRef.varSpec;if(a===void 0)throw new Error("Cannot compute lookup buffer lengths until all lookup var specs are defined");r+=2;const i=((n=a.subscriptIndices)==null?void 0:n.length)||0;r+=i,r+=2,t+=s.points.length}return{lookupIndicesLength:r,lookupsLength:t}}function encodeLookups(e,n,r){let t=0;n[t++]=e.length;let s=0;for(const a of e){const i=a.varRef.varSpec;n[t++]=i.varIndex;const u=i.subscriptIndices,c=(u==null?void 0:u.length)||0;n[t++]=c;for(let l=0;l<c;l++)n[t++]=u[l];n[t++]=s,n[t++]=a.points.length,r==null||r.set(a.points,s),s+=a.points.length}}function decodeLookups(e,n){const r=[];let t=0;const s=e[t++];for(let a=0;a<s;a++){const i=e[t++],u=e[t++],c=u>0?Array(u):void 0;for(let h=0;h<u;h++)c[h]=e[t++];const l=e[t++],_=e[t++],p={varIndex:i,subscriptIndices:c};let I;n?I=n.slice(l,l+_):I=new Float64Array(0),r.push({varRef:{varSpec:p},points:I})}return r}function resolveVarRef(e,n,r){if(!n.varSpec){if(e===void 0)throw new Error(`Unable to resolve ${r} variable references by name or identifier when model listing is unavailable`);if(n.varId){const t=e==null?void 0:e.getSpecForVarId(n.varId);if(t)n.varSpec=t;else throw new Error(`Failed to resolve ${r} variable reference for varId=${n.varId}`)}else{const t=e==null?void 0:e.getSpecForVarName(n.varName);if(t)n.varSpec=t;else throw new Error(`Failed to resolve ${r} variable reference for varName=\'${n.varId}\'`)}}}var headerLengthInElements=16,extrasLengthInElements=1,Int32Section=class{constructor(){this.offsetInBytes=0,this.lengthInElements=0}update(e,n,r){this.view=r>0?new Int32Array(e,n,r):void 0,this.offsetInBytes=n,this.lengthInElements=r}},Float64Section=class{constructor(){this.offsetInBytes=0,this.lengthInElements=0}update(e,n,r){this.view=r>0?new Float64Array(e,n,r):void 0,this.offsetInBytes=n,this.lengthInElements=r}},BufferedRunModelParams=class{constructor(e){this.listing=e,this.header=new Int32Section,this.extras=new Float64Section,this.inputs=new Float64Section,this.outputs=new Float64Section,this.outputIndices=new Int32Section,this.lookups=new Float64Section,this.lookupIndices=new Int32Section}getEncodedBuffer(){return this.encoded}getInputs(){return this.inputs.view}copyInputs(e,n){this.inputs.lengthInElements!==0&&((e===void 0||e.length<this.inputs.lengthInElements)&&(e=n(this.inputs.lengthInElements)),e.set(this.inputs.view))}getOutputIndicesLength(){return this.outputIndices.lengthInElements}getOutputIndices(){return this.outputIndices.view}copyOutputIndices(e,n){this.outputIndices.lengthInElements!==0&&((e===void 0||e.length<this.outputIndices.lengthInElements)&&(e=n(this.outputIndices.lengthInElements)),e.set(this.outputIndices.view))}getOutputsLength(){return this.outputs.lengthInElements}getOutputs(){return this.outputs.view}getOutputsObject(){}storeOutputs(e){this.outputs.view!==void 0&&(e.length>this.outputs.view.length?this.outputs.view.set(e.subarray(0,this.outputs.view.length)):this.outputs.view.set(e))}getLookups(){if(this.lookupIndices.lengthInElements!==0)return decodeLookups(this.lookupIndices.view,this.lookups.view)}getElapsedTime(){return this.extras.view[0]}storeElapsedTime(e){this.extras.view[0]=e}finalizeOutputs(e){this.outputs.view&&e.updateFromBuffer(this.outputs.view,e.seriesLength),e.runTimeInMillis=this.getElapsedTime()}updateFromParams(e,n,r){const t=e.length,s=n.varIds.length*n.seriesLength;let a;const i=n.varSpecs;i!==void 0&&i.length>0?a=getEncodedVarIndicesLength(i):a=0;let u,c;if((r==null?void 0:r.lookups)!==void 0&&r.lookups.length>0){for(const y of r.lookups)resolveVarRef(this.listing,y.varRef,"lookup");const b=getEncodedLookupBufferLengths(r.lookups);u=b.lookupsLength,c=b.lookupIndicesLength}else u=0,c=0;let l=0;function _(b,y){const A=l,o=b==="float64"?Float64Array.BYTES_PER_ELEMENT:Int32Array.BYTES_PER_ELEMENT,d=Math.round(y*o),m=Math.ceil(d/8)*8;return l+=m,A}const p=_("int32",headerLengthInElements),I=_("float64",extrasLengthInElements),h=_("float64",t),v=_("float64",s),T=_("int32",a),E=_("float64",u),L=_("int32",c),w=l;if(this.encoded===void 0||this.encoded.byteLength<w){const b=Math.ceil(w*1.2);this.encoded=new ArrayBuffer(b),this.header.update(this.encoded,p,headerLengthInElements)}const f=this.header.view;let g=0;f[g++]=I,f[g++]=extrasLengthInElements,f[g++]=h,f[g++]=t,f[g++]=v,f[g++]=s,f[g++]=T,f[g++]=a,f[g++]=E,f[g++]=u,f[g++]=L,f[g++]=c,this.inputs.update(this.encoded,h,t),this.extras.update(this.encoded,I,extrasLengthInElements),this.outputs.update(this.encoded,v,s),this.outputIndices.update(this.encoded,T,a),this.lookups.update(this.encoded,E,u),this.lookupIndices.update(this.encoded,L,c);const S=this.inputs.view;for(let b=0;b<e.length;b++){const y=e[b];typeof y=="number"?S[b]=y:S[b]=y.get()}this.outputIndices.view&&encodeVarIndices(i,this.outputIndices.view),c>0&&encodeLookups(r.lookups,this.lookupIndices.view,this.lookups.view)}updateFromEncodedBuffer(e){const n=headerLengthInElements*Int32Array.BYTES_PER_ELEMENT;if(e.byteLength<n)throw new Error("Buffer must be long enough to contain header section");this.encoded=e,this.header.update(this.encoded,0,headerLengthInElements);const t=this.header.view;let s=0;const a=t[s++],i=t[s++],u=t[s++],c=t[s++],l=t[s++],_=t[s++],p=t[s++],I=t[s++],h=t[s++],v=t[s++],T=t[s++],E=t[s++],L=i*Float64Array.BYTES_PER_ELEMENT,w=c*Float64Array.BYTES_PER_ELEMENT,f=_*Float64Array.BYTES_PER_ELEMENT,g=I*Int32Array.BYTES_PER_ELEMENT,S=v*Float64Array.BYTES_PER_ELEMENT,b=E*Int32Array.BYTES_PER_ELEMENT,y=n+L+w+f+g+S+b;if(e.byteLength<y)throw new Error("Buffer must be long enough to contain sections declared in header");this.extras.update(this.encoded,a,i),this.inputs.update(this.encoded,u,c),this.outputs.update(this.encoded,l,_),this.outputIndices.update(this.encoded,p,I),this.lookups.update(this.encoded,h,v),this.lookupIndices.update(this.encoded,T,E)}},_NA_=-Number.MAX_VALUE,JsModelLookup=class{constructor(e,n){if(this.n=e,this.data=n,n.length<e*2)throw new Error(`Lookup data array length must be >= 2*size (length=${n.length} size=${e}`);this.lastInput=Number.MAX_VALUE,this.lastHitIndex=0}getValueForX(e,n){return this.getValue(e,!1,n)}getValueForY(e){if(this.invertedData===void 0){const n=this.n*2,r=this.data,t=Array(n);for(let s=0;s<n;s+=2)t[s]=r[s+1],t[s+1]=r[s];this.invertedData=t}return this.getValue(e,!0,"interpolate")}getValue(e,n,r){if(this.n===0)return _NA_;const t=n?this.invertedData:this.data,s=this.n*2,a=!n;let i;a&&e>=this.lastInput?i=this.lastHitIndex:i=0;for(let u=i;u<s;u+=2){const c=t[u];if(c>=e){if(a&&(this.lastInput=e,this.lastHitIndex=u),u===0||c===e)return t[u+1];switch(r){default:case"interpolate":{const l=t[u-2],_=t[u-1],p=t[u+1],I=c-l,h=p-_;return _+h/I*(e-l)}case"forward":return t[u+1];case"backward":return t[u-1]}}}return a&&(this.lastInput=e,this.lastHitIndex=s),t[s-1]}getValueForGameTime(e,n){if(this.n<=0)return n;const r=this.data[0];return e<r?n:this.getValue(e,!1,"backward")}getValueBetweenTimes(e,n){if(this.n===0)return _NA_;const r=this.n*2;switch(n){case"forward":{e=Math.floor(e);for(let t=0;t<r;t+=2)if(this.data[t]>=e)return this.data[t+1];return this.data[r-1]}case"backward":{e=Math.floor(e);for(let t=2;t<r;t+=2)if(this.data[t]>=e)return this.data[t-1];return r>=4?this.data[r-3]:this.data[1]}case"interpolate":default:{if(e-Math.floor(e)>0){let t=`GET DATA BETWEEN TIMES was called with an input value (${e}) that has a fractional part. `;throw t+="When mode is 0 (interpolate) and the input value is not a whole number, Vensim produces unexpected ",t+="results that may differ from those produced by SDEverywhere.",new Error(t)}for(let t=2;t<r;t+=2){const s=this.data[t];if(s>=e){const a=this.data[t-2],i=this.data[t-1],u=this.data[t+1],c=s-a,l=u-i;return i+l/c*(e-a)}}return this.data[r-1]}}}},EPSILON=1e-6;function getJsModelFunctions(){let e;const n=new Map,r=new Map;return{setContext(t){e=t},ABS(t){return Math.abs(t)},ARCCOS(t){return Math.acos(t)},ARCSIN(t){return Math.asin(t)},ARCTAN(t){return Math.atan(t)},COS(t){return Math.cos(t)},EXP(t){return Math.exp(t)},GAME(t,s){return t?t.getValueForGameTime(e.currentTime,s):s},INTEG(t,s){return t+s*e.timeStep},INTEGER(t){return Math.trunc(t)},LN(t){return Math.log(t)},MAX(t,s){return Math.max(t,s)},MIN(t,s){return Math.min(t,s)},MODULO(t,s){return t%s},POW(t,s){return Math.pow(t,s)},POWER(t,s){return Math.pow(t,s)},PULSE(t,s){return pulse(e,t,s)},PULSE_TRAIN(t,s,a,i){const u=Math.floor((i-t)/a);for(let c=0;c<=u;c++)if(e.currentTime<=i&&pulse(e,t+c*a,s))return 1;return 0},QUANTUM(t,s){return s<=0?t:s*Math.trunc(t/s)},RAMP(t,s,a){return e.currentTime>s?e.currentTime<a||s>a?t*(e.currentTime-s):t*(a-s):0},SIN(t){return Math.sin(t)},SQRT(t){return Math.sqrt(t)},STEP(t,s){return e.currentTime+e.timeStep/2>s?t:0},TAN(t){return Math.tan(t)},VECTOR_SORT_ORDER(t,s,a){if(s>t.length)throw new Error(`VECTOR SORT ORDER input vector length (${t.length}) must be >= size (${s})`);let i=r.get(s);if(i===void 0){i=Array(s);for(let l=0;l<s;l++)i[l]={x:0,ind:0};r.set(s,i)}let u=n.get(s);u===void 0&&(u=Array(s),n.set(s,u));for(let l=0;l<s;l++)i[l].x=t[l],i[l].ind=l;const c=a>0?1:-1;i.sort((l,_)=>{let p;return l.x<_.x?p=-1:l.x>_.x?p=1:p=0,p*c});for(let l=0;l<s;l++)u[l]=i[l].ind;return u},XIDZ(t,s,a){return Math.abs(s)<EPSILON?a:t/s},ZIDZ(t,s){return Math.abs(s)<EPSILON?0:t/s},createLookup(t,s){return new JsModelLookup(t,s)},LOOKUP(t,s){return t?t.getValueForX(s,"interpolate"):_NA_},LOOKUP_FORWARD(t,s){return t?t.getValueForX(s,"forward"):_NA_},LOOKUP_BACKWARD(t,s){return t?t.getValueForX(s,"backward"):_NA_},LOOKUP_INVERT(t,s){return t?t.getValueForY(s):_NA_},WITH_LOOKUP(t,s){return s?s.getValueForX(t,"interpolate"):_NA_},GET_DATA_BETWEEN_TIMES(t,s,a){let i;return a>=1?i="forward":a<=-1?i="backward":i="interpolate",t?t.getValueBetweenTimes(s,i):_NA_}}}function pulse(e,n,r){const t=e.currentTime+e.timeStep/2;return r===0&&(r=e.timeStep),t>n&&t<n+r?1:0}var isWeb;function perfNow(){return isWeb===void 0&&(isWeb=typeof self<"u"&&(self==null?void 0:self.performance)!==void 0),isWeb?self.performance.now():process==null?void 0:process.hrtime()}function perfElapsed(e){if(isWeb)return self.performance.now()-e;{const n=process.hrtime(e);return(n[0]*1e9+n[1])/1e6}}var BaseRunnableModel=class{constructor(e){this.startTime=e.startTime,this.endTime=e.endTime,this.saveFreq=e.saveFreq,this.numSavePoints=e.numSavePoints,this.outputVarIds=e.outputVarIds,this.modelListing=e.modelListing,this.onRunModel=e.onRunModel}runModel(e){var n;let r=e.getInputs();r===void 0&&(e.copyInputs(this.inputs,c=>(this.inputs=new Float64Array(c),this.inputs)),r=this.inputs);let t=e.getOutputIndices();t===void 0&&e.getOutputIndicesLength()>0&&(e.copyOutputIndices(this.outputIndices,c=>(this.outputIndices=new Int32Array(c),this.outputIndices)),t=this.outputIndices);const s=e.getOutputsLength();(this.outputs===void 0||this.outputs.length<s)&&(this.outputs=new Float64Array(s));const a=this.outputs,i=perfNow();(n=this.onRunModel)==null||n.call(this,r,a,{outputIndices:t,lookups:e.getLookups()});const u=perfElapsed(i);e.storeOutputs(a),e.storeElapsedTime(u)}terminate(){}};function initJsModel(e){let n=e.getModelFunctions();n===void 0&&(n=getJsModelFunctions(),e.setModelFunctions(n));const r=e.getInitialTime(),t=e.getFinalTime(),s=e.getTimeStep(),a=e.getSaveFreq(),i=Math.round((t-r)/a)+1;return new BaseRunnableModel({startTime:r,endTime:t,saveFreq:a,numSavePoints:i,outputVarIds:e.outputVarIds,modelListing:e.modelListing,onRunModel:(u,c,l)=>{runJsModel(e,r,t,s,a,i,u,c,l==null?void 0:l.outputIndices,l==null?void 0:l.lookups)}})}function runJsModel(e,n,r,t,s,a,i,u,c,l,_){let p=n;e.setTime(p);const I={timeStep:t,currentTime:p};if(e.getModelFunctions().setContext(I),e.initConstants(),l!==void 0)for(const w of l)e.setLookup(w.varRef.varSpec,w.points);(i==null?void 0:i.length)>0&&e.setInputs(w=>i[w]),e.initLevels();const h=Math.round((r-n)/t),v=r;let T=0,E=0,L=0;for(;T<=h;){if(e.evalAux(),p%s<1e-6){L=0;const w=f=>{const g=L*a+E;u[g]=p<=v?f:void 0,L++};if(c!==void 0){let f=0;const g=c[f++];for(let S=0;S<g;S++){const b=c[f++],y=c[f++];let A;y>0&&(A=c.subarray(f,f+y),f+=y);const o={varIndex:b,subscriptIndices:A};e.storeOutput(o,w)}}else e.storeOutputs(w);E++}if(T===h)break;e.evalLevels(),p+=t,e.setTime(p),I.currentTime=p,T++}}var WasmBuffer=class{constructor(e,n,r,t){this.wasmModule=e,this.numElements=n,this.byteOffset=r,this.heapArray=t}getArrayView(){return this.heapArray}getAddress(){return this.byteOffset}dispose(){var e,n;this.heapArray&&((n=(e=this.wasmModule)._free)==null||n.call(e,this.byteOffset),this.numElements=void 0,this.heapArray=void 0,this.byteOffset=void 0)}};function createInt32WasmBuffer(e,n){const t=n*4,s=e._malloc(t),a=s/4,i=e.HEAP32.subarray(a,a+n);return new WasmBuffer(e,n,s,i)}function createFloat64WasmBuffer(e,n){const t=n*8,s=e._malloc(t),a=s/8,i=e.HEAPF64.subarray(a,a+n);return new WasmBuffer(e,n,s,i)}var WasmModel=class{constructor(e){this.wasmModule=e;function n(r){return e.cwrap(r,"number",[])()}this.startTime=n("getInitialTime"),this.endTime=n("getFinalTime"),this.saveFreq=n("getSaveper"),this.numSavePoints=Math.round((this.endTime-this.startTime)/this.saveFreq)+1,this.outputVarIds=e.outputVarIds,this.modelListing=e.modelListing,this.wasmSetLookup=e.cwrap("setLookup",null,["number","number","number","number"]),this.wasmRunModel=e.cwrap("runModelWithBuffers",null,["number","number","number"])}runModel(e){var n,r,t,s,a,i,u;const c=e.getLookups();if(c!==void 0)for(const h of c){const v=h.varRef.varSpec,T=((n=v.subscriptIndices)==null?void 0:n.length)||0;let E;T>0?((this.lookupSubIndicesBuffer===void 0||this.lookupSubIndicesBuffer.numElements<T)&&((r=this.lookupSubIndicesBuffer)==null||r.dispose(),this.lookupSubIndicesBuffer=createInt32WasmBuffer(this.wasmModule,T)),this.lookupSubIndicesBuffer.getArrayView().set(v.subscriptIndices),E=this.lookupSubIndicesBuffer.getAddress()):E=0;const L=h.points.length;(this.lookupDataBuffer===void 0||this.lookupDataBuffer.numElements<L)&&((t=this.lookupDataBuffer)==null||t.dispose(),this.lookupDataBuffer=createFloat64WasmBuffer(this.wasmModule,L)),this.lookupDataBuffer.getArrayView().set(h.points);const w=this.lookupDataBuffer.getAddress(),f=L/2,g=v.varIndex;this.wasmSetLookup(g,E,w,f)}e.copyInputs((s=this.inputsBuffer)==null?void 0:s.getArrayView(),h=>{var v;return(v=this.inputsBuffer)==null||v.dispose(),this.inputsBuffer=createFloat64WasmBuffer(this.wasmModule,h),this.inputsBuffer.getArrayView()});let l;e.getOutputIndicesLength()>0?(e.copyOutputIndices((a=this.outputIndicesBuffer)==null?void 0:a.getArrayView(),h=>{var v;return(v=this.outputIndicesBuffer)==null||v.dispose(),this.outputIndicesBuffer=createInt32WasmBuffer(this.wasmModule,h),this.outputIndicesBuffer.getArrayView()}),l=this.outputIndicesBuffer):l=void 0;const _=e.getOutputsLength();(this.outputsBuffer===void 0||this.outputsBuffer.numElements<_)&&((i=this.outputsBuffer)==null||i.dispose(),this.outputsBuffer=createFloat64WasmBuffer(this.wasmModule,_));const p=perfNow();this.wasmRunModel(((u=this.inputsBuffer)==null?void 0:u.getAddress())||0,this.outputsBuffer.getAddress(),(l==null?void 0:l.getAddress())||0);const I=perfElapsed(p);e.storeOutputs(this.outputsBuffer.getArrayView()),e.storeElapsedTime(I)}terminate(){var e,n,r;(e=this.inputsBuffer)==null||e.dispose(),this.inputsBuffer=void 0,(n=this.outputsBuffer)==null||n.dispose(),this.outputsBuffer=void 0,(r=this.outputIndicesBuffer)==null||r.dispose(),this.outputIndicesBuffer=void 0}};function initWasmModel(e){return new WasmModel(e)}function createRunnableModel(e){switch(e.kind){case"js":return initJsModel(e);case"wasm":return initWasmModel(e);default:throw new Error("Unable to identify generated model kind")}}var initGeneratedModel,runnableModel,params=new BufferedRunModelParams,modelWorker={async initModel(){if(runnableModel)throw new Error("RunnableModel was already initialized");const e=await initGeneratedModel();return runnableModel=createRunnableModel(e),{outputVarIds:runnableModel.outputVarIds,modelListing:runnableModel.modelListing,startTime:runnableModel.startTime,endTime:runnableModel.endTime,saveFreq:runnableModel.saveFreq,outputRowLength:runnableModel.numSavePoints}},runModel(e){if(!runnableModel)throw new Error("RunnableModel must be initialized before running the model in worker");return params.updateFromEncodedBuffer(e),runnableModel.runModel(params),Transfer(e)}};function exposeModelWorker(e){initGeneratedModel=e,expose(modelWorker)}let __lookup1,_collection,_final_time,_formal_domestic_treatment,_initial_time,_la_collected_household,_la_collected_other,_litering_rate,_littering,_mismanaged,_normal_rate,_placed_on_market,_placed_on_market_data,_pom,_rate_domestic,_rate_dumped,_rate_of_recycling,_rate_overseas,_residual_rate,_saveper,_sent_for_recycling,_sent_for_residual_treatment,_sent_overseas,_time_step,_waste_collected,_waste_collected_sent_to_formal_domestic_treatment,_waste_generated,_waste_generation_rate,_wmc_collected;const __lookup1_data_=[2012,2554750,2013,2260620,2014,2221040,2015,2261020,2016,2261020,2017,2261020,2018,2362060,2019,2473110,2020,2491780,2021,2515490,2022,2246010,2023,2433790,2024,2448580,2025,2460630,2026,2469870,2027,2476250,2030,2493120,2035,2514140,2040,2529710,2042,2534900];let _time;function setTime(e){_time=e}let controlParamsInitialized=!1;function initControlParamsIfNeeded(){if(!controlParamsInitialized){if(fns===void 0)throw new Error("Must call setModelFunctions() before running the model");if(initConstants(),_initial_time===void 0)throw new Error("INITIAL TIME must be defined as a constant value");if(_time_step===void 0)throw new Error("TIME STEP must be defined as a constant value");if(_final_time===void 0||_saveper===void 0){if(setTime(_initial_time),fns.setContext({timeStep:_time_step,currentTime:_time}),initLevels(),evalAux(),_final_time===void 0)throw new Error("FINAL TIME must be defined");if(_saveper===void 0)throw new Error("SAVEPER must be defined")}controlParamsInitialized=!0}}function getInitialTime(){return initControlParamsIfNeeded(),_initial_time}function getFinalTime(){return initControlParamsIfNeeded(),_final_time}function getTimeStep(){return initControlParamsIfNeeded(),_time_step}function getSaveFreq(){return initControlParamsIfNeeded(),_saveper}let fns;function getModelFunctions(){return fns}function setModelFunctions(e){fns=e}let lookups_initialized=!1;function initLookups0(){__lookup1=fns.createLookup(20,__lookup1_data_)}function initLookups(){lookups_initialized||(initLookups0(),lookups_initialized=!0)}function initConstants0(){_final_time=2042,_initial_time=2012,_time_step=1,_la_collected_household=.5,_la_collected_other=.2,_litering_rate=.1,_normal_rate=1,_rate_domestic=.4,_rate_dumped=.05,_rate_of_recycling=.4,_rate_overseas=.55,_residual_rate=.6,_wmc_collected=.2}function initConstants(){initConstants0(),initLookups()}function initLevels0(){_formal_domestic_treatment=9e5,_waste_collected=2e6,_waste_generated=2554750,_placed_on_market_data=fns.WITH_LOOKUP(_time,__lookup1),_placed_on_market=_placed_on_market_data}function initLevels(){initLevels0()}function evalAux0(){_collection=(_la_collected_household+_la_collected_other+_wmc_collected)*_waste_generated,_littering=_litering_rate*_waste_generated,_mismanaged=_rate_dumped*_waste_collected,_placed_on_market_data=fns.WITH_LOOKUP(_time,__lookup1),_saveper=_time_step,_sent_for_recycling=_formal_domestic_treatment*_rate_of_recycling,_sent_for_residual_treatment=_formal_domestic_treatment*_residual_rate,_sent_overseas=_rate_overseas*_waste_collected,_waste_collected_sent_to_formal_domestic_treatment=_rate_domestic*_waste_collected,_pom=_placed_on_market,_waste_generation_rate=_normal_rate*_pom}function evalAux(){evalAux0()}function evalLevels0(){_formal_domestic_treatment=fns.INTEG(_formal_domestic_treatment,_waste_collected_sent_to_formal_domestic_treatment-_sent_for_recycling-_sent_for_residual_treatment),_placed_on_market=fns.INTEG(_placed_on_market,_placed_on_market_data-_pom),_waste_collected=fns.INTEG(_waste_collected,_collection-_mismanaged-_sent_overseas-_waste_collected_sent_to_formal_domestic_treatment),_waste_generated=fns.INTEG(_waste_generated,_waste_generation_rate-_collection-_littering)}function evalLevels(){evalLevels0()}function setInputs(e){_la_collected_household=e(0)}function setLookup(e,n){throw new Error("The setLookup function was not enabled for the generated model. Set the customLookups property in the spec/config file to allow for overriding lookups at runtime.")}const outputVarIds=["_placed_on_market","_sent_for_recycling","_waste_collected"],outputVarNames=["Placed on market","Sent for recycling","Waste collected"];function storeOutputs(e){e(_placed_on_market),e(_sent_for_recycling),e(_waste_collected)}function storeOutput(e,n){throw new Error("The storeOutput function was not enabled for the generated model. Set the customOutputs property in the spec/config file to allow for capturing arbitrary variables at runtime.")}const modelListing=void 0;async function loadGeneratedModel(){return{kind:"js",outputVarIds,outputVarNames,modelListing,getInitialTime,getFinalTime,getTimeStep,getSaveFreq,getModelFunctions,setModelFunctions,setTime,setInputs,setLookup,storeOutputs,storeOutput,initConstants,initLevels,evalAux,evalLevels}}exposeModelWorker(loadGeneratedModel)})();\n', VERSION = 1;
class BundleModel {
  /**
   * @param modelSpec The spec for the bundled model.
   * @param inputMap The model inputs.
   * @param modelRunner The model runner.
   */
  constructor(t, r, n) {
    this.modelSpec = t, this.inputMap = r, this.modelRunner = n, this.inputs = [...r.values()].map((s) => s.value), this.outputs = n.createOutputs();
  }
  // from CheckBundleModel interface
  async getDatasetsForScenario(t, r) {
    const n = /* @__PURE__ */ new Map();
    setInputsForScenario(this.inputMap, t), this.outputs = await this.modelRunner.runModel(this.inputs, this.outputs);
    const s = this.outputs.runTimeInMillis;
    for (const o of r) {
      const a = this.modelSpec.outputVars.get(o);
      if (a)
        if (a.sourceName === void 0) {
          const l = this.outputs.getSeriesForVar(a.varId);
          l && n.set(o, datasetFromPoints(l.points));
        } else
          console.error("Static data sources not yet handled in default model check bundle");
    }
    return {
      datasetMap: n,
      modelRunTime: s
    };
  }
  // from CheckBundleModel interface
  // TODO: This function should be optional
  async getGraphDataForScenario() {
  }
  // from CheckBundleModel interface
  // TODO: This function should be optional
  getGraphLinksForScenario() {
    return [];
  }
}
async function initBundleModel(e, t) {
  const r = await spawnAsyncModelRunner({ source: modelWorkerJs });
  return new BundleModel(e, t, r);
}
function datasetFromPoints(e) {
  const t = /* @__PURE__ */ new Map();
  for (const r of e)
    r.y !== void 0 && t.set(r.x, r.y);
  return t;
}
function createBundle() {
  const e = getInputVars(inputSpecs), t = getOutputVars(outputSpecs), r = {
    modelSizeInBytes,
    dataSizeInBytes,
    inputVars: e,
    outputVars: t,
    implVars: /* @__PURE__ */ new Map()
    // TODO: startTime and endTime are optional; the comparison graphs work OK if
    // they are undefined.  The main benefit of using these is to set a specific
    // range for the x-axis on the comparison graphs, so maybe we should find
    // another way to allow these to be defined.
    // startTime,
    // endTime
  };
  return {
    version: VERSION,
    modelSpec: r,
    initModel: () => initBundleModel(r, e)
  };
}
export {
  createBundle
};
