var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// ../../../AppData/Roaming/npm/node_modules/wrangler/node_modules/unenv/dist/runtime/_internal/utils.mjs
// @__NO_SIDE_EFFECTS__
function createNotImplementedError(name) {
  return new Error(`[unenv] ${name} is not implemented yet!`);
}
__name(createNotImplementedError, "createNotImplementedError");
// @__NO_SIDE_EFFECTS__
function notImplemented(name) {
  const fn = /* @__PURE__ */ __name(() => {
    throw /* @__PURE__ */ createNotImplementedError(name);
  }, "fn");
  return Object.assign(fn, { __unenv__: true });
}
__name(notImplemented, "notImplemented");
// @__NO_SIDE_EFFECTS__
function notImplementedClass(name) {
  return class {
    __unenv__ = true;
    constructor() {
      throw new Error(`[unenv] ${name} is not implemented yet!`);
    }
  };
}
__name(notImplementedClass, "notImplementedClass");

// ../../../AppData/Roaming/npm/node_modules/wrangler/node_modules/unenv/dist/runtime/node/internal/perf_hooks/performance.mjs
var _timeOrigin = globalThis.performance?.timeOrigin ?? Date.now();
var _performanceNow = globalThis.performance?.now ? globalThis.performance.now.bind(globalThis.performance) : () => Date.now() - _timeOrigin;
var nodeTiming = {
  name: "node",
  entryType: "node",
  startTime: 0,
  duration: 0,
  nodeStart: 0,
  v8Start: 0,
  bootstrapComplete: 0,
  environment: 0,
  loopStart: 0,
  loopExit: 0,
  idleTime: 0,
  uvMetricsInfo: {
    loopCount: 0,
    events: 0,
    eventsWaiting: 0
  },
  detail: void 0,
  toJSON() {
    return this;
  }
};
var PerformanceEntry = class {
  static {
    __name(this, "PerformanceEntry");
  }
  __unenv__ = true;
  detail;
  entryType = "event";
  name;
  startTime;
  constructor(name, options) {
    this.name = name;
    this.startTime = options?.startTime || _performanceNow();
    this.detail = options?.detail;
  }
  get duration() {
    return _performanceNow() - this.startTime;
  }
  toJSON() {
    return {
      name: this.name,
      entryType: this.entryType,
      startTime: this.startTime,
      duration: this.duration,
      detail: this.detail
    };
  }
};
var PerformanceMark = class PerformanceMark2 extends PerformanceEntry {
  static {
    __name(this, "PerformanceMark");
  }
  entryType = "mark";
  constructor() {
    super(...arguments);
  }
  get duration() {
    return 0;
  }
};
var PerformanceMeasure = class extends PerformanceEntry {
  static {
    __name(this, "PerformanceMeasure");
  }
  entryType = "measure";
};
var PerformanceResourceTiming = class extends PerformanceEntry {
  static {
    __name(this, "PerformanceResourceTiming");
  }
  entryType = "resource";
  serverTiming = [];
  connectEnd = 0;
  connectStart = 0;
  decodedBodySize = 0;
  domainLookupEnd = 0;
  domainLookupStart = 0;
  encodedBodySize = 0;
  fetchStart = 0;
  initiatorType = "";
  name = "";
  nextHopProtocol = "";
  redirectEnd = 0;
  redirectStart = 0;
  requestStart = 0;
  responseEnd = 0;
  responseStart = 0;
  secureConnectionStart = 0;
  startTime = 0;
  transferSize = 0;
  workerStart = 0;
  responseStatus = 0;
};
var PerformanceObserverEntryList = class {
  static {
    __name(this, "PerformanceObserverEntryList");
  }
  __unenv__ = true;
  getEntries() {
    return [];
  }
  getEntriesByName(_name, _type) {
    return [];
  }
  getEntriesByType(type) {
    return [];
  }
};
var Performance = class {
  static {
    __name(this, "Performance");
  }
  __unenv__ = true;
  timeOrigin = _timeOrigin;
  eventCounts = /* @__PURE__ */ new Map();
  _entries = [];
  _resourceTimingBufferSize = 0;
  navigation = void 0;
  timing = void 0;
  timerify(_fn, _options) {
    throw createNotImplementedError("Performance.timerify");
  }
  get nodeTiming() {
    return nodeTiming;
  }
  eventLoopUtilization() {
    return {};
  }
  markResourceTiming() {
    return new PerformanceResourceTiming("");
  }
  onresourcetimingbufferfull = null;
  now() {
    if (this.timeOrigin === _timeOrigin) {
      return _performanceNow();
    }
    return Date.now() - this.timeOrigin;
  }
  clearMarks(markName) {
    this._entries = markName ? this._entries.filter((e) => e.name !== markName) : this._entries.filter((e) => e.entryType !== "mark");
  }
  clearMeasures(measureName) {
    this._entries = measureName ? this._entries.filter((e) => e.name !== measureName) : this._entries.filter((e) => e.entryType !== "measure");
  }
  clearResourceTimings() {
    this._entries = this._entries.filter((e) => e.entryType !== "resource" || e.entryType !== "navigation");
  }
  getEntries() {
    return this._entries;
  }
  getEntriesByName(name, type) {
    return this._entries.filter((e) => e.name === name && (!type || e.entryType === type));
  }
  getEntriesByType(type) {
    return this._entries.filter((e) => e.entryType === type);
  }
  mark(name, options) {
    const entry = new PerformanceMark(name, options);
    this._entries.push(entry);
    return entry;
  }
  measure(measureName, startOrMeasureOptions, endMark) {
    let start;
    let end;
    if (typeof startOrMeasureOptions === "string") {
      start = this.getEntriesByName(startOrMeasureOptions, "mark")[0]?.startTime;
      end = this.getEntriesByName(endMark, "mark")[0]?.startTime;
    } else {
      start = Number.parseFloat(startOrMeasureOptions?.start) || this.now();
      end = Number.parseFloat(startOrMeasureOptions?.end) || this.now();
    }
    const entry = new PerformanceMeasure(measureName, {
      startTime: start,
      detail: {
        start,
        end
      }
    });
    this._entries.push(entry);
    return entry;
  }
  setResourceTimingBufferSize(maxSize) {
    this._resourceTimingBufferSize = maxSize;
  }
  addEventListener(type, listener, options) {
    throw createNotImplementedError("Performance.addEventListener");
  }
  removeEventListener(type, listener, options) {
    throw createNotImplementedError("Performance.removeEventListener");
  }
  dispatchEvent(event) {
    throw createNotImplementedError("Performance.dispatchEvent");
  }
  toJSON() {
    return this;
  }
};
var PerformanceObserver = class {
  static {
    __name(this, "PerformanceObserver");
  }
  __unenv__ = true;
  static supportedEntryTypes = [];
  _callback = null;
  constructor(callback) {
    this._callback = callback;
  }
  takeRecords() {
    return [];
  }
  disconnect() {
    throw createNotImplementedError("PerformanceObserver.disconnect");
  }
  observe(options) {
    throw createNotImplementedError("PerformanceObserver.observe");
  }
  bind(fn) {
    return fn;
  }
  runInAsyncScope(fn, thisArg, ...args) {
    return fn.call(thisArg, ...args);
  }
  asyncId() {
    return 0;
  }
  triggerAsyncId() {
    return 0;
  }
  emitDestroy() {
    return this;
  }
};
var performance = globalThis.performance && "addEventListener" in globalThis.performance ? globalThis.performance : new Performance();

// ../../../AppData/Roaming/npm/node_modules/wrangler/node_modules/@cloudflare/unenv-preset/dist/runtime/polyfill/performance.mjs
globalThis.performance = performance;
globalThis.Performance = Performance;
globalThis.PerformanceEntry = PerformanceEntry;
globalThis.PerformanceMark = PerformanceMark;
globalThis.PerformanceMeasure = PerformanceMeasure;
globalThis.PerformanceObserver = PerformanceObserver;
globalThis.PerformanceObserverEntryList = PerformanceObserverEntryList;
globalThis.PerformanceResourceTiming = PerformanceResourceTiming;

// ../../../AppData/Roaming/npm/node_modules/wrangler/node_modules/unenv/dist/runtime/node/console.mjs
import { Writable } from "node:stream";

// ../../../AppData/Roaming/npm/node_modules/wrangler/node_modules/unenv/dist/runtime/mock/noop.mjs
var noop_default = Object.assign(() => {
}, { __unenv__: true });

// ../../../AppData/Roaming/npm/node_modules/wrangler/node_modules/unenv/dist/runtime/node/console.mjs
var _console = globalThis.console;
var _ignoreErrors = true;
var _stderr = new Writable();
var _stdout = new Writable();
var log = _console?.log ?? noop_default;
var info = _console?.info ?? log;
var trace = _console?.trace ?? info;
var debug = _console?.debug ?? log;
var table = _console?.table ?? log;
var error = _console?.error ?? log;
var warn = _console?.warn ?? error;
var createTask = _console?.createTask ?? /* @__PURE__ */ notImplemented("console.createTask");
var clear = _console?.clear ?? noop_default;
var count = _console?.count ?? noop_default;
var countReset = _console?.countReset ?? noop_default;
var dir = _console?.dir ?? noop_default;
var dirxml = _console?.dirxml ?? noop_default;
var group = _console?.group ?? noop_default;
var groupEnd = _console?.groupEnd ?? noop_default;
var groupCollapsed = _console?.groupCollapsed ?? noop_default;
var profile = _console?.profile ?? noop_default;
var profileEnd = _console?.profileEnd ?? noop_default;
var time = _console?.time ?? noop_default;
var timeEnd = _console?.timeEnd ?? noop_default;
var timeLog = _console?.timeLog ?? noop_default;
var timeStamp = _console?.timeStamp ?? noop_default;
var Console = _console?.Console ?? /* @__PURE__ */ notImplementedClass("console.Console");
var _times = /* @__PURE__ */ new Map();
var _stdoutErrorHandler = noop_default;
var _stderrErrorHandler = noop_default;

// ../../../AppData/Roaming/npm/node_modules/wrangler/node_modules/@cloudflare/unenv-preset/dist/runtime/node/console.mjs
var workerdConsole = globalThis["console"];
var {
  assert,
  clear: clear2,
  // @ts-expect-error undocumented public API
  context,
  count: count2,
  countReset: countReset2,
  // @ts-expect-error undocumented public API
  createTask: createTask2,
  debug: debug2,
  dir: dir2,
  dirxml: dirxml2,
  error: error2,
  group: group2,
  groupCollapsed: groupCollapsed2,
  groupEnd: groupEnd2,
  info: info2,
  log: log2,
  profile: profile2,
  profileEnd: profileEnd2,
  table: table2,
  time: time2,
  timeEnd: timeEnd2,
  timeLog: timeLog2,
  timeStamp: timeStamp2,
  trace: trace2,
  warn: warn2
} = workerdConsole;
Object.assign(workerdConsole, {
  Console,
  _ignoreErrors,
  _stderr,
  _stderrErrorHandler,
  _stdout,
  _stdoutErrorHandler,
  _times
});
var console_default = workerdConsole;

// ../../../AppData/Roaming/npm/node_modules/wrangler/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-console
globalThis.console = console_default;

// ../../../AppData/Roaming/npm/node_modules/wrangler/node_modules/unenv/dist/runtime/node/internal/process/hrtime.mjs
var hrtime = /* @__PURE__ */ Object.assign(/* @__PURE__ */ __name(function hrtime2(startTime) {
  const now = Date.now();
  const seconds = Math.trunc(now / 1e3);
  const nanos = now % 1e3 * 1e6;
  if (startTime) {
    let diffSeconds = seconds - startTime[0];
    let diffNanos = nanos - startTime[0];
    if (diffNanos < 0) {
      diffSeconds = diffSeconds - 1;
      diffNanos = 1e9 + diffNanos;
    }
    return [diffSeconds, diffNanos];
  }
  return [seconds, nanos];
}, "hrtime"), { bigint: /* @__PURE__ */ __name(function bigint() {
  return BigInt(Date.now() * 1e6);
}, "bigint") });

// ../../../AppData/Roaming/npm/node_modules/wrangler/node_modules/unenv/dist/runtime/node/internal/process/process.mjs
import { EventEmitter } from "node:events";

// ../../../AppData/Roaming/npm/node_modules/wrangler/node_modules/unenv/dist/runtime/node/internal/tty/read-stream.mjs
var ReadStream = class {
  static {
    __name(this, "ReadStream");
  }
  fd;
  isRaw = false;
  isTTY = false;
  constructor(fd) {
    this.fd = fd;
  }
  setRawMode(mode) {
    this.isRaw = mode;
    return this;
  }
};

// ../../../AppData/Roaming/npm/node_modules/wrangler/node_modules/unenv/dist/runtime/node/internal/tty/write-stream.mjs
var WriteStream = class {
  static {
    __name(this, "WriteStream");
  }
  fd;
  columns = 80;
  rows = 24;
  isTTY = false;
  constructor(fd) {
    this.fd = fd;
  }
  clearLine(dir3, callback) {
    callback && callback();
    return false;
  }
  clearScreenDown(callback) {
    callback && callback();
    return false;
  }
  cursorTo(x, y, callback) {
    callback && typeof callback === "function" && callback();
    return false;
  }
  moveCursor(dx, dy, callback) {
    callback && callback();
    return false;
  }
  getColorDepth(env2) {
    return 1;
  }
  hasColors(count3, env2) {
    return false;
  }
  getWindowSize() {
    return [this.columns, this.rows];
  }
  write(str, encoding, cb) {
    if (str instanceof Uint8Array) {
      str = new TextDecoder().decode(str);
    }
    try {
      console.log(str);
    } catch {
    }
    cb && typeof cb === "function" && cb();
    return false;
  }
};

// ../../../AppData/Roaming/npm/node_modules/wrangler/node_modules/unenv/dist/runtime/node/internal/process/node-version.mjs
var NODE_VERSION = "22.14.0";

// ../../../AppData/Roaming/npm/node_modules/wrangler/node_modules/unenv/dist/runtime/node/internal/process/process.mjs
var Process = class _Process extends EventEmitter {
  static {
    __name(this, "Process");
  }
  env;
  hrtime;
  nextTick;
  constructor(impl) {
    super();
    this.env = impl.env;
    this.hrtime = impl.hrtime;
    this.nextTick = impl.nextTick;
    for (const prop of [...Object.getOwnPropertyNames(_Process.prototype), ...Object.getOwnPropertyNames(EventEmitter.prototype)]) {
      const value = this[prop];
      if (typeof value === "function") {
        this[prop] = value.bind(this);
      }
    }
  }
  // --- event emitter ---
  emitWarning(warning, type, code) {
    console.warn(`${code ? `[${code}] ` : ""}${type ? `${type}: ` : ""}${warning}`);
  }
  emit(...args) {
    return super.emit(...args);
  }
  listeners(eventName) {
    return super.listeners(eventName);
  }
  // --- stdio (lazy initializers) ---
  #stdin;
  #stdout;
  #stderr;
  get stdin() {
    return this.#stdin ??= new ReadStream(0);
  }
  get stdout() {
    return this.#stdout ??= new WriteStream(1);
  }
  get stderr() {
    return this.#stderr ??= new WriteStream(2);
  }
  // --- cwd ---
  #cwd = "/";
  chdir(cwd2) {
    this.#cwd = cwd2;
  }
  cwd() {
    return this.#cwd;
  }
  // --- dummy props and getters ---
  arch = "";
  platform = "";
  argv = [];
  argv0 = "";
  execArgv = [];
  execPath = "";
  title = "";
  pid = 200;
  ppid = 100;
  get version() {
    return `v${NODE_VERSION}`;
  }
  get versions() {
    return { node: NODE_VERSION };
  }
  get allowedNodeEnvironmentFlags() {
    return /* @__PURE__ */ new Set();
  }
  get sourceMapsEnabled() {
    return false;
  }
  get debugPort() {
    return 0;
  }
  get throwDeprecation() {
    return false;
  }
  get traceDeprecation() {
    return false;
  }
  get features() {
    return {};
  }
  get release() {
    return {};
  }
  get connected() {
    return false;
  }
  get config() {
    return {};
  }
  get moduleLoadList() {
    return [];
  }
  constrainedMemory() {
    return 0;
  }
  availableMemory() {
    return 0;
  }
  uptime() {
    return 0;
  }
  resourceUsage() {
    return {};
  }
  // --- noop methods ---
  ref() {
  }
  unref() {
  }
  // --- unimplemented methods ---
  umask() {
    throw createNotImplementedError("process.umask");
  }
  getBuiltinModule() {
    return void 0;
  }
  getActiveResourcesInfo() {
    throw createNotImplementedError("process.getActiveResourcesInfo");
  }
  exit() {
    throw createNotImplementedError("process.exit");
  }
  reallyExit() {
    throw createNotImplementedError("process.reallyExit");
  }
  kill() {
    throw createNotImplementedError("process.kill");
  }
  abort() {
    throw createNotImplementedError("process.abort");
  }
  dlopen() {
    throw createNotImplementedError("process.dlopen");
  }
  setSourceMapsEnabled() {
    throw createNotImplementedError("process.setSourceMapsEnabled");
  }
  loadEnvFile() {
    throw createNotImplementedError("process.loadEnvFile");
  }
  disconnect() {
    throw createNotImplementedError("process.disconnect");
  }
  cpuUsage() {
    throw createNotImplementedError("process.cpuUsage");
  }
  setUncaughtExceptionCaptureCallback() {
    throw createNotImplementedError("process.setUncaughtExceptionCaptureCallback");
  }
  hasUncaughtExceptionCaptureCallback() {
    throw createNotImplementedError("process.hasUncaughtExceptionCaptureCallback");
  }
  initgroups() {
    throw createNotImplementedError("process.initgroups");
  }
  openStdin() {
    throw createNotImplementedError("process.openStdin");
  }
  assert() {
    throw createNotImplementedError("process.assert");
  }
  binding() {
    throw createNotImplementedError("process.binding");
  }
  // --- attached interfaces ---
  permission = { has: /* @__PURE__ */ notImplemented("process.permission.has") };
  report = {
    directory: "",
    filename: "",
    signal: "SIGUSR2",
    compact: false,
    reportOnFatalError: false,
    reportOnSignal: false,
    reportOnUncaughtException: false,
    getReport: /* @__PURE__ */ notImplemented("process.report.getReport"),
    writeReport: /* @__PURE__ */ notImplemented("process.report.writeReport")
  };
  finalization = {
    register: /* @__PURE__ */ notImplemented("process.finalization.register"),
    unregister: /* @__PURE__ */ notImplemented("process.finalization.unregister"),
    registerBeforeExit: /* @__PURE__ */ notImplemented("process.finalization.registerBeforeExit")
  };
  memoryUsage = Object.assign(() => ({
    arrayBuffers: 0,
    rss: 0,
    external: 0,
    heapTotal: 0,
    heapUsed: 0
  }), { rss: /* @__PURE__ */ __name(() => 0, "rss") });
  // --- undefined props ---
  mainModule = void 0;
  domain = void 0;
  // optional
  send = void 0;
  exitCode = void 0;
  channel = void 0;
  getegid = void 0;
  geteuid = void 0;
  getgid = void 0;
  getgroups = void 0;
  getuid = void 0;
  setegid = void 0;
  seteuid = void 0;
  setgid = void 0;
  setgroups = void 0;
  setuid = void 0;
  // internals
  _events = void 0;
  _eventsCount = void 0;
  _exiting = void 0;
  _maxListeners = void 0;
  _debugEnd = void 0;
  _debugProcess = void 0;
  _fatalException = void 0;
  _getActiveHandles = void 0;
  _getActiveRequests = void 0;
  _kill = void 0;
  _preload_modules = void 0;
  _rawDebug = void 0;
  _startProfilerIdleNotifier = void 0;
  _stopProfilerIdleNotifier = void 0;
  _tickCallback = void 0;
  _disconnect = void 0;
  _handleQueue = void 0;
  _pendingMessage = void 0;
  _channel = void 0;
  _send = void 0;
  _linkedBinding = void 0;
};

// ../../../AppData/Roaming/npm/node_modules/wrangler/node_modules/@cloudflare/unenv-preset/dist/runtime/node/process.mjs
var globalProcess = globalThis["process"];
var getBuiltinModule = globalProcess.getBuiltinModule;
var workerdProcess = getBuiltinModule("node:process");
var isWorkerdProcessV2 = globalThis.Cloudflare.compatibilityFlags.enable_nodejs_process_v2;
var unenvProcess = new Process({
  env: globalProcess.env,
  // `hrtime` is only available from workerd process v2
  hrtime: isWorkerdProcessV2 ? workerdProcess.hrtime : hrtime,
  // `nextTick` is available from workerd process v1
  nextTick: workerdProcess.nextTick
});
var { exit, features, platform } = workerdProcess;
var {
  // Always implemented by workerd
  env,
  // Only implemented in workerd v2
  hrtime: hrtime3,
  // Always implemented by workerd
  nextTick
} = unenvProcess;
var {
  _channel,
  _disconnect,
  _events,
  _eventsCount,
  _handleQueue,
  _maxListeners,
  _pendingMessage,
  _send,
  assert: assert2,
  disconnect,
  mainModule
} = unenvProcess;
var {
  // @ts-expect-error `_debugEnd` is missing typings
  _debugEnd,
  // @ts-expect-error `_debugProcess` is missing typings
  _debugProcess,
  // @ts-expect-error `_exiting` is missing typings
  _exiting,
  // @ts-expect-error `_fatalException` is missing typings
  _fatalException,
  // @ts-expect-error `_getActiveHandles` is missing typings
  _getActiveHandles,
  // @ts-expect-error `_getActiveRequests` is missing typings
  _getActiveRequests,
  // @ts-expect-error `_kill` is missing typings
  _kill,
  // @ts-expect-error `_linkedBinding` is missing typings
  _linkedBinding,
  // @ts-expect-error `_preload_modules` is missing typings
  _preload_modules,
  // @ts-expect-error `_rawDebug` is missing typings
  _rawDebug,
  // @ts-expect-error `_startProfilerIdleNotifier` is missing typings
  _startProfilerIdleNotifier,
  // @ts-expect-error `_stopProfilerIdleNotifier` is missing typings
  _stopProfilerIdleNotifier,
  // @ts-expect-error `_tickCallback` is missing typings
  _tickCallback,
  abort,
  addListener,
  allowedNodeEnvironmentFlags,
  arch,
  argv,
  argv0,
  availableMemory,
  // @ts-expect-error `binding` is missing typings
  binding,
  channel,
  chdir,
  config,
  connected,
  constrainedMemory,
  cpuUsage,
  cwd,
  debugPort,
  dlopen,
  // @ts-expect-error `domain` is missing typings
  domain,
  emit,
  emitWarning,
  eventNames,
  execArgv,
  execPath,
  exitCode,
  finalization,
  getActiveResourcesInfo,
  getegid,
  geteuid,
  getgid,
  getgroups,
  getMaxListeners,
  getuid,
  hasUncaughtExceptionCaptureCallback,
  // @ts-expect-error `initgroups` is missing typings
  initgroups,
  kill,
  listenerCount,
  listeners,
  loadEnvFile,
  memoryUsage,
  // @ts-expect-error `moduleLoadList` is missing typings
  moduleLoadList,
  off,
  on,
  once,
  // @ts-expect-error `openStdin` is missing typings
  openStdin,
  permission,
  pid,
  ppid,
  prependListener,
  prependOnceListener,
  rawListeners,
  // @ts-expect-error `reallyExit` is missing typings
  reallyExit,
  ref,
  release,
  removeAllListeners,
  removeListener,
  report,
  resourceUsage,
  send,
  setegid,
  seteuid,
  setgid,
  setgroups,
  setMaxListeners,
  setSourceMapsEnabled,
  setuid,
  setUncaughtExceptionCaptureCallback,
  sourceMapsEnabled,
  stderr,
  stdin,
  stdout,
  throwDeprecation,
  title,
  traceDeprecation,
  umask,
  unref,
  uptime,
  version,
  versions
} = isWorkerdProcessV2 ? workerdProcess : unenvProcess;
var _process = {
  abort,
  addListener,
  allowedNodeEnvironmentFlags,
  hasUncaughtExceptionCaptureCallback,
  setUncaughtExceptionCaptureCallback,
  loadEnvFile,
  sourceMapsEnabled,
  arch,
  argv,
  argv0,
  chdir,
  config,
  connected,
  constrainedMemory,
  availableMemory,
  cpuUsage,
  cwd,
  debugPort,
  dlopen,
  disconnect,
  emit,
  emitWarning,
  env,
  eventNames,
  execArgv,
  execPath,
  exit,
  finalization,
  features,
  getBuiltinModule,
  getActiveResourcesInfo,
  getMaxListeners,
  hrtime: hrtime3,
  kill,
  listeners,
  listenerCount,
  memoryUsage,
  nextTick,
  on,
  off,
  once,
  pid,
  platform,
  ppid,
  prependListener,
  prependOnceListener,
  rawListeners,
  release,
  removeAllListeners,
  removeListener,
  report,
  resourceUsage,
  setMaxListeners,
  setSourceMapsEnabled,
  stderr,
  stdin,
  stdout,
  title,
  throwDeprecation,
  traceDeprecation,
  umask,
  uptime,
  version,
  versions,
  // @ts-expect-error old API
  domain,
  initgroups,
  moduleLoadList,
  reallyExit,
  openStdin,
  assert: assert2,
  binding,
  send,
  exitCode,
  channel,
  getegid,
  geteuid,
  getgid,
  getgroups,
  getuid,
  setegid,
  seteuid,
  setgid,
  setgroups,
  setuid,
  permission,
  mainModule,
  _events,
  _eventsCount,
  _exiting,
  _maxListeners,
  _debugEnd,
  _debugProcess,
  _fatalException,
  _getActiveHandles,
  _getActiveRequests,
  _kill,
  _preload_modules,
  _rawDebug,
  _startProfilerIdleNotifier,
  _stopProfilerIdleNotifier,
  _tickCallback,
  _disconnect,
  _handleQueue,
  _pendingMessage,
  _channel,
  _send,
  _linkedBinding
};
var process_default = _process;

// ../../../AppData/Roaming/npm/node_modules/wrangler/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-process
globalThis.process = process_default;

// node_modules/hono/dist/compose.js
var compose = /* @__PURE__ */ __name((middleware, onError, onNotFound) => {
  return (context2, next) => {
    let index = -1;
    return dispatch(0);
    async function dispatch(i) {
      if (i <= index) {
        throw new Error("next() called multiple times");
      }
      index = i;
      let res;
      let isError = false;
      let handler;
      if (middleware[i]) {
        handler = middleware[i][0][0];
        context2.req.routeIndex = i;
      } else {
        handler = i === middleware.length && next || void 0;
      }
      if (handler) {
        try {
          res = await handler(context2, () => dispatch(i + 1));
        } catch (err) {
          if (err instanceof Error && onError) {
            context2.error = err;
            res = await onError(err, context2);
            isError = true;
          } else {
            throw err;
          }
        }
      } else {
        if (context2.finalized === false && onNotFound) {
          res = await onNotFound(context2);
        }
      }
      if (res && (context2.finalized === false || isError)) {
        context2.res = res;
      }
      return context2;
    }
    __name(dispatch, "dispatch");
  };
}, "compose");

// node_modules/hono/dist/request/constants.js
var GET_MATCH_RESULT = Symbol();

// node_modules/hono/dist/utils/body.js
var parseBody = /* @__PURE__ */ __name(async (request, options = /* @__PURE__ */ Object.create(null)) => {
  const { all = false, dot = false } = options;
  const headers = request instanceof HonoRequest ? request.raw.headers : request.headers;
  const contentType = headers.get("Content-Type");
  if (contentType?.startsWith("multipart/form-data") || contentType?.startsWith("application/x-www-form-urlencoded")) {
    return parseFormData(request, { all, dot });
  }
  return {};
}, "parseBody");
async function parseFormData(request, options) {
  const formData = await request.formData();
  if (formData) {
    return convertFormDataToBodyData(formData, options);
  }
  return {};
}
__name(parseFormData, "parseFormData");
function convertFormDataToBodyData(formData, options) {
  const form = /* @__PURE__ */ Object.create(null);
  formData.forEach((value, key) => {
    const shouldParseAllValues = options.all || key.endsWith("[]");
    if (!shouldParseAllValues) {
      form[key] = value;
    } else {
      handleParsingAllValues(form, key, value);
    }
  });
  if (options.dot) {
    Object.entries(form).forEach(([key, value]) => {
      const shouldParseDotValues = key.includes(".");
      if (shouldParseDotValues) {
        handleParsingNestedValues(form, key, value);
        delete form[key];
      }
    });
  }
  return form;
}
__name(convertFormDataToBodyData, "convertFormDataToBodyData");
var handleParsingAllValues = /* @__PURE__ */ __name((form, key, value) => {
  if (form[key] !== void 0) {
    if (Array.isArray(form[key])) {
      ;
      form[key].push(value);
    } else {
      form[key] = [form[key], value];
    }
  } else {
    if (!key.endsWith("[]")) {
      form[key] = value;
    } else {
      form[key] = [value];
    }
  }
}, "handleParsingAllValues");
var handleParsingNestedValues = /* @__PURE__ */ __name((form, key, value) => {
  let nestedForm = form;
  const keys = key.split(".");
  keys.forEach((key2, index) => {
    if (index === keys.length - 1) {
      nestedForm[key2] = value;
    } else {
      if (!nestedForm[key2] || typeof nestedForm[key2] !== "object" || Array.isArray(nestedForm[key2]) || nestedForm[key2] instanceof File) {
        nestedForm[key2] = /* @__PURE__ */ Object.create(null);
      }
      nestedForm = nestedForm[key2];
    }
  });
}, "handleParsingNestedValues");

// node_modules/hono/dist/utils/url.js
var splitPath = /* @__PURE__ */ __name((path) => {
  const paths = path.split("/");
  if (paths[0] === "") {
    paths.shift();
  }
  return paths;
}, "splitPath");
var splitRoutingPath = /* @__PURE__ */ __name((routePath) => {
  const { groups, path } = extractGroupsFromPath(routePath);
  const paths = splitPath(path);
  return replaceGroupMarks(paths, groups);
}, "splitRoutingPath");
var extractGroupsFromPath = /* @__PURE__ */ __name((path) => {
  const groups = [];
  path = path.replace(/\{[^}]+\}/g, (match2, index) => {
    const mark = `@${index}`;
    groups.push([mark, match2]);
    return mark;
  });
  return { groups, path };
}, "extractGroupsFromPath");
var replaceGroupMarks = /* @__PURE__ */ __name((paths, groups) => {
  for (let i = groups.length - 1; i >= 0; i--) {
    const [mark] = groups[i];
    for (let j = paths.length - 1; j >= 0; j--) {
      if (paths[j].includes(mark)) {
        paths[j] = paths[j].replace(mark, groups[i][1]);
        break;
      }
    }
  }
  return paths;
}, "replaceGroupMarks");
var patternCache = {};
var getPattern = /* @__PURE__ */ __name((label, next) => {
  if (label === "*") {
    return "*";
  }
  const match2 = label.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
  if (match2) {
    const cacheKey = `${label}#${next}`;
    if (!patternCache[cacheKey]) {
      if (match2[2]) {
        patternCache[cacheKey] = next && next[0] !== ":" && next[0] !== "*" ? [cacheKey, match2[1], new RegExp(`^${match2[2]}(?=/${next})`)] : [label, match2[1], new RegExp(`^${match2[2]}$`)];
      } else {
        patternCache[cacheKey] = [label, match2[1], true];
      }
    }
    return patternCache[cacheKey];
  }
  return null;
}, "getPattern");
var tryDecode = /* @__PURE__ */ __name((str, decoder2) => {
  try {
    return decoder2(str);
  } catch {
    return str.replace(/(?:%[0-9A-Fa-f]{2})+/g, (match2) => {
      try {
        return decoder2(match2);
      } catch {
        return match2;
      }
    });
  }
}, "tryDecode");
var tryDecodeURI = /* @__PURE__ */ __name((str) => tryDecode(str, decodeURI), "tryDecodeURI");
var getPath = /* @__PURE__ */ __name((request) => {
  const url = request.url;
  const start = url.indexOf("/", url.indexOf(":") + 4);
  let i = start;
  for (; i < url.length; i++) {
    const charCode = url.charCodeAt(i);
    if (charCode === 37) {
      const queryIndex = url.indexOf("?", i);
      const path = url.slice(start, queryIndex === -1 ? void 0 : queryIndex);
      return tryDecodeURI(path.includes("%25") ? path.replace(/%25/g, "%2525") : path);
    } else if (charCode === 63) {
      break;
    }
  }
  return url.slice(start, i);
}, "getPath");
var getPathNoStrict = /* @__PURE__ */ __name((request) => {
  const result = getPath(request);
  return result.length > 1 && result.at(-1) === "/" ? result.slice(0, -1) : result;
}, "getPathNoStrict");
var mergePath = /* @__PURE__ */ __name((base, sub, ...rest) => {
  if (rest.length) {
    sub = mergePath(sub, ...rest);
  }
  return `${base?.[0] === "/" ? "" : "/"}${base}${sub === "/" ? "" : `${base?.at(-1) === "/" ? "" : "/"}${sub?.[0] === "/" ? sub.slice(1) : sub}`}`;
}, "mergePath");
var checkOptionalParameter = /* @__PURE__ */ __name((path) => {
  if (path.charCodeAt(path.length - 1) !== 63 || !path.includes(":")) {
    return null;
  }
  const segments = path.split("/");
  const results = [];
  let basePath = "";
  segments.forEach((segment) => {
    if (segment !== "" && !/\:/.test(segment)) {
      basePath += "/" + segment;
    } else if (/\:/.test(segment)) {
      if (/\?/.test(segment)) {
        if (results.length === 0 && basePath === "") {
          results.push("/");
        } else {
          results.push(basePath);
        }
        const optionalSegment = segment.replace("?", "");
        basePath += "/" + optionalSegment;
        results.push(basePath);
      } else {
        basePath += "/" + segment;
      }
    }
  });
  return results.filter((v, i, a) => a.indexOf(v) === i);
}, "checkOptionalParameter");
var _decodeURI = /* @__PURE__ */ __name((value) => {
  if (!/[%+]/.test(value)) {
    return value;
  }
  if (value.indexOf("+") !== -1) {
    value = value.replace(/\+/g, " ");
  }
  return value.indexOf("%") !== -1 ? tryDecode(value, decodeURIComponent_) : value;
}, "_decodeURI");
var _getQueryParam = /* @__PURE__ */ __name((url, key, multiple) => {
  let encoded;
  if (!multiple && key && !/[%+]/.test(key)) {
    let keyIndex2 = url.indexOf("?", 8);
    if (keyIndex2 === -1) {
      return void 0;
    }
    if (!url.startsWith(key, keyIndex2 + 1)) {
      keyIndex2 = url.indexOf(`&${key}`, keyIndex2 + 1);
    }
    while (keyIndex2 !== -1) {
      const trailingKeyCode = url.charCodeAt(keyIndex2 + key.length + 1);
      if (trailingKeyCode === 61) {
        const valueIndex = keyIndex2 + key.length + 2;
        const endIndex = url.indexOf("&", valueIndex);
        return _decodeURI(url.slice(valueIndex, endIndex === -1 ? void 0 : endIndex));
      } else if (trailingKeyCode == 38 || isNaN(trailingKeyCode)) {
        return "";
      }
      keyIndex2 = url.indexOf(`&${key}`, keyIndex2 + 1);
    }
    encoded = /[%+]/.test(url);
    if (!encoded) {
      return void 0;
    }
  }
  const results = {};
  encoded ??= /[%+]/.test(url);
  let keyIndex = url.indexOf("?", 8);
  while (keyIndex !== -1) {
    const nextKeyIndex = url.indexOf("&", keyIndex + 1);
    let valueIndex = url.indexOf("=", keyIndex);
    if (valueIndex > nextKeyIndex && nextKeyIndex !== -1) {
      valueIndex = -1;
    }
    let name = url.slice(
      keyIndex + 1,
      valueIndex === -1 ? nextKeyIndex === -1 ? void 0 : nextKeyIndex : valueIndex
    );
    if (encoded) {
      name = _decodeURI(name);
    }
    keyIndex = nextKeyIndex;
    if (name === "") {
      continue;
    }
    let value;
    if (valueIndex === -1) {
      value = "";
    } else {
      value = url.slice(valueIndex + 1, nextKeyIndex === -1 ? void 0 : nextKeyIndex);
      if (encoded) {
        value = _decodeURI(value);
      }
    }
    if (multiple) {
      if (!(results[name] && Array.isArray(results[name]))) {
        results[name] = [];
      }
      ;
      results[name].push(value);
    } else {
      results[name] ??= value;
    }
  }
  return key ? results[key] : results;
}, "_getQueryParam");
var getQueryParam = _getQueryParam;
var getQueryParams = /* @__PURE__ */ __name((url, key) => {
  return _getQueryParam(url, key, true);
}, "getQueryParams");
var decodeURIComponent_ = decodeURIComponent;

// node_modules/hono/dist/request.js
var tryDecodeURIComponent = /* @__PURE__ */ __name((str) => tryDecode(str, decodeURIComponent_), "tryDecodeURIComponent");
var HonoRequest = class {
  static {
    __name(this, "HonoRequest");
  }
  raw;
  #validatedData;
  #matchResult;
  routeIndex = 0;
  path;
  bodyCache = {};
  constructor(request, path = "/", matchResult = [[]]) {
    this.raw = request;
    this.path = path;
    this.#matchResult = matchResult;
    this.#validatedData = {};
  }
  param(key) {
    return key ? this.#getDecodedParam(key) : this.#getAllDecodedParams();
  }
  #getDecodedParam(key) {
    const paramKey = this.#matchResult[0][this.routeIndex][1][key];
    const param = this.#getParamValue(paramKey);
    return param && /\%/.test(param) ? tryDecodeURIComponent(param) : param;
  }
  #getAllDecodedParams() {
    const decoded = {};
    const keys = Object.keys(this.#matchResult[0][this.routeIndex][1]);
    for (const key of keys) {
      const value = this.#getParamValue(this.#matchResult[0][this.routeIndex][1][key]);
      if (value !== void 0) {
        decoded[key] = /\%/.test(value) ? tryDecodeURIComponent(value) : value;
      }
    }
    return decoded;
  }
  #getParamValue(paramKey) {
    return this.#matchResult[1] ? this.#matchResult[1][paramKey] : paramKey;
  }
  query(key) {
    return getQueryParam(this.url, key);
  }
  queries(key) {
    return getQueryParams(this.url, key);
  }
  header(name) {
    if (name) {
      return this.raw.headers.get(name) ?? void 0;
    }
    const headerData = {};
    this.raw.headers.forEach((value, key) => {
      headerData[key] = value;
    });
    return headerData;
  }
  async parseBody(options) {
    return this.bodyCache.parsedBody ??= await parseBody(this, options);
  }
  #cachedBody = /* @__PURE__ */ __name((key) => {
    const { bodyCache, raw: raw2 } = this;
    const cachedBody = bodyCache[key];
    if (cachedBody) {
      return cachedBody;
    }
    const anyCachedKey = Object.keys(bodyCache)[0];
    if (anyCachedKey) {
      return bodyCache[anyCachedKey].then((body) => {
        if (anyCachedKey === "json") {
          body = JSON.stringify(body);
        }
        return new Response(body)[key]();
      });
    }
    return bodyCache[key] = raw2[key]();
  }, "#cachedBody");
  json() {
    return this.#cachedBody("text").then((text) => JSON.parse(text));
  }
  text() {
    return this.#cachedBody("text");
  }
  arrayBuffer() {
    return this.#cachedBody("arrayBuffer");
  }
  blob() {
    return this.#cachedBody("blob");
  }
  formData() {
    return this.#cachedBody("formData");
  }
  addValidatedData(target, data) {
    this.#validatedData[target] = data;
  }
  valid(target) {
    return this.#validatedData[target];
  }
  get url() {
    return this.raw.url;
  }
  get method() {
    return this.raw.method;
  }
  get [GET_MATCH_RESULT]() {
    return this.#matchResult;
  }
  get matchedRoutes() {
    return this.#matchResult[0].map(([[, route]]) => route);
  }
  get routePath() {
    return this.#matchResult[0].map(([[, route]]) => route)[this.routeIndex].path;
  }
};

// node_modules/hono/dist/utils/html.js
var HtmlEscapedCallbackPhase = {
  Stringify: 1,
  BeforeStream: 2,
  Stream: 3
};
var raw = /* @__PURE__ */ __name((value, callbacks) => {
  const escapedString = new String(value);
  escapedString.isEscaped = true;
  escapedString.callbacks = callbacks;
  return escapedString;
}, "raw");
var resolveCallback = /* @__PURE__ */ __name(async (str, phase, preserveCallbacks, context2, buffer) => {
  if (typeof str === "object" && !(str instanceof String)) {
    if (!(str instanceof Promise)) {
      str = str.toString();
    }
    if (str instanceof Promise) {
      str = await str;
    }
  }
  const callbacks = str.callbacks;
  if (!callbacks?.length) {
    return Promise.resolve(str);
  }
  if (buffer) {
    buffer[0] += str;
  } else {
    buffer = [str];
  }
  const resStr = Promise.all(callbacks.map((c) => c({ phase, buffer, context: context2 }))).then(
    (res) => Promise.all(
      res.filter(Boolean).map((str2) => resolveCallback(str2, phase, false, context2, buffer))
    ).then(() => buffer[0])
  );
  if (preserveCallbacks) {
    return raw(await resStr, callbacks);
  } else {
    return resStr;
  }
}, "resolveCallback");

// node_modules/hono/dist/context.js
var TEXT_PLAIN = "text/plain; charset=UTF-8";
var setDefaultContentType = /* @__PURE__ */ __name((contentType, headers) => {
  return {
    "Content-Type": contentType,
    ...headers
  };
}, "setDefaultContentType");
var Context = class {
  static {
    __name(this, "Context");
  }
  #rawRequest;
  #req;
  env = {};
  #var;
  finalized = false;
  error;
  #status;
  #executionCtx;
  #res;
  #layout;
  #renderer;
  #notFoundHandler;
  #preparedHeaders;
  #matchResult;
  #path;
  constructor(req, options) {
    this.#rawRequest = req;
    if (options) {
      this.#executionCtx = options.executionCtx;
      this.env = options.env;
      this.#notFoundHandler = options.notFoundHandler;
      this.#path = options.path;
      this.#matchResult = options.matchResult;
    }
  }
  get req() {
    this.#req ??= new HonoRequest(this.#rawRequest, this.#path, this.#matchResult);
    return this.#req;
  }
  get event() {
    if (this.#executionCtx && "respondWith" in this.#executionCtx) {
      return this.#executionCtx;
    } else {
      throw Error("This context has no FetchEvent");
    }
  }
  get executionCtx() {
    if (this.#executionCtx) {
      return this.#executionCtx;
    } else {
      throw Error("This context has no ExecutionContext");
    }
  }
  get res() {
    return this.#res ||= new Response(null, {
      headers: this.#preparedHeaders ??= new Headers()
    });
  }
  set res(_res) {
    if (this.#res && _res) {
      _res = new Response(_res.body, _res);
      for (const [k, v] of this.#res.headers.entries()) {
        if (k === "content-type") {
          continue;
        }
        if (k === "set-cookie") {
          const cookies = this.#res.headers.getSetCookie();
          _res.headers.delete("set-cookie");
          for (const cookie of cookies) {
            _res.headers.append("set-cookie", cookie);
          }
        } else {
          _res.headers.set(k, v);
        }
      }
    }
    this.#res = _res;
    this.finalized = true;
  }
  render = /* @__PURE__ */ __name((...args) => {
    this.#renderer ??= (content) => this.html(content);
    return this.#renderer(...args);
  }, "render");
  setLayout = /* @__PURE__ */ __name((layout) => this.#layout = layout, "setLayout");
  getLayout = /* @__PURE__ */ __name(() => this.#layout, "getLayout");
  setRenderer = /* @__PURE__ */ __name((renderer) => {
    this.#renderer = renderer;
  }, "setRenderer");
  header = /* @__PURE__ */ __name((name, value, options) => {
    if (this.finalized) {
      this.#res = new Response(this.#res.body, this.#res);
    }
    const headers = this.#res ? this.#res.headers : this.#preparedHeaders ??= new Headers();
    if (value === void 0) {
      headers.delete(name);
    } else if (options?.append) {
      headers.append(name, value);
    } else {
      headers.set(name, value);
    }
  }, "header");
  status = /* @__PURE__ */ __name((status) => {
    this.#status = status;
  }, "status");
  set = /* @__PURE__ */ __name((key, value) => {
    this.#var ??= /* @__PURE__ */ new Map();
    this.#var.set(key, value);
  }, "set");
  get = /* @__PURE__ */ __name((key) => {
    return this.#var ? this.#var.get(key) : void 0;
  }, "get");
  get var() {
    if (!this.#var) {
      return {};
    }
    return Object.fromEntries(this.#var);
  }
  #newResponse(data, arg, headers) {
    const responseHeaders = this.#res ? new Headers(this.#res.headers) : this.#preparedHeaders ?? new Headers();
    if (typeof arg === "object" && "headers" in arg) {
      const argHeaders = arg.headers instanceof Headers ? arg.headers : new Headers(arg.headers);
      for (const [key, value] of argHeaders) {
        if (key.toLowerCase() === "set-cookie") {
          responseHeaders.append(key, value);
        } else {
          responseHeaders.set(key, value);
        }
      }
    }
    if (headers) {
      for (const [k, v] of Object.entries(headers)) {
        if (typeof v === "string") {
          responseHeaders.set(k, v);
        } else {
          responseHeaders.delete(k);
          for (const v2 of v) {
            responseHeaders.append(k, v2);
          }
        }
      }
    }
    const status = typeof arg === "number" ? arg : arg?.status ?? this.#status;
    return new Response(data, { status, headers: responseHeaders });
  }
  newResponse = /* @__PURE__ */ __name((...args) => this.#newResponse(...args), "newResponse");
  body = /* @__PURE__ */ __name((data, arg, headers) => this.#newResponse(data, arg, headers), "body");
  text = /* @__PURE__ */ __name((text, arg, headers) => {
    return !this.#preparedHeaders && !this.#status && !arg && !headers && !this.finalized ? new Response(text) : this.#newResponse(
      text,
      arg,
      setDefaultContentType(TEXT_PLAIN, headers)
    );
  }, "text");
  json = /* @__PURE__ */ __name((object, arg, headers) => {
    return this.#newResponse(
      JSON.stringify(object),
      arg,
      setDefaultContentType("application/json", headers)
    );
  }, "json");
  html = /* @__PURE__ */ __name((html, arg, headers) => {
    const res = /* @__PURE__ */ __name((html2) => this.#newResponse(html2, arg, setDefaultContentType("text/html; charset=UTF-8", headers)), "res");
    return typeof html === "object" ? resolveCallback(html, HtmlEscapedCallbackPhase.Stringify, false, {}).then(res) : res(html);
  }, "html");
  redirect = /* @__PURE__ */ __name((location, status) => {
    const locationString = String(location);
    this.header(
      "Location",
      !/[^\x00-\xFF]/.test(locationString) ? locationString : encodeURI(locationString)
    );
    return this.newResponse(null, status ?? 302);
  }, "redirect");
  notFound = /* @__PURE__ */ __name(() => {
    this.#notFoundHandler ??= () => new Response();
    return this.#notFoundHandler(this);
  }, "notFound");
};

// node_modules/hono/dist/router.js
var METHOD_NAME_ALL = "ALL";
var METHOD_NAME_ALL_LOWERCASE = "all";
var METHODS = ["get", "post", "put", "delete", "options", "patch"];
var MESSAGE_MATCHER_IS_ALREADY_BUILT = "Can not add a route since the matcher is already built.";
var UnsupportedPathError = class extends Error {
  static {
    __name(this, "UnsupportedPathError");
  }
};

// node_modules/hono/dist/utils/constants.js
var COMPOSED_HANDLER = "__COMPOSED_HANDLER";

// node_modules/hono/dist/hono-base.js
var notFoundHandler = /* @__PURE__ */ __name((c) => {
  return c.text("404 Not Found", 404);
}, "notFoundHandler");
var errorHandler = /* @__PURE__ */ __name((err, c) => {
  if ("getResponse" in err) {
    const res = err.getResponse();
    return c.newResponse(res.body, res);
  }
  console.error(err);
  return c.text("Internal Server Error", 500);
}, "errorHandler");
var Hono = class {
  static {
    __name(this, "Hono");
  }
  get;
  post;
  put;
  delete;
  options;
  patch;
  all;
  on;
  use;
  router;
  getPath;
  _basePath = "/";
  #path = "/";
  routes = [];
  constructor(options = {}) {
    const allMethods = [...METHODS, METHOD_NAME_ALL_LOWERCASE];
    allMethods.forEach((method) => {
      this[method] = (args1, ...args) => {
        if (typeof args1 === "string") {
          this.#path = args1;
        } else {
          this.#addRoute(method, this.#path, args1);
        }
        args.forEach((handler) => {
          this.#addRoute(method, this.#path, handler);
        });
        return this;
      };
    });
    this.on = (method, path, ...handlers) => {
      for (const p of [path].flat()) {
        this.#path = p;
        for (const m of [method].flat()) {
          handlers.map((handler) => {
            this.#addRoute(m.toUpperCase(), this.#path, handler);
          });
        }
      }
      return this;
    };
    this.use = (arg1, ...handlers) => {
      if (typeof arg1 === "string") {
        this.#path = arg1;
      } else {
        this.#path = "*";
        handlers.unshift(arg1);
      }
      handlers.forEach((handler) => {
        this.#addRoute(METHOD_NAME_ALL, this.#path, handler);
      });
      return this;
    };
    const { strict, ...optionsWithoutStrict } = options;
    Object.assign(this, optionsWithoutStrict);
    this.getPath = strict ?? true ? options.getPath ?? getPath : getPathNoStrict;
  }
  #clone() {
    const clone = new Hono({
      router: this.router,
      getPath: this.getPath
    });
    clone.errorHandler = this.errorHandler;
    clone.#notFoundHandler = this.#notFoundHandler;
    clone.routes = this.routes;
    return clone;
  }
  #notFoundHandler = notFoundHandler;
  errorHandler = errorHandler;
  route(path, app4) {
    const subApp = this.basePath(path);
    app4.routes.map((r) => {
      let handler;
      if (app4.errorHandler === errorHandler) {
        handler = r.handler;
      } else {
        handler = /* @__PURE__ */ __name(async (c, next) => (await compose([], app4.errorHandler)(c, () => r.handler(c, next))).res, "handler");
        handler[COMPOSED_HANDLER] = r.handler;
      }
      subApp.#addRoute(r.method, r.path, handler);
    });
    return this;
  }
  basePath(path) {
    const subApp = this.#clone();
    subApp._basePath = mergePath(this._basePath, path);
    return subApp;
  }
  onError = /* @__PURE__ */ __name((handler) => {
    this.errorHandler = handler;
    return this;
  }, "onError");
  notFound = /* @__PURE__ */ __name((handler) => {
    this.#notFoundHandler = handler;
    return this;
  }, "notFound");
  mount(path, applicationHandler, options) {
    let replaceRequest;
    let optionHandler;
    if (options) {
      if (typeof options === "function") {
        optionHandler = options;
      } else {
        optionHandler = options.optionHandler;
        if (options.replaceRequest === false) {
          replaceRequest = /* @__PURE__ */ __name((request) => request, "replaceRequest");
        } else {
          replaceRequest = options.replaceRequest;
        }
      }
    }
    const getOptions = optionHandler ? (c) => {
      const options2 = optionHandler(c);
      return Array.isArray(options2) ? options2 : [options2];
    } : (c) => {
      let executionContext = void 0;
      try {
        executionContext = c.executionCtx;
      } catch {
      }
      return [c.env, executionContext];
    };
    replaceRequest ||= (() => {
      const mergedPath = mergePath(this._basePath, path);
      const pathPrefixLength = mergedPath === "/" ? 0 : mergedPath.length;
      return (request) => {
        const url = new URL(request.url);
        url.pathname = url.pathname.slice(pathPrefixLength) || "/";
        return new Request(url, request);
      };
    })();
    const handler = /* @__PURE__ */ __name(async (c, next) => {
      const res = await applicationHandler(replaceRequest(c.req.raw), ...getOptions(c));
      if (res) {
        return res;
      }
      await next();
    }, "handler");
    this.#addRoute(METHOD_NAME_ALL, mergePath(path, "*"), handler);
    return this;
  }
  #addRoute(method, path, handler) {
    method = method.toUpperCase();
    path = mergePath(this._basePath, path);
    const r = { basePath: this._basePath, path, method, handler };
    this.router.add(method, path, [handler, r]);
    this.routes.push(r);
  }
  #handleError(err, c) {
    if (err instanceof Error) {
      return this.errorHandler(err, c);
    }
    throw err;
  }
  #dispatch(request, executionCtx, env2, method) {
    if (method === "HEAD") {
      return (async () => new Response(null, await this.#dispatch(request, executionCtx, env2, "GET")))();
    }
    const path = this.getPath(request, { env: env2 });
    const matchResult = this.router.match(method, path);
    const c = new Context(request, {
      path,
      matchResult,
      env: env2,
      executionCtx,
      notFoundHandler: this.#notFoundHandler
    });
    if (matchResult[0].length === 1) {
      let res;
      try {
        res = matchResult[0][0][0][0](c, async () => {
          c.res = await this.#notFoundHandler(c);
        });
      } catch (err) {
        return this.#handleError(err, c);
      }
      return res instanceof Promise ? res.then(
        (resolved) => resolved || (c.finalized ? c.res : this.#notFoundHandler(c))
      ).catch((err) => this.#handleError(err, c)) : res ?? this.#notFoundHandler(c);
    }
    const composed = compose(matchResult[0], this.errorHandler, this.#notFoundHandler);
    return (async () => {
      try {
        const context2 = await composed(c);
        if (!context2.finalized) {
          throw new Error(
            "Context is not finalized. Did you forget to return a Response object or `await next()`?"
          );
        }
        return context2.res;
      } catch (err) {
        return this.#handleError(err, c);
      }
    })();
  }
  fetch = /* @__PURE__ */ __name((request, ...rest) => {
    return this.#dispatch(request, rest[1], rest[0], request.method);
  }, "fetch");
  request = /* @__PURE__ */ __name((input, requestInit, Env, executionCtx) => {
    if (input instanceof Request) {
      return this.fetch(requestInit ? new Request(input, requestInit) : input, Env, executionCtx);
    }
    input = input.toString();
    return this.fetch(
      new Request(
        /^https?:\/\//.test(input) ? input : `http://localhost${mergePath("/", input)}`,
        requestInit
      ),
      Env,
      executionCtx
    );
  }, "request");
  fire = /* @__PURE__ */ __name(() => {
    addEventListener("fetch", (event) => {
      event.respondWith(this.#dispatch(event.request, event, void 0, event.request.method));
    });
  }, "fire");
};

// node_modules/hono/dist/router/reg-exp-router/matcher.js
var emptyParam = [];
function match(method, path) {
  const matchers = this.buildAllMatchers();
  const match2 = /* @__PURE__ */ __name((method2, path2) => {
    const matcher = matchers[method2] || matchers[METHOD_NAME_ALL];
    const staticMatch = matcher[2][path2];
    if (staticMatch) {
      return staticMatch;
    }
    const match3 = path2.match(matcher[0]);
    if (!match3) {
      return [[], emptyParam];
    }
    const index = match3.indexOf("", 1);
    return [matcher[1][index], match3];
  }, "match2");
  this.match = match2;
  return match2(method, path);
}
__name(match, "match");

// node_modules/hono/dist/router/reg-exp-router/node.js
var LABEL_REG_EXP_STR = "[^/]+";
var ONLY_WILDCARD_REG_EXP_STR = ".*";
var TAIL_WILDCARD_REG_EXP_STR = "(?:|/.*)";
var PATH_ERROR = Symbol();
var regExpMetaChars = new Set(".\\+*[^]$()");
function compareKey(a, b) {
  if (a.length === 1) {
    return b.length === 1 ? a < b ? -1 : 1 : -1;
  }
  if (b.length === 1) {
    return 1;
  }
  if (a === ONLY_WILDCARD_REG_EXP_STR || a === TAIL_WILDCARD_REG_EXP_STR) {
    return 1;
  } else if (b === ONLY_WILDCARD_REG_EXP_STR || b === TAIL_WILDCARD_REG_EXP_STR) {
    return -1;
  }
  if (a === LABEL_REG_EXP_STR) {
    return 1;
  } else if (b === LABEL_REG_EXP_STR) {
    return -1;
  }
  return a.length === b.length ? a < b ? -1 : 1 : b.length - a.length;
}
__name(compareKey, "compareKey");
var Node = class {
  static {
    __name(this, "Node");
  }
  #index;
  #varIndex;
  #children = /* @__PURE__ */ Object.create(null);
  insert(tokens, index, paramMap, context2, pathErrorCheckOnly) {
    if (tokens.length === 0) {
      if (this.#index !== void 0) {
        throw PATH_ERROR;
      }
      if (pathErrorCheckOnly) {
        return;
      }
      this.#index = index;
      return;
    }
    const [token, ...restTokens] = tokens;
    const pattern = token === "*" ? restTokens.length === 0 ? ["", "", ONLY_WILDCARD_REG_EXP_STR] : ["", "", LABEL_REG_EXP_STR] : token === "/*" ? ["", "", TAIL_WILDCARD_REG_EXP_STR] : token.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
    let node;
    if (pattern) {
      const name = pattern[1];
      let regexpStr = pattern[2] || LABEL_REG_EXP_STR;
      if (name && pattern[2]) {
        if (regexpStr === ".*") {
          throw PATH_ERROR;
        }
        regexpStr = regexpStr.replace(/^\((?!\?:)(?=[^)]+\)$)/, "(?:");
        if (/\((?!\?:)/.test(regexpStr)) {
          throw PATH_ERROR;
        }
      }
      node = this.#children[regexpStr];
      if (!node) {
        if (Object.keys(this.#children).some(
          (k) => k !== ONLY_WILDCARD_REG_EXP_STR && k !== TAIL_WILDCARD_REG_EXP_STR
        )) {
          throw PATH_ERROR;
        }
        if (pathErrorCheckOnly) {
          return;
        }
        node = this.#children[regexpStr] = new Node();
        if (name !== "") {
          node.#varIndex = context2.varIndex++;
        }
      }
      if (!pathErrorCheckOnly && name !== "") {
        paramMap.push([name, node.#varIndex]);
      }
    } else {
      node = this.#children[token];
      if (!node) {
        if (Object.keys(this.#children).some(
          (k) => k.length > 1 && k !== ONLY_WILDCARD_REG_EXP_STR && k !== TAIL_WILDCARD_REG_EXP_STR
        )) {
          throw PATH_ERROR;
        }
        if (pathErrorCheckOnly) {
          return;
        }
        node = this.#children[token] = new Node();
      }
    }
    node.insert(restTokens, index, paramMap, context2, pathErrorCheckOnly);
  }
  buildRegExpStr() {
    const childKeys = Object.keys(this.#children).sort(compareKey);
    const strList = childKeys.map((k) => {
      const c = this.#children[k];
      return (typeof c.#varIndex === "number" ? `(${k})@${c.#varIndex}` : regExpMetaChars.has(k) ? `\\${k}` : k) + c.buildRegExpStr();
    });
    if (typeof this.#index === "number") {
      strList.unshift(`#${this.#index}`);
    }
    if (strList.length === 0) {
      return "";
    }
    if (strList.length === 1) {
      return strList[0];
    }
    return "(?:" + strList.join("|") + ")";
  }
};

// node_modules/hono/dist/router/reg-exp-router/trie.js
var Trie = class {
  static {
    __name(this, "Trie");
  }
  #context = { varIndex: 0 };
  #root = new Node();
  insert(path, index, pathErrorCheckOnly) {
    const paramAssoc = [];
    const groups = [];
    for (let i = 0; ; ) {
      let replaced = false;
      path = path.replace(/\{[^}]+\}/g, (m) => {
        const mark = `@\\${i}`;
        groups[i] = [mark, m];
        i++;
        replaced = true;
        return mark;
      });
      if (!replaced) {
        break;
      }
    }
    const tokens = path.match(/(?::[^\/]+)|(?:\/\*$)|./g) || [];
    for (let i = groups.length - 1; i >= 0; i--) {
      const [mark] = groups[i];
      for (let j = tokens.length - 1; j >= 0; j--) {
        if (tokens[j].indexOf(mark) !== -1) {
          tokens[j] = tokens[j].replace(mark, groups[i][1]);
          break;
        }
      }
    }
    this.#root.insert(tokens, index, paramAssoc, this.#context, pathErrorCheckOnly);
    return paramAssoc;
  }
  buildRegExp() {
    let regexp = this.#root.buildRegExpStr();
    if (regexp === "") {
      return [/^$/, [], []];
    }
    let captureIndex = 0;
    const indexReplacementMap = [];
    const paramReplacementMap = [];
    regexp = regexp.replace(/#(\d+)|@(\d+)|\.\*\$/g, (_, handlerIndex, paramIndex) => {
      if (handlerIndex !== void 0) {
        indexReplacementMap[++captureIndex] = Number(handlerIndex);
        return "$()";
      }
      if (paramIndex !== void 0) {
        paramReplacementMap[Number(paramIndex)] = ++captureIndex;
        return "";
      }
      return "";
    });
    return [new RegExp(`^${regexp}`), indexReplacementMap, paramReplacementMap];
  }
};

// node_modules/hono/dist/router/reg-exp-router/router.js
var nullMatcher = [/^$/, [], /* @__PURE__ */ Object.create(null)];
var wildcardRegExpCache = /* @__PURE__ */ Object.create(null);
function buildWildcardRegExp(path) {
  return wildcardRegExpCache[path] ??= new RegExp(
    path === "*" ? "" : `^${path.replace(
      /\/\*$|([.\\+*[^\]$()])/g,
      (_, metaChar) => metaChar ? `\\${metaChar}` : "(?:|/.*)"
    )}$`
  );
}
__name(buildWildcardRegExp, "buildWildcardRegExp");
function clearWildcardRegExpCache() {
  wildcardRegExpCache = /* @__PURE__ */ Object.create(null);
}
__name(clearWildcardRegExpCache, "clearWildcardRegExpCache");
function buildMatcherFromPreprocessedRoutes(routes) {
  const trie = new Trie();
  const handlerData = [];
  if (routes.length === 0) {
    return nullMatcher;
  }
  const routesWithStaticPathFlag = routes.map(
    (route) => [!/\*|\/:/.test(route[0]), ...route]
  ).sort(
    ([isStaticA, pathA], [isStaticB, pathB]) => isStaticA ? 1 : isStaticB ? -1 : pathA.length - pathB.length
  );
  const staticMap = /* @__PURE__ */ Object.create(null);
  for (let i = 0, j = -1, len = routesWithStaticPathFlag.length; i < len; i++) {
    const [pathErrorCheckOnly, path, handlers] = routesWithStaticPathFlag[i];
    if (pathErrorCheckOnly) {
      staticMap[path] = [handlers.map(([h]) => [h, /* @__PURE__ */ Object.create(null)]), emptyParam];
    } else {
      j++;
    }
    let paramAssoc;
    try {
      paramAssoc = trie.insert(path, j, pathErrorCheckOnly);
    } catch (e) {
      throw e === PATH_ERROR ? new UnsupportedPathError(path) : e;
    }
    if (pathErrorCheckOnly) {
      continue;
    }
    handlerData[j] = handlers.map(([h, paramCount]) => {
      const paramIndexMap = /* @__PURE__ */ Object.create(null);
      paramCount -= 1;
      for (; paramCount >= 0; paramCount--) {
        const [key, value] = paramAssoc[paramCount];
        paramIndexMap[key] = value;
      }
      return [h, paramIndexMap];
    });
  }
  const [regexp, indexReplacementMap, paramReplacementMap] = trie.buildRegExp();
  for (let i = 0, len = handlerData.length; i < len; i++) {
    for (let j = 0, len2 = handlerData[i].length; j < len2; j++) {
      const map = handlerData[i][j]?.[1];
      if (!map) {
        continue;
      }
      const keys = Object.keys(map);
      for (let k = 0, len3 = keys.length; k < len3; k++) {
        map[keys[k]] = paramReplacementMap[map[keys[k]]];
      }
    }
  }
  const handlerMap = [];
  for (const i in indexReplacementMap) {
    handlerMap[i] = handlerData[indexReplacementMap[i]];
  }
  return [regexp, handlerMap, staticMap];
}
__name(buildMatcherFromPreprocessedRoutes, "buildMatcherFromPreprocessedRoutes");
function findMiddleware(middleware, path) {
  if (!middleware) {
    return void 0;
  }
  for (const k of Object.keys(middleware).sort((a, b) => b.length - a.length)) {
    if (buildWildcardRegExp(k).test(path)) {
      return [...middleware[k]];
    }
  }
  return void 0;
}
__name(findMiddleware, "findMiddleware");
var RegExpRouter = class {
  static {
    __name(this, "RegExpRouter");
  }
  name = "RegExpRouter";
  #middleware;
  #routes;
  constructor() {
    this.#middleware = { [METHOD_NAME_ALL]: /* @__PURE__ */ Object.create(null) };
    this.#routes = { [METHOD_NAME_ALL]: /* @__PURE__ */ Object.create(null) };
  }
  add(method, path, handler) {
    const middleware = this.#middleware;
    const routes = this.#routes;
    if (!middleware || !routes) {
      throw new Error(MESSAGE_MATCHER_IS_ALREADY_BUILT);
    }
    if (!middleware[method]) {
      ;
      [middleware, routes].forEach((handlerMap) => {
        handlerMap[method] = /* @__PURE__ */ Object.create(null);
        Object.keys(handlerMap[METHOD_NAME_ALL]).forEach((p) => {
          handlerMap[method][p] = [...handlerMap[METHOD_NAME_ALL][p]];
        });
      });
    }
    if (path === "/*") {
      path = "*";
    }
    const paramCount = (path.match(/\/:/g) || []).length;
    if (/\*$/.test(path)) {
      const re = buildWildcardRegExp(path);
      if (method === METHOD_NAME_ALL) {
        Object.keys(middleware).forEach((m) => {
          middleware[m][path] ||= findMiddleware(middleware[m], path) || findMiddleware(middleware[METHOD_NAME_ALL], path) || [];
        });
      } else {
        middleware[method][path] ||= findMiddleware(middleware[method], path) || findMiddleware(middleware[METHOD_NAME_ALL], path) || [];
      }
      Object.keys(middleware).forEach((m) => {
        if (method === METHOD_NAME_ALL || method === m) {
          Object.keys(middleware[m]).forEach((p) => {
            re.test(p) && middleware[m][p].push([handler, paramCount]);
          });
        }
      });
      Object.keys(routes).forEach((m) => {
        if (method === METHOD_NAME_ALL || method === m) {
          Object.keys(routes[m]).forEach(
            (p) => re.test(p) && routes[m][p].push([handler, paramCount])
          );
        }
      });
      return;
    }
    const paths = checkOptionalParameter(path) || [path];
    for (let i = 0, len = paths.length; i < len; i++) {
      const path2 = paths[i];
      Object.keys(routes).forEach((m) => {
        if (method === METHOD_NAME_ALL || method === m) {
          routes[m][path2] ||= [
            ...findMiddleware(middleware[m], path2) || findMiddleware(middleware[METHOD_NAME_ALL], path2) || []
          ];
          routes[m][path2].push([handler, paramCount - len + i + 1]);
        }
      });
    }
  }
  match = match;
  buildAllMatchers() {
    const matchers = /* @__PURE__ */ Object.create(null);
    Object.keys(this.#routes).concat(Object.keys(this.#middleware)).forEach((method) => {
      matchers[method] ||= this.#buildMatcher(method);
    });
    this.#middleware = this.#routes = void 0;
    clearWildcardRegExpCache();
    return matchers;
  }
  #buildMatcher(method) {
    const routes = [];
    let hasOwnRoute = method === METHOD_NAME_ALL;
    [this.#middleware, this.#routes].forEach((r) => {
      const ownRoute = r[method] ? Object.keys(r[method]).map((path) => [path, r[method][path]]) : [];
      if (ownRoute.length !== 0) {
        hasOwnRoute ||= true;
        routes.push(...ownRoute);
      } else if (method !== METHOD_NAME_ALL) {
        routes.push(
          ...Object.keys(r[METHOD_NAME_ALL]).map((path) => [path, r[METHOD_NAME_ALL][path]])
        );
      }
    });
    if (!hasOwnRoute) {
      return null;
    } else {
      return buildMatcherFromPreprocessedRoutes(routes);
    }
  }
};

// node_modules/hono/dist/router/smart-router/router.js
var SmartRouter = class {
  static {
    __name(this, "SmartRouter");
  }
  name = "SmartRouter";
  #routers = [];
  #routes = [];
  constructor(init) {
    this.#routers = init.routers;
  }
  add(method, path, handler) {
    if (!this.#routes) {
      throw new Error(MESSAGE_MATCHER_IS_ALREADY_BUILT);
    }
    this.#routes.push([method, path, handler]);
  }
  match(method, path) {
    if (!this.#routes) {
      throw new Error("Fatal error");
    }
    const routers = this.#routers;
    const routes = this.#routes;
    const len = routers.length;
    let i = 0;
    let res;
    for (; i < len; i++) {
      const router = routers[i];
      try {
        for (let i2 = 0, len2 = routes.length; i2 < len2; i2++) {
          router.add(...routes[i2]);
        }
        res = router.match(method, path);
      } catch (e) {
        if (e instanceof UnsupportedPathError) {
          continue;
        }
        throw e;
      }
      this.match = router.match.bind(router);
      this.#routers = [router];
      this.#routes = void 0;
      break;
    }
    if (i === len) {
      throw new Error("Fatal error");
    }
    this.name = `SmartRouter + ${this.activeRouter.name}`;
    return res;
  }
  get activeRouter() {
    if (this.#routes || this.#routers.length !== 1) {
      throw new Error("No active router has been determined yet.");
    }
    return this.#routers[0];
  }
};

// node_modules/hono/dist/router/trie-router/node.js
var emptyParams = /* @__PURE__ */ Object.create(null);
var Node2 = class {
  static {
    __name(this, "Node");
  }
  #methods;
  #children;
  #patterns;
  #order = 0;
  #params = emptyParams;
  constructor(method, handler, children) {
    this.#children = children || /* @__PURE__ */ Object.create(null);
    this.#methods = [];
    if (method && handler) {
      const m = /* @__PURE__ */ Object.create(null);
      m[method] = { handler, possibleKeys: [], score: 0 };
      this.#methods = [m];
    }
    this.#patterns = [];
  }
  insert(method, path, handler) {
    this.#order = ++this.#order;
    let curNode = this;
    const parts = splitRoutingPath(path);
    const possibleKeys = [];
    for (let i = 0, len = parts.length; i < len; i++) {
      const p = parts[i];
      const nextP = parts[i + 1];
      const pattern = getPattern(p, nextP);
      const key = Array.isArray(pattern) ? pattern[0] : p;
      if (key in curNode.#children) {
        curNode = curNode.#children[key];
        if (pattern) {
          possibleKeys.push(pattern[1]);
        }
        continue;
      }
      curNode.#children[key] = new Node2();
      if (pattern) {
        curNode.#patterns.push(pattern);
        possibleKeys.push(pattern[1]);
      }
      curNode = curNode.#children[key];
    }
    curNode.#methods.push({
      [method]: {
        handler,
        possibleKeys: possibleKeys.filter((v, i, a) => a.indexOf(v) === i),
        score: this.#order
      }
    });
    return curNode;
  }
  #getHandlerSets(node, method, nodeParams, params) {
    const handlerSets = [];
    for (let i = 0, len = node.#methods.length; i < len; i++) {
      const m = node.#methods[i];
      const handlerSet = m[method] || m[METHOD_NAME_ALL];
      const processedSet = {};
      if (handlerSet !== void 0) {
        handlerSet.params = /* @__PURE__ */ Object.create(null);
        handlerSets.push(handlerSet);
        if (nodeParams !== emptyParams || params && params !== emptyParams) {
          for (let i2 = 0, len2 = handlerSet.possibleKeys.length; i2 < len2; i2++) {
            const key = handlerSet.possibleKeys[i2];
            const processed = processedSet[handlerSet.score];
            handlerSet.params[key] = params?.[key] && !processed ? params[key] : nodeParams[key] ?? params?.[key];
            processedSet[handlerSet.score] = true;
          }
        }
      }
    }
    return handlerSets;
  }
  search(method, path) {
    const handlerSets = [];
    this.#params = emptyParams;
    const curNode = this;
    let curNodes = [curNode];
    const parts = splitPath(path);
    const curNodesQueue = [];
    for (let i = 0, len = parts.length; i < len; i++) {
      const part = parts[i];
      const isLast = i === len - 1;
      const tempNodes = [];
      for (let j = 0, len2 = curNodes.length; j < len2; j++) {
        const node = curNodes[j];
        const nextNode = node.#children[part];
        if (nextNode) {
          nextNode.#params = node.#params;
          if (isLast) {
            if (nextNode.#children["*"]) {
              handlerSets.push(
                ...this.#getHandlerSets(nextNode.#children["*"], method, node.#params)
              );
            }
            handlerSets.push(...this.#getHandlerSets(nextNode, method, node.#params));
          } else {
            tempNodes.push(nextNode);
          }
        }
        for (let k = 0, len3 = node.#patterns.length; k < len3; k++) {
          const pattern = node.#patterns[k];
          const params = node.#params === emptyParams ? {} : { ...node.#params };
          if (pattern === "*") {
            const astNode = node.#children["*"];
            if (astNode) {
              handlerSets.push(...this.#getHandlerSets(astNode, method, node.#params));
              astNode.#params = params;
              tempNodes.push(astNode);
            }
            continue;
          }
          const [key, name, matcher] = pattern;
          if (!part && !(matcher instanceof RegExp)) {
            continue;
          }
          const child = node.#children[key];
          const restPathString = parts.slice(i).join("/");
          if (matcher instanceof RegExp) {
            const m = matcher.exec(restPathString);
            if (m) {
              params[name] = m[0];
              handlerSets.push(...this.#getHandlerSets(child, method, node.#params, params));
              if (Object.keys(child.#children).length) {
                child.#params = params;
                const componentCount = m[0].match(/\//)?.length ?? 0;
                const targetCurNodes = curNodesQueue[componentCount] ||= [];
                targetCurNodes.push(child);
              }
              continue;
            }
          }
          if (matcher === true || matcher.test(part)) {
            params[name] = part;
            if (isLast) {
              handlerSets.push(...this.#getHandlerSets(child, method, params, node.#params));
              if (child.#children["*"]) {
                handlerSets.push(
                  ...this.#getHandlerSets(child.#children["*"], method, params, node.#params)
                );
              }
            } else {
              child.#params = params;
              tempNodes.push(child);
            }
          }
        }
      }
      curNodes = tempNodes.concat(curNodesQueue.shift() ?? []);
    }
    if (handlerSets.length > 1) {
      handlerSets.sort((a, b) => {
        return a.score - b.score;
      });
    }
    return [handlerSets.map(({ handler, params }) => [handler, params])];
  }
};

// node_modules/hono/dist/router/trie-router/router.js
var TrieRouter = class {
  static {
    __name(this, "TrieRouter");
  }
  name = "TrieRouter";
  #node;
  constructor() {
    this.#node = new Node2();
  }
  add(method, path, handler) {
    const results = checkOptionalParameter(path);
    if (results) {
      for (let i = 0, len = results.length; i < len; i++) {
        this.#node.insert(method, results[i], handler);
      }
      return;
    }
    this.#node.insert(method, path, handler);
  }
  match(method, path) {
    return this.#node.search(method, path);
  }
};

// node_modules/hono/dist/hono.js
var Hono2 = class extends Hono {
  static {
    __name(this, "Hono");
  }
  constructor(options = {}) {
    super(options);
    this.router = options.router ?? new SmartRouter({
      routers: [new RegExpRouter(), new TrieRouter()]
    });
  }
};

// node_modules/hono/dist/middleware/cors/index.js
var cors = /* @__PURE__ */ __name((options) => {
  const defaults = {
    origin: "*",
    allowMethods: ["GET", "HEAD", "PUT", "POST", "DELETE", "PATCH"],
    allowHeaders: [],
    exposeHeaders: []
  };
  const opts = {
    ...defaults,
    ...options
  };
  const findAllowOrigin = ((optsOrigin) => {
    if (typeof optsOrigin === "string") {
      if (optsOrigin === "*") {
        return () => optsOrigin;
      } else {
        return (origin) => optsOrigin === origin ? origin : null;
      }
    } else if (typeof optsOrigin === "function") {
      return optsOrigin;
    } else {
      return (origin) => optsOrigin.includes(origin) ? origin : null;
    }
  })(opts.origin);
  const findAllowMethods = ((optsAllowMethods) => {
    if (typeof optsAllowMethods === "function") {
      return optsAllowMethods;
    } else if (Array.isArray(optsAllowMethods)) {
      return () => optsAllowMethods;
    } else {
      return () => [];
    }
  })(opts.allowMethods);
  return /* @__PURE__ */ __name(async function cors2(c, next) {
    function set(key, value) {
      c.res.headers.set(key, value);
    }
    __name(set, "set");
    const allowOrigin = await findAllowOrigin(c.req.header("origin") || "", c);
    if (allowOrigin) {
      set("Access-Control-Allow-Origin", allowOrigin);
    }
    if (opts.credentials) {
      set("Access-Control-Allow-Credentials", "true");
    }
    if (opts.exposeHeaders?.length) {
      set("Access-Control-Expose-Headers", opts.exposeHeaders.join(","));
    }
    if (c.req.method === "OPTIONS") {
      if (opts.origin !== "*") {
        set("Vary", "Origin");
      }
      if (opts.maxAge != null) {
        set("Access-Control-Max-Age", opts.maxAge.toString());
      }
      const allowMethods = await findAllowMethods(c.req.header("origin") || "", c);
      if (allowMethods.length) {
        set("Access-Control-Allow-Methods", allowMethods.join(","));
      }
      let headers = opts.allowHeaders;
      if (!headers?.length) {
        const requestHeaders = c.req.header("Access-Control-Request-Headers");
        if (requestHeaders) {
          headers = requestHeaders.split(/\s*,\s*/);
        }
      }
      if (headers?.length) {
        set("Access-Control-Allow-Headers", headers.join(","));
        c.res.headers.append("Vary", "Access-Control-Request-Headers");
      }
      c.res.headers.delete("Content-Length");
      c.res.headers.delete("Content-Type");
      return new Response(null, {
        headers: c.res.headers,
        status: 204,
        statusText: "No Content"
      });
    }
    await next();
    if (opts.origin !== "*") {
      c.header("Vary", "Origin", { append: true });
    }
  }, "cors2");
}, "cors");

// node_modules/jose/dist/browser/runtime/webcrypto.js
var webcrypto_default = crypto;
var isCryptoKey = /* @__PURE__ */ __name((key) => key instanceof CryptoKey, "isCryptoKey");

// node_modules/jose/dist/browser/lib/buffer_utils.js
var encoder = new TextEncoder();
var decoder = new TextDecoder();
var MAX_INT32 = 2 ** 32;
function concat(...buffers) {
  const size = buffers.reduce((acc, { length }) => acc + length, 0);
  const buf = new Uint8Array(size);
  let i = 0;
  for (const buffer of buffers) {
    buf.set(buffer, i);
    i += buffer.length;
  }
  return buf;
}
__name(concat, "concat");

// node_modules/jose/dist/browser/runtime/base64url.js
var encodeBase64 = /* @__PURE__ */ __name((input) => {
  let unencoded = input;
  if (typeof unencoded === "string") {
    unencoded = encoder.encode(unencoded);
  }
  const CHUNK_SIZE = 32768;
  const arr = [];
  for (let i = 0; i < unencoded.length; i += CHUNK_SIZE) {
    arr.push(String.fromCharCode.apply(null, unencoded.subarray(i, i + CHUNK_SIZE)));
  }
  return btoa(arr.join(""));
}, "encodeBase64");
var encode = /* @__PURE__ */ __name((input) => {
  return encodeBase64(input).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}, "encode");
var decodeBase64 = /* @__PURE__ */ __name((encoded) => {
  const binary = atob(encoded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}, "decodeBase64");
var decode = /* @__PURE__ */ __name((input) => {
  let encoded = input;
  if (encoded instanceof Uint8Array) {
    encoded = decoder.decode(encoded);
  }
  encoded = encoded.replace(/-/g, "+").replace(/_/g, "/").replace(/\s/g, "");
  try {
    return decodeBase64(encoded);
  } catch {
    throw new TypeError("The input to be decoded is not correctly encoded.");
  }
}, "decode");

// node_modules/jose/dist/browser/util/errors.js
var JOSEError = class extends Error {
  static {
    __name(this, "JOSEError");
  }
  constructor(message2, options) {
    super(message2, options);
    this.code = "ERR_JOSE_GENERIC";
    this.name = this.constructor.name;
    Error.captureStackTrace?.(this, this.constructor);
  }
};
JOSEError.code = "ERR_JOSE_GENERIC";
var JWTClaimValidationFailed = class extends JOSEError {
  static {
    __name(this, "JWTClaimValidationFailed");
  }
  constructor(message2, payload, claim = "unspecified", reason = "unspecified") {
    super(message2, { cause: { claim, reason, payload } });
    this.code = "ERR_JWT_CLAIM_VALIDATION_FAILED";
    this.claim = claim;
    this.reason = reason;
    this.payload = payload;
  }
};
JWTClaimValidationFailed.code = "ERR_JWT_CLAIM_VALIDATION_FAILED";
var JWTExpired = class extends JOSEError {
  static {
    __name(this, "JWTExpired");
  }
  constructor(message2, payload, claim = "unspecified", reason = "unspecified") {
    super(message2, { cause: { claim, reason, payload } });
    this.code = "ERR_JWT_EXPIRED";
    this.claim = claim;
    this.reason = reason;
    this.payload = payload;
  }
};
JWTExpired.code = "ERR_JWT_EXPIRED";
var JOSEAlgNotAllowed = class extends JOSEError {
  static {
    __name(this, "JOSEAlgNotAllowed");
  }
  constructor() {
    super(...arguments);
    this.code = "ERR_JOSE_ALG_NOT_ALLOWED";
  }
};
JOSEAlgNotAllowed.code = "ERR_JOSE_ALG_NOT_ALLOWED";
var JOSENotSupported = class extends JOSEError {
  static {
    __name(this, "JOSENotSupported");
  }
  constructor() {
    super(...arguments);
    this.code = "ERR_JOSE_NOT_SUPPORTED";
  }
};
JOSENotSupported.code = "ERR_JOSE_NOT_SUPPORTED";
var JWEDecryptionFailed = class extends JOSEError {
  static {
    __name(this, "JWEDecryptionFailed");
  }
  constructor(message2 = "decryption operation failed", options) {
    super(message2, options);
    this.code = "ERR_JWE_DECRYPTION_FAILED";
  }
};
JWEDecryptionFailed.code = "ERR_JWE_DECRYPTION_FAILED";
var JWEInvalid = class extends JOSEError {
  static {
    __name(this, "JWEInvalid");
  }
  constructor() {
    super(...arguments);
    this.code = "ERR_JWE_INVALID";
  }
};
JWEInvalid.code = "ERR_JWE_INVALID";
var JWSInvalid = class extends JOSEError {
  static {
    __name(this, "JWSInvalid");
  }
  constructor() {
    super(...arguments);
    this.code = "ERR_JWS_INVALID";
  }
};
JWSInvalid.code = "ERR_JWS_INVALID";
var JWTInvalid = class extends JOSEError {
  static {
    __name(this, "JWTInvalid");
  }
  constructor() {
    super(...arguments);
    this.code = "ERR_JWT_INVALID";
  }
};
JWTInvalid.code = "ERR_JWT_INVALID";
var JWKInvalid = class extends JOSEError {
  static {
    __name(this, "JWKInvalid");
  }
  constructor() {
    super(...arguments);
    this.code = "ERR_JWK_INVALID";
  }
};
JWKInvalid.code = "ERR_JWK_INVALID";
var JWKSInvalid = class extends JOSEError {
  static {
    __name(this, "JWKSInvalid");
  }
  constructor() {
    super(...arguments);
    this.code = "ERR_JWKS_INVALID";
  }
};
JWKSInvalid.code = "ERR_JWKS_INVALID";
var JWKSNoMatchingKey = class extends JOSEError {
  static {
    __name(this, "JWKSNoMatchingKey");
  }
  constructor(message2 = "no applicable key found in the JSON Web Key Set", options) {
    super(message2, options);
    this.code = "ERR_JWKS_NO_MATCHING_KEY";
  }
};
JWKSNoMatchingKey.code = "ERR_JWKS_NO_MATCHING_KEY";
var JWKSMultipleMatchingKeys = class extends JOSEError {
  static {
    __name(this, "JWKSMultipleMatchingKeys");
  }
  constructor(message2 = "multiple matching keys found in the JSON Web Key Set", options) {
    super(message2, options);
    this.code = "ERR_JWKS_MULTIPLE_MATCHING_KEYS";
  }
};
JWKSMultipleMatchingKeys.code = "ERR_JWKS_MULTIPLE_MATCHING_KEYS";
var JWKSTimeout = class extends JOSEError {
  static {
    __name(this, "JWKSTimeout");
  }
  constructor(message2 = "request timed out", options) {
    super(message2, options);
    this.code = "ERR_JWKS_TIMEOUT";
  }
};
JWKSTimeout.code = "ERR_JWKS_TIMEOUT";
var JWSSignatureVerificationFailed = class extends JOSEError {
  static {
    __name(this, "JWSSignatureVerificationFailed");
  }
  constructor(message2 = "signature verification failed", options) {
    super(message2, options);
    this.code = "ERR_JWS_SIGNATURE_VERIFICATION_FAILED";
  }
};
JWSSignatureVerificationFailed.code = "ERR_JWS_SIGNATURE_VERIFICATION_FAILED";

// node_modules/jose/dist/browser/lib/crypto_key.js
function unusable(name, prop = "algorithm.name") {
  return new TypeError(`CryptoKey does not support this operation, its ${prop} must be ${name}`);
}
__name(unusable, "unusable");
function isAlgorithm(algorithm, name) {
  return algorithm.name === name;
}
__name(isAlgorithm, "isAlgorithm");
function getHashLength(hash) {
  return parseInt(hash.name.slice(4), 10);
}
__name(getHashLength, "getHashLength");
function getNamedCurve(alg) {
  switch (alg) {
    case "ES256":
      return "P-256";
    case "ES384":
      return "P-384";
    case "ES512":
      return "P-521";
    default:
      throw new Error("unreachable");
  }
}
__name(getNamedCurve, "getNamedCurve");
function checkUsage(key, usages) {
  if (usages.length && !usages.some((expected) => key.usages.includes(expected))) {
    let msg = "CryptoKey does not support this operation, its usages must include ";
    if (usages.length > 2) {
      const last = usages.pop();
      msg += `one of ${usages.join(", ")}, or ${last}.`;
    } else if (usages.length === 2) {
      msg += `one of ${usages[0]} or ${usages[1]}.`;
    } else {
      msg += `${usages[0]}.`;
    }
    throw new TypeError(msg);
  }
}
__name(checkUsage, "checkUsage");
function checkSigCryptoKey(key, alg, ...usages) {
  switch (alg) {
    case "HS256":
    case "HS384":
    case "HS512": {
      if (!isAlgorithm(key.algorithm, "HMAC"))
        throw unusable("HMAC");
      const expected = parseInt(alg.slice(2), 10);
      const actual = getHashLength(key.algorithm.hash);
      if (actual !== expected)
        throw unusable(`SHA-${expected}`, "algorithm.hash");
      break;
    }
    case "RS256":
    case "RS384":
    case "RS512": {
      if (!isAlgorithm(key.algorithm, "RSASSA-PKCS1-v1_5"))
        throw unusable("RSASSA-PKCS1-v1_5");
      const expected = parseInt(alg.slice(2), 10);
      const actual = getHashLength(key.algorithm.hash);
      if (actual !== expected)
        throw unusable(`SHA-${expected}`, "algorithm.hash");
      break;
    }
    case "PS256":
    case "PS384":
    case "PS512": {
      if (!isAlgorithm(key.algorithm, "RSA-PSS"))
        throw unusable("RSA-PSS");
      const expected = parseInt(alg.slice(2), 10);
      const actual = getHashLength(key.algorithm.hash);
      if (actual !== expected)
        throw unusable(`SHA-${expected}`, "algorithm.hash");
      break;
    }
    case "EdDSA": {
      if (key.algorithm.name !== "Ed25519" && key.algorithm.name !== "Ed448") {
        throw unusable("Ed25519 or Ed448");
      }
      break;
    }
    case "Ed25519": {
      if (!isAlgorithm(key.algorithm, "Ed25519"))
        throw unusable("Ed25519");
      break;
    }
    case "ES256":
    case "ES384":
    case "ES512": {
      if (!isAlgorithm(key.algorithm, "ECDSA"))
        throw unusable("ECDSA");
      const expected = getNamedCurve(alg);
      const actual = key.algorithm.namedCurve;
      if (actual !== expected)
        throw unusable(expected, "algorithm.namedCurve");
      break;
    }
    default:
      throw new TypeError("CryptoKey does not support this operation");
  }
  checkUsage(key, usages);
}
__name(checkSigCryptoKey, "checkSigCryptoKey");

// node_modules/jose/dist/browser/lib/invalid_key_input.js
function message(msg, actual, ...types2) {
  types2 = types2.filter(Boolean);
  if (types2.length > 2) {
    const last = types2.pop();
    msg += `one of type ${types2.join(", ")}, or ${last}.`;
  } else if (types2.length === 2) {
    msg += `one of type ${types2[0]} or ${types2[1]}.`;
  } else {
    msg += `of type ${types2[0]}.`;
  }
  if (actual == null) {
    msg += ` Received ${actual}`;
  } else if (typeof actual === "function" && actual.name) {
    msg += ` Received function ${actual.name}`;
  } else if (typeof actual === "object" && actual != null) {
    if (actual.constructor?.name) {
      msg += ` Received an instance of ${actual.constructor.name}`;
    }
  }
  return msg;
}
__name(message, "message");
var invalid_key_input_default = /* @__PURE__ */ __name((actual, ...types2) => {
  return message("Key must be ", actual, ...types2);
}, "default");
function withAlg(alg, actual, ...types2) {
  return message(`Key for the ${alg} algorithm must be `, actual, ...types2);
}
__name(withAlg, "withAlg");

// node_modules/jose/dist/browser/runtime/is_key_like.js
var is_key_like_default = /* @__PURE__ */ __name((key) => {
  if (isCryptoKey(key)) {
    return true;
  }
  return key?.[Symbol.toStringTag] === "KeyObject";
}, "default");
var types = ["CryptoKey"];

// node_modules/jose/dist/browser/lib/is_disjoint.js
var isDisjoint = /* @__PURE__ */ __name((...headers) => {
  const sources = headers.filter(Boolean);
  if (sources.length === 0 || sources.length === 1) {
    return true;
  }
  let acc;
  for (const header of sources) {
    const parameters = Object.keys(header);
    if (!acc || acc.size === 0) {
      acc = new Set(parameters);
      continue;
    }
    for (const parameter of parameters) {
      if (acc.has(parameter)) {
        return false;
      }
      acc.add(parameter);
    }
  }
  return true;
}, "isDisjoint");
var is_disjoint_default = isDisjoint;

// node_modules/jose/dist/browser/lib/is_object.js
function isObjectLike(value) {
  return typeof value === "object" && value !== null;
}
__name(isObjectLike, "isObjectLike");
function isObject(input) {
  if (!isObjectLike(input) || Object.prototype.toString.call(input) !== "[object Object]") {
    return false;
  }
  if (Object.getPrototypeOf(input) === null) {
    return true;
  }
  let proto = input;
  while (Object.getPrototypeOf(proto) !== null) {
    proto = Object.getPrototypeOf(proto);
  }
  return Object.getPrototypeOf(input) === proto;
}
__name(isObject, "isObject");

// node_modules/jose/dist/browser/runtime/check_key_length.js
var check_key_length_default = /* @__PURE__ */ __name((alg, key) => {
  if (alg.startsWith("RS") || alg.startsWith("PS")) {
    const { modulusLength } = key.algorithm;
    if (typeof modulusLength !== "number" || modulusLength < 2048) {
      throw new TypeError(`${alg} requires key modulusLength to be 2048 bits or larger`);
    }
  }
}, "default");

// node_modules/jose/dist/browser/lib/is_jwk.js
function isJWK(key) {
  return isObject(key) && typeof key.kty === "string";
}
__name(isJWK, "isJWK");
function isPrivateJWK(key) {
  return key.kty !== "oct" && typeof key.d === "string";
}
__name(isPrivateJWK, "isPrivateJWK");
function isPublicJWK(key) {
  return key.kty !== "oct" && typeof key.d === "undefined";
}
__name(isPublicJWK, "isPublicJWK");
function isSecretJWK(key) {
  return isJWK(key) && key.kty === "oct" && typeof key.k === "string";
}
__name(isSecretJWK, "isSecretJWK");

// node_modules/jose/dist/browser/runtime/jwk_to_key.js
function subtleMapping(jwk) {
  let algorithm;
  let keyUsages;
  switch (jwk.kty) {
    case "RSA": {
      switch (jwk.alg) {
        case "PS256":
        case "PS384":
        case "PS512":
          algorithm = { name: "RSA-PSS", hash: `SHA-${jwk.alg.slice(-3)}` };
          keyUsages = jwk.d ? ["sign"] : ["verify"];
          break;
        case "RS256":
        case "RS384":
        case "RS512":
          algorithm = { name: "RSASSA-PKCS1-v1_5", hash: `SHA-${jwk.alg.slice(-3)}` };
          keyUsages = jwk.d ? ["sign"] : ["verify"];
          break;
        case "RSA-OAEP":
        case "RSA-OAEP-256":
        case "RSA-OAEP-384":
        case "RSA-OAEP-512":
          algorithm = {
            name: "RSA-OAEP",
            hash: `SHA-${parseInt(jwk.alg.slice(-3), 10) || 1}`
          };
          keyUsages = jwk.d ? ["decrypt", "unwrapKey"] : ["encrypt", "wrapKey"];
          break;
        default:
          throw new JOSENotSupported('Invalid or unsupported JWK "alg" (Algorithm) Parameter value');
      }
      break;
    }
    case "EC": {
      switch (jwk.alg) {
        case "ES256":
          algorithm = { name: "ECDSA", namedCurve: "P-256" };
          keyUsages = jwk.d ? ["sign"] : ["verify"];
          break;
        case "ES384":
          algorithm = { name: "ECDSA", namedCurve: "P-384" };
          keyUsages = jwk.d ? ["sign"] : ["verify"];
          break;
        case "ES512":
          algorithm = { name: "ECDSA", namedCurve: "P-521" };
          keyUsages = jwk.d ? ["sign"] : ["verify"];
          break;
        case "ECDH-ES":
        case "ECDH-ES+A128KW":
        case "ECDH-ES+A192KW":
        case "ECDH-ES+A256KW":
          algorithm = { name: "ECDH", namedCurve: jwk.crv };
          keyUsages = jwk.d ? ["deriveBits"] : [];
          break;
        default:
          throw new JOSENotSupported('Invalid or unsupported JWK "alg" (Algorithm) Parameter value');
      }
      break;
    }
    case "OKP": {
      switch (jwk.alg) {
        case "Ed25519":
          algorithm = { name: "Ed25519" };
          keyUsages = jwk.d ? ["sign"] : ["verify"];
          break;
        case "EdDSA":
          algorithm = { name: jwk.crv };
          keyUsages = jwk.d ? ["sign"] : ["verify"];
          break;
        case "ECDH-ES":
        case "ECDH-ES+A128KW":
        case "ECDH-ES+A192KW":
        case "ECDH-ES+A256KW":
          algorithm = { name: jwk.crv };
          keyUsages = jwk.d ? ["deriveBits"] : [];
          break;
        default:
          throw new JOSENotSupported('Invalid or unsupported JWK "alg" (Algorithm) Parameter value');
      }
      break;
    }
    default:
      throw new JOSENotSupported('Invalid or unsupported JWK "kty" (Key Type) Parameter value');
  }
  return { algorithm, keyUsages };
}
__name(subtleMapping, "subtleMapping");
var parse = /* @__PURE__ */ __name(async (jwk) => {
  if (!jwk.alg) {
    throw new TypeError('"alg" argument is required when "jwk.alg" is not present');
  }
  const { algorithm, keyUsages } = subtleMapping(jwk);
  const rest = [
    algorithm,
    jwk.ext ?? false,
    jwk.key_ops ?? keyUsages
  ];
  const keyData = { ...jwk };
  delete keyData.alg;
  delete keyData.use;
  return webcrypto_default.subtle.importKey("jwk", keyData, ...rest);
}, "parse");
var jwk_to_key_default = parse;

// node_modules/jose/dist/browser/runtime/normalize_key.js
var exportKeyValue = /* @__PURE__ */ __name((k) => decode(k), "exportKeyValue");
var privCache;
var pubCache;
var isKeyObject = /* @__PURE__ */ __name((key) => {
  return key?.[Symbol.toStringTag] === "KeyObject";
}, "isKeyObject");
var importAndCache = /* @__PURE__ */ __name(async (cache, key, jwk, alg, freeze = false) => {
  let cached = cache.get(key);
  if (cached?.[alg]) {
    return cached[alg];
  }
  const cryptoKey = await jwk_to_key_default({ ...jwk, alg });
  if (freeze)
    Object.freeze(key);
  if (!cached) {
    cache.set(key, { [alg]: cryptoKey });
  } else {
    cached[alg] = cryptoKey;
  }
  return cryptoKey;
}, "importAndCache");
var normalizePublicKey = /* @__PURE__ */ __name((key, alg) => {
  if (isKeyObject(key)) {
    let jwk = key.export({ format: "jwk" });
    delete jwk.d;
    delete jwk.dp;
    delete jwk.dq;
    delete jwk.p;
    delete jwk.q;
    delete jwk.qi;
    if (jwk.k) {
      return exportKeyValue(jwk.k);
    }
    pubCache || (pubCache = /* @__PURE__ */ new WeakMap());
    return importAndCache(pubCache, key, jwk, alg);
  }
  if (isJWK(key)) {
    if (key.k)
      return decode(key.k);
    pubCache || (pubCache = /* @__PURE__ */ new WeakMap());
    const cryptoKey = importAndCache(pubCache, key, key, alg, true);
    return cryptoKey;
  }
  return key;
}, "normalizePublicKey");
var normalizePrivateKey = /* @__PURE__ */ __name((key, alg) => {
  if (isKeyObject(key)) {
    let jwk = key.export({ format: "jwk" });
    if (jwk.k) {
      return exportKeyValue(jwk.k);
    }
    privCache || (privCache = /* @__PURE__ */ new WeakMap());
    return importAndCache(privCache, key, jwk, alg);
  }
  if (isJWK(key)) {
    if (key.k)
      return decode(key.k);
    privCache || (privCache = /* @__PURE__ */ new WeakMap());
    const cryptoKey = importAndCache(privCache, key, key, alg, true);
    return cryptoKey;
  }
  return key;
}, "normalizePrivateKey");
var normalize_key_default = { normalizePublicKey, normalizePrivateKey };

// node_modules/jose/dist/browser/key/import.js
async function importJWK(jwk, alg) {
  if (!isObject(jwk)) {
    throw new TypeError("JWK must be an object");
  }
  alg || (alg = jwk.alg);
  switch (jwk.kty) {
    case "oct":
      if (typeof jwk.k !== "string" || !jwk.k) {
        throw new TypeError('missing "k" (Key Value) Parameter value');
      }
      return decode(jwk.k);
    case "RSA":
      if ("oth" in jwk && jwk.oth !== void 0) {
        throw new JOSENotSupported('RSA JWK "oth" (Other Primes Info) Parameter value is not supported');
      }
    case "EC":
    case "OKP":
      return jwk_to_key_default({ ...jwk, alg });
    default:
      throw new JOSENotSupported('Unsupported "kty" (Key Type) Parameter value');
  }
}
__name(importJWK, "importJWK");

// node_modules/jose/dist/browser/lib/check_key_type.js
var tag = /* @__PURE__ */ __name((key) => key?.[Symbol.toStringTag], "tag");
var jwkMatchesOp = /* @__PURE__ */ __name((alg, key, usage) => {
  if (key.use !== void 0 && key.use !== "sig") {
    throw new TypeError("Invalid key for this operation, when present its use must be sig");
  }
  if (key.key_ops !== void 0 && key.key_ops.includes?.(usage) !== true) {
    throw new TypeError(`Invalid key for this operation, when present its key_ops must include ${usage}`);
  }
  if (key.alg !== void 0 && key.alg !== alg) {
    throw new TypeError(`Invalid key for this operation, when present its alg must be ${alg}`);
  }
  return true;
}, "jwkMatchesOp");
var symmetricTypeCheck = /* @__PURE__ */ __name((alg, key, usage, allowJwk) => {
  if (key instanceof Uint8Array)
    return;
  if (allowJwk && isJWK(key)) {
    if (isSecretJWK(key) && jwkMatchesOp(alg, key, usage))
      return;
    throw new TypeError(`JSON Web Key for symmetric algorithms must have JWK "kty" (Key Type) equal to "oct" and the JWK "k" (Key Value) present`);
  }
  if (!is_key_like_default(key)) {
    throw new TypeError(withAlg(alg, key, ...types, "Uint8Array", allowJwk ? "JSON Web Key" : null));
  }
  if (key.type !== "secret") {
    throw new TypeError(`${tag(key)} instances for symmetric algorithms must be of type "secret"`);
  }
}, "symmetricTypeCheck");
var asymmetricTypeCheck = /* @__PURE__ */ __name((alg, key, usage, allowJwk) => {
  if (allowJwk && isJWK(key)) {
    switch (usage) {
      case "sign":
        if (isPrivateJWK(key) && jwkMatchesOp(alg, key, usage))
          return;
        throw new TypeError(`JSON Web Key for this operation be a private JWK`);
      case "verify":
        if (isPublicJWK(key) && jwkMatchesOp(alg, key, usage))
          return;
        throw new TypeError(`JSON Web Key for this operation be a public JWK`);
    }
  }
  if (!is_key_like_default(key)) {
    throw new TypeError(withAlg(alg, key, ...types, allowJwk ? "JSON Web Key" : null));
  }
  if (key.type === "secret") {
    throw new TypeError(`${tag(key)} instances for asymmetric algorithms must not be of type "secret"`);
  }
  if (usage === "sign" && key.type === "public") {
    throw new TypeError(`${tag(key)} instances for asymmetric algorithm signing must be of type "private"`);
  }
  if (usage === "decrypt" && key.type === "public") {
    throw new TypeError(`${tag(key)} instances for asymmetric algorithm decryption must be of type "private"`);
  }
  if (key.algorithm && usage === "verify" && key.type === "private") {
    throw new TypeError(`${tag(key)} instances for asymmetric algorithm verifying must be of type "public"`);
  }
  if (key.algorithm && usage === "encrypt" && key.type === "private") {
    throw new TypeError(`${tag(key)} instances for asymmetric algorithm encryption must be of type "public"`);
  }
}, "asymmetricTypeCheck");
function checkKeyType(allowJwk, alg, key, usage) {
  const symmetric = alg.startsWith("HS") || alg === "dir" || alg.startsWith("PBES2") || /^A\d{3}(?:GCM)?KW$/.test(alg);
  if (symmetric) {
    symmetricTypeCheck(alg, key, usage, allowJwk);
  } else {
    asymmetricTypeCheck(alg, key, usage, allowJwk);
  }
}
__name(checkKeyType, "checkKeyType");
var check_key_type_default = checkKeyType.bind(void 0, false);
var checkKeyTypeWithJwk = checkKeyType.bind(void 0, true);

// node_modules/jose/dist/browser/lib/validate_crit.js
function validateCrit(Err, recognizedDefault, recognizedOption, protectedHeader, joseHeader) {
  if (joseHeader.crit !== void 0 && protectedHeader?.crit === void 0) {
    throw new Err('"crit" (Critical) Header Parameter MUST be integrity protected');
  }
  if (!protectedHeader || protectedHeader.crit === void 0) {
    return /* @__PURE__ */ new Set();
  }
  if (!Array.isArray(protectedHeader.crit) || protectedHeader.crit.length === 0 || protectedHeader.crit.some((input) => typeof input !== "string" || input.length === 0)) {
    throw new Err('"crit" (Critical) Header Parameter MUST be an array of non-empty strings when present');
  }
  let recognized;
  if (recognizedOption !== void 0) {
    recognized = new Map([...Object.entries(recognizedOption), ...recognizedDefault.entries()]);
  } else {
    recognized = recognizedDefault;
  }
  for (const parameter of protectedHeader.crit) {
    if (!recognized.has(parameter)) {
      throw new JOSENotSupported(`Extension Header Parameter "${parameter}" is not recognized`);
    }
    if (joseHeader[parameter] === void 0) {
      throw new Err(`Extension Header Parameter "${parameter}" is missing`);
    }
    if (recognized.get(parameter) && protectedHeader[parameter] === void 0) {
      throw new Err(`Extension Header Parameter "${parameter}" MUST be integrity protected`);
    }
  }
  return new Set(protectedHeader.crit);
}
__name(validateCrit, "validateCrit");
var validate_crit_default = validateCrit;

// node_modules/jose/dist/browser/lib/validate_algorithms.js
var validateAlgorithms = /* @__PURE__ */ __name((option, algorithms) => {
  if (algorithms !== void 0 && (!Array.isArray(algorithms) || algorithms.some((s) => typeof s !== "string"))) {
    throw new TypeError(`"${option}" option must be an array of strings`);
  }
  if (!algorithms) {
    return void 0;
  }
  return new Set(algorithms);
}, "validateAlgorithms");
var validate_algorithms_default = validateAlgorithms;

// node_modules/jose/dist/browser/runtime/subtle_dsa.js
function subtleDsa(alg, algorithm) {
  const hash = `SHA-${alg.slice(-3)}`;
  switch (alg) {
    case "HS256":
    case "HS384":
    case "HS512":
      return { hash, name: "HMAC" };
    case "PS256":
    case "PS384":
    case "PS512":
      return { hash, name: "RSA-PSS", saltLength: alg.slice(-3) >> 3 };
    case "RS256":
    case "RS384":
    case "RS512":
      return { hash, name: "RSASSA-PKCS1-v1_5" };
    case "ES256":
    case "ES384":
    case "ES512":
      return { hash, name: "ECDSA", namedCurve: algorithm.namedCurve };
    case "Ed25519":
      return { name: "Ed25519" };
    case "EdDSA":
      return { name: algorithm.name };
    default:
      throw new JOSENotSupported(`alg ${alg} is not supported either by JOSE or your javascript runtime`);
  }
}
__name(subtleDsa, "subtleDsa");

// node_modules/jose/dist/browser/runtime/get_sign_verify_key.js
async function getCryptoKey(alg, key, usage) {
  if (usage === "sign") {
    key = await normalize_key_default.normalizePrivateKey(key, alg);
  }
  if (usage === "verify") {
    key = await normalize_key_default.normalizePublicKey(key, alg);
  }
  if (isCryptoKey(key)) {
    checkSigCryptoKey(key, alg, usage);
    return key;
  }
  if (key instanceof Uint8Array) {
    if (!alg.startsWith("HS")) {
      throw new TypeError(invalid_key_input_default(key, ...types));
    }
    return webcrypto_default.subtle.importKey("raw", key, { hash: `SHA-${alg.slice(-3)}`, name: "HMAC" }, false, [usage]);
  }
  throw new TypeError(invalid_key_input_default(key, ...types, "Uint8Array", "JSON Web Key"));
}
__name(getCryptoKey, "getCryptoKey");

// node_modules/jose/dist/browser/runtime/verify.js
var verify = /* @__PURE__ */ __name(async (alg, key, signature, data) => {
  const cryptoKey = await getCryptoKey(alg, key, "verify");
  check_key_length_default(alg, cryptoKey);
  const algorithm = subtleDsa(alg, cryptoKey.algorithm);
  try {
    return await webcrypto_default.subtle.verify(algorithm, cryptoKey, signature, data);
  } catch {
    return false;
  }
}, "verify");
var verify_default = verify;

// node_modules/jose/dist/browser/jws/flattened/verify.js
async function flattenedVerify(jws, key, options) {
  if (!isObject(jws)) {
    throw new JWSInvalid("Flattened JWS must be an object");
  }
  if (jws.protected === void 0 && jws.header === void 0) {
    throw new JWSInvalid('Flattened JWS must have either of the "protected" or "header" members');
  }
  if (jws.protected !== void 0 && typeof jws.protected !== "string") {
    throw new JWSInvalid("JWS Protected Header incorrect type");
  }
  if (jws.payload === void 0) {
    throw new JWSInvalid("JWS Payload missing");
  }
  if (typeof jws.signature !== "string") {
    throw new JWSInvalid("JWS Signature missing or incorrect type");
  }
  if (jws.header !== void 0 && !isObject(jws.header)) {
    throw new JWSInvalid("JWS Unprotected Header incorrect type");
  }
  let parsedProt = {};
  if (jws.protected) {
    try {
      const protectedHeader = decode(jws.protected);
      parsedProt = JSON.parse(decoder.decode(protectedHeader));
    } catch {
      throw new JWSInvalid("JWS Protected Header is invalid");
    }
  }
  if (!is_disjoint_default(parsedProt, jws.header)) {
    throw new JWSInvalid("JWS Protected and JWS Unprotected Header Parameter names must be disjoint");
  }
  const joseHeader = {
    ...parsedProt,
    ...jws.header
  };
  const extensions = validate_crit_default(JWSInvalid, /* @__PURE__ */ new Map([["b64", true]]), options?.crit, parsedProt, joseHeader);
  let b64 = true;
  if (extensions.has("b64")) {
    b64 = parsedProt.b64;
    if (typeof b64 !== "boolean") {
      throw new JWSInvalid('The "b64" (base64url-encode payload) Header Parameter must be a boolean');
    }
  }
  const { alg } = joseHeader;
  if (typeof alg !== "string" || !alg) {
    throw new JWSInvalid('JWS "alg" (Algorithm) Header Parameter missing or invalid');
  }
  const algorithms = options && validate_algorithms_default("algorithms", options.algorithms);
  if (algorithms && !algorithms.has(alg)) {
    throw new JOSEAlgNotAllowed('"alg" (Algorithm) Header Parameter value not allowed');
  }
  if (b64) {
    if (typeof jws.payload !== "string") {
      throw new JWSInvalid("JWS Payload must be a string");
    }
  } else if (typeof jws.payload !== "string" && !(jws.payload instanceof Uint8Array)) {
    throw new JWSInvalid("JWS Payload must be a string or an Uint8Array instance");
  }
  let resolvedKey = false;
  if (typeof key === "function") {
    key = await key(parsedProt, jws);
    resolvedKey = true;
    checkKeyTypeWithJwk(alg, key, "verify");
    if (isJWK(key)) {
      key = await importJWK(key, alg);
    }
  } else {
    checkKeyTypeWithJwk(alg, key, "verify");
  }
  const data = concat(encoder.encode(jws.protected ?? ""), encoder.encode("."), typeof jws.payload === "string" ? encoder.encode(jws.payload) : jws.payload);
  let signature;
  try {
    signature = decode(jws.signature);
  } catch {
    throw new JWSInvalid("Failed to base64url decode the signature");
  }
  const verified = await verify_default(alg, key, signature, data);
  if (!verified) {
    throw new JWSSignatureVerificationFailed();
  }
  let payload;
  if (b64) {
    try {
      payload = decode(jws.payload);
    } catch {
      throw new JWSInvalid("Failed to base64url decode the payload");
    }
  } else if (typeof jws.payload === "string") {
    payload = encoder.encode(jws.payload);
  } else {
    payload = jws.payload;
  }
  const result = { payload };
  if (jws.protected !== void 0) {
    result.protectedHeader = parsedProt;
  }
  if (jws.header !== void 0) {
    result.unprotectedHeader = jws.header;
  }
  if (resolvedKey) {
    return { ...result, key };
  }
  return result;
}
__name(flattenedVerify, "flattenedVerify");

// node_modules/jose/dist/browser/jws/compact/verify.js
async function compactVerify(jws, key, options) {
  if (jws instanceof Uint8Array) {
    jws = decoder.decode(jws);
  }
  if (typeof jws !== "string") {
    throw new JWSInvalid("Compact JWS must be a string or Uint8Array");
  }
  const { 0: protectedHeader, 1: payload, 2: signature, length } = jws.split(".");
  if (length !== 3) {
    throw new JWSInvalid("Invalid Compact JWS");
  }
  const verified = await flattenedVerify({ payload, protected: protectedHeader, signature }, key, options);
  const result = { payload: verified.payload, protectedHeader: verified.protectedHeader };
  if (typeof key === "function") {
    return { ...result, key: verified.key };
  }
  return result;
}
__name(compactVerify, "compactVerify");

// node_modules/jose/dist/browser/lib/epoch.js
var epoch_default = /* @__PURE__ */ __name((date) => Math.floor(date.getTime() / 1e3), "default");

// node_modules/jose/dist/browser/lib/secs.js
var minute = 60;
var hour = minute * 60;
var day = hour * 24;
var week = day * 7;
var year = day * 365.25;
var REGEX = /^(\+|\-)? ?(\d+|\d+\.\d+) ?(seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)(?: (ago|from now))?$/i;
var secs_default = /* @__PURE__ */ __name((str) => {
  const matched = REGEX.exec(str);
  if (!matched || matched[4] && matched[1]) {
    throw new TypeError("Invalid time period format");
  }
  const value = parseFloat(matched[2]);
  const unit = matched[3].toLowerCase();
  let numericDate;
  switch (unit) {
    case "sec":
    case "secs":
    case "second":
    case "seconds":
    case "s":
      numericDate = Math.round(value);
      break;
    case "minute":
    case "minutes":
    case "min":
    case "mins":
    case "m":
      numericDate = Math.round(value * minute);
      break;
    case "hour":
    case "hours":
    case "hr":
    case "hrs":
    case "h":
      numericDate = Math.round(value * hour);
      break;
    case "day":
    case "days":
    case "d":
      numericDate = Math.round(value * day);
      break;
    case "week":
    case "weeks":
    case "w":
      numericDate = Math.round(value * week);
      break;
    default:
      numericDate = Math.round(value * year);
      break;
  }
  if (matched[1] === "-" || matched[4] === "ago") {
    return -numericDate;
  }
  return numericDate;
}, "default");

// node_modules/jose/dist/browser/lib/jwt_claims_set.js
var normalizeTyp = /* @__PURE__ */ __name((value) => value.toLowerCase().replace(/^application\//, ""), "normalizeTyp");
var checkAudiencePresence = /* @__PURE__ */ __name((audPayload, audOption) => {
  if (typeof audPayload === "string") {
    return audOption.includes(audPayload);
  }
  if (Array.isArray(audPayload)) {
    return audOption.some(Set.prototype.has.bind(new Set(audPayload)));
  }
  return false;
}, "checkAudiencePresence");
var jwt_claims_set_default = /* @__PURE__ */ __name((protectedHeader, encodedPayload, options = {}) => {
  let payload;
  try {
    payload = JSON.parse(decoder.decode(encodedPayload));
  } catch {
  }
  if (!isObject(payload)) {
    throw new JWTInvalid("JWT Claims Set must be a top-level JSON object");
  }
  const { typ } = options;
  if (typ && (typeof protectedHeader.typ !== "string" || normalizeTyp(protectedHeader.typ) !== normalizeTyp(typ))) {
    throw new JWTClaimValidationFailed('unexpected "typ" JWT header value', payload, "typ", "check_failed");
  }
  const { requiredClaims = [], issuer, subject, audience, maxTokenAge } = options;
  const presenceCheck = [...requiredClaims];
  if (maxTokenAge !== void 0)
    presenceCheck.push("iat");
  if (audience !== void 0)
    presenceCheck.push("aud");
  if (subject !== void 0)
    presenceCheck.push("sub");
  if (issuer !== void 0)
    presenceCheck.push("iss");
  for (const claim of new Set(presenceCheck.reverse())) {
    if (!(claim in payload)) {
      throw new JWTClaimValidationFailed(`missing required "${claim}" claim`, payload, claim, "missing");
    }
  }
  if (issuer && !(Array.isArray(issuer) ? issuer : [issuer]).includes(payload.iss)) {
    throw new JWTClaimValidationFailed('unexpected "iss" claim value', payload, "iss", "check_failed");
  }
  if (subject && payload.sub !== subject) {
    throw new JWTClaimValidationFailed('unexpected "sub" claim value', payload, "sub", "check_failed");
  }
  if (audience && !checkAudiencePresence(payload.aud, typeof audience === "string" ? [audience] : audience)) {
    throw new JWTClaimValidationFailed('unexpected "aud" claim value', payload, "aud", "check_failed");
  }
  let tolerance;
  switch (typeof options.clockTolerance) {
    case "string":
      tolerance = secs_default(options.clockTolerance);
      break;
    case "number":
      tolerance = options.clockTolerance;
      break;
    case "undefined":
      tolerance = 0;
      break;
    default:
      throw new TypeError("Invalid clockTolerance option type");
  }
  const { currentDate } = options;
  const now = epoch_default(currentDate || /* @__PURE__ */ new Date());
  if ((payload.iat !== void 0 || maxTokenAge) && typeof payload.iat !== "number") {
    throw new JWTClaimValidationFailed('"iat" claim must be a number', payload, "iat", "invalid");
  }
  if (payload.nbf !== void 0) {
    if (typeof payload.nbf !== "number") {
      throw new JWTClaimValidationFailed('"nbf" claim must be a number', payload, "nbf", "invalid");
    }
    if (payload.nbf > now + tolerance) {
      throw new JWTClaimValidationFailed('"nbf" claim timestamp check failed', payload, "nbf", "check_failed");
    }
  }
  if (payload.exp !== void 0) {
    if (typeof payload.exp !== "number") {
      throw new JWTClaimValidationFailed('"exp" claim must be a number', payload, "exp", "invalid");
    }
    if (payload.exp <= now - tolerance) {
      throw new JWTExpired('"exp" claim timestamp check failed', payload, "exp", "check_failed");
    }
  }
  if (maxTokenAge) {
    const age = now - payload.iat;
    const max = typeof maxTokenAge === "number" ? maxTokenAge : secs_default(maxTokenAge);
    if (age - tolerance > max) {
      throw new JWTExpired('"iat" claim timestamp check failed (too far in the past)', payload, "iat", "check_failed");
    }
    if (age < 0 - tolerance) {
      throw new JWTClaimValidationFailed('"iat" claim timestamp check failed (it should be in the past)', payload, "iat", "check_failed");
    }
  }
  return payload;
}, "default");

// node_modules/jose/dist/browser/jwt/verify.js
async function jwtVerify(jwt, key, options) {
  const verified = await compactVerify(jwt, key, options);
  if (verified.protectedHeader.crit?.includes("b64") && verified.protectedHeader.b64 === false) {
    throw new JWTInvalid("JWTs MUST NOT use unencoded payload");
  }
  const payload = jwt_claims_set_default(verified.protectedHeader, verified.payload, options);
  const result = { payload, protectedHeader: verified.protectedHeader };
  if (typeof key === "function") {
    return { ...result, key: verified.key };
  }
  return result;
}
__name(jwtVerify, "jwtVerify");

// node_modules/jose/dist/browser/runtime/sign.js
var sign = /* @__PURE__ */ __name(async (alg, key, data) => {
  const cryptoKey = await getCryptoKey(alg, key, "sign");
  check_key_length_default(alg, cryptoKey);
  const signature = await webcrypto_default.subtle.sign(subtleDsa(alg, cryptoKey.algorithm), cryptoKey, data);
  return new Uint8Array(signature);
}, "sign");
var sign_default = sign;

// node_modules/jose/dist/browser/jws/flattened/sign.js
var FlattenedSign = class {
  static {
    __name(this, "FlattenedSign");
  }
  constructor(payload) {
    if (!(payload instanceof Uint8Array)) {
      throw new TypeError("payload must be an instance of Uint8Array");
    }
    this._payload = payload;
  }
  setProtectedHeader(protectedHeader) {
    if (this._protectedHeader) {
      throw new TypeError("setProtectedHeader can only be called once");
    }
    this._protectedHeader = protectedHeader;
    return this;
  }
  setUnprotectedHeader(unprotectedHeader) {
    if (this._unprotectedHeader) {
      throw new TypeError("setUnprotectedHeader can only be called once");
    }
    this._unprotectedHeader = unprotectedHeader;
    return this;
  }
  async sign(key, options) {
    if (!this._protectedHeader && !this._unprotectedHeader) {
      throw new JWSInvalid("either setProtectedHeader or setUnprotectedHeader must be called before #sign()");
    }
    if (!is_disjoint_default(this._protectedHeader, this._unprotectedHeader)) {
      throw new JWSInvalid("JWS Protected and JWS Unprotected Header Parameter names must be disjoint");
    }
    const joseHeader = {
      ...this._protectedHeader,
      ...this._unprotectedHeader
    };
    const extensions = validate_crit_default(JWSInvalid, /* @__PURE__ */ new Map([["b64", true]]), options?.crit, this._protectedHeader, joseHeader);
    let b64 = true;
    if (extensions.has("b64")) {
      b64 = this._protectedHeader.b64;
      if (typeof b64 !== "boolean") {
        throw new JWSInvalid('The "b64" (base64url-encode payload) Header Parameter must be a boolean');
      }
    }
    const { alg } = joseHeader;
    if (typeof alg !== "string" || !alg) {
      throw new JWSInvalid('JWS "alg" (Algorithm) Header Parameter missing or invalid');
    }
    checkKeyTypeWithJwk(alg, key, "sign");
    let payload = this._payload;
    if (b64) {
      payload = encoder.encode(encode(payload));
    }
    let protectedHeader;
    if (this._protectedHeader) {
      protectedHeader = encoder.encode(encode(JSON.stringify(this._protectedHeader)));
    } else {
      protectedHeader = encoder.encode("");
    }
    const data = concat(protectedHeader, encoder.encode("."), payload);
    const signature = await sign_default(alg, key, data);
    const jws = {
      signature: encode(signature),
      payload: ""
    };
    if (b64) {
      jws.payload = decoder.decode(payload);
    }
    if (this._unprotectedHeader) {
      jws.header = this._unprotectedHeader;
    }
    if (this._protectedHeader) {
      jws.protected = decoder.decode(protectedHeader);
    }
    return jws;
  }
};

// node_modules/jose/dist/browser/jws/compact/sign.js
var CompactSign = class {
  static {
    __name(this, "CompactSign");
  }
  constructor(payload) {
    this._flattened = new FlattenedSign(payload);
  }
  setProtectedHeader(protectedHeader) {
    this._flattened.setProtectedHeader(protectedHeader);
    return this;
  }
  async sign(key, options) {
    const jws = await this._flattened.sign(key, options);
    if (jws.payload === void 0) {
      throw new TypeError("use the flattened module for creating JWS with b64: false");
    }
    return `${jws.protected}.${jws.payload}.${jws.signature}`;
  }
};

// node_modules/jose/dist/browser/jwt/produce.js
function validateInput(label, input) {
  if (!Number.isFinite(input)) {
    throw new TypeError(`Invalid ${label} input`);
  }
  return input;
}
__name(validateInput, "validateInput");
var ProduceJWT = class {
  static {
    __name(this, "ProduceJWT");
  }
  constructor(payload = {}) {
    if (!isObject(payload)) {
      throw new TypeError("JWT Claims Set MUST be an object");
    }
    this._payload = payload;
  }
  setIssuer(issuer) {
    this._payload = { ...this._payload, iss: issuer };
    return this;
  }
  setSubject(subject) {
    this._payload = { ...this._payload, sub: subject };
    return this;
  }
  setAudience(audience) {
    this._payload = { ...this._payload, aud: audience };
    return this;
  }
  setJti(jwtId) {
    this._payload = { ...this._payload, jti: jwtId };
    return this;
  }
  setNotBefore(input) {
    if (typeof input === "number") {
      this._payload = { ...this._payload, nbf: validateInput("setNotBefore", input) };
    } else if (input instanceof Date) {
      this._payload = { ...this._payload, nbf: validateInput("setNotBefore", epoch_default(input)) };
    } else {
      this._payload = { ...this._payload, nbf: epoch_default(/* @__PURE__ */ new Date()) + secs_default(input) };
    }
    return this;
  }
  setExpirationTime(input) {
    if (typeof input === "number") {
      this._payload = { ...this._payload, exp: validateInput("setExpirationTime", input) };
    } else if (input instanceof Date) {
      this._payload = { ...this._payload, exp: validateInput("setExpirationTime", epoch_default(input)) };
    } else {
      this._payload = { ...this._payload, exp: epoch_default(/* @__PURE__ */ new Date()) + secs_default(input) };
    }
    return this;
  }
  setIssuedAt(input) {
    if (typeof input === "undefined") {
      this._payload = { ...this._payload, iat: epoch_default(/* @__PURE__ */ new Date()) };
    } else if (input instanceof Date) {
      this._payload = { ...this._payload, iat: validateInput("setIssuedAt", epoch_default(input)) };
    } else if (typeof input === "string") {
      this._payload = {
        ...this._payload,
        iat: validateInput("setIssuedAt", epoch_default(/* @__PURE__ */ new Date()) + secs_default(input))
      };
    } else {
      this._payload = { ...this._payload, iat: validateInput("setIssuedAt", input) };
    }
    return this;
  }
};

// node_modules/jose/dist/browser/jwt/sign.js
var SignJWT = class extends ProduceJWT {
  static {
    __name(this, "SignJWT");
  }
  setProtectedHeader(protectedHeader) {
    this._protectedHeader = protectedHeader;
    return this;
  }
  async sign(key, options) {
    const sig = new CompactSign(encoder.encode(JSON.stringify(this._payload)));
    sig.setProtectedHeader(this._protectedHeader);
    if (Array.isArray(this._protectedHeader?.crit) && this._protectedHeader.crit.includes("b64") && this._protectedHeader.b64 === false) {
      throw new JWTInvalid("JWTs MUST NOT use unencoded payload");
    }
    return sig.sign(key, options);
  }
};

// src/routes/auth.js
var app = new Hono2();
async function hashPassword(password) {
  const encoder2 = new TextEncoder();
  const data = encoder2.encode(password);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, "0")).join("");
}
__name(hashPassword, "hashPassword");
async function createToken(userId, secret) {
  const encoder2 = new TextEncoder();
  const jwt = await new SignJWT({ id: userId }).setProtectedHeader({ alg: "HS256" }).setExpirationTime("7d").sign(encoder2.encode(secret));
  return jwt;
}
__name(createToken, "createToken");
app.post("/register", async (c) => {
  try {
    const { email, password } = await c.req.json();
    const db = c.env.DB;
    const existing = await db.prepare("SELECT id FROM users WHERE email = ?").bind(email).first();
    if (existing) {
      return c.json({ error: "User already exists" }, 400);
    }
    const hashedPassword = await hashPassword(password);
    const orgId = crypto.randomUUID();
    await db.prepare(
      "INSERT INTO organizations (id, name, credits) VALUES (?, ?, ?)"
    ).bind(orgId, `${email}'s Organization`, 10).run();
    const userId = crypto.randomUUID();
    await db.prepare(
      "INSERT INTO users (id, email, password, organization_id, role) VALUES (?, ?, ?, ?, ?)"
    ).bind(userId, email, hashedPassword, orgId, "user").run();
    const token = await createToken(userId, c.env.JWT_SECRET);
    return c.json({
      user: { id: userId, email, role: "user" },
      token
    }, 201);
  } catch (error3) {
    console.error("Register error:", error3);
    return c.json({ error: error3.message }, 500);
  }
});
app.post("/login", async (c) => {
  try {
    const { email, password } = await c.req.json();
    const db = c.env.DB;
    const user = await db.prepare(
      "SELECT id, email, password, role, organization_id FROM users WHERE email = ?"
    ).bind(email).first();
    if (!user) {
      return c.json({ error: "Invalid credentials" }, 400);
    }
    const hashedPassword = await hashPassword(password);
    if (hashedPassword !== user.password) {
      return c.json({ error: "Invalid credentials" }, 400);
    }
    const token = await createToken(user.id, c.env.JWT_SECRET);
    return c.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        organization_id: user.organization_id
      },
      token
    });
  } catch (error3) {
    console.error("Login error:", error3);
    return c.json({ error: error3.message }, 500);
  }
});
app.get("/me", async (c) => {
  try {
    const authHeader = c.req.header("Authorization");
    if (!authHeader) {
      return c.json({ error: "Authentication required" }, 401);
    }
    const token = authHeader.replace("Bearer ", "");
    const encoder2 = new TextEncoder();
    const { payload } = await jwtVerify(token, encoder2.encode(c.env.JWT_SECRET));
    const db = c.env.DB;
    const user = await db.prepare(
      "SELECT id, email, role, organization_id FROM users WHERE id = ?"
    ).bind(payload.id).first();
    if (!user) {
      return c.json({ error: "User not found" }, 404);
    }
    return c.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        organization_id: user.organization_id
      }
    });
  } catch (error3) {
    console.error("Auth error:", error3);
    return c.json({ error: "Invalid token" }, 401);
  }
});
var auth_default = app;

// src/routes/billing.js
var app2 = new Hono2();
async function authMiddleware(c, next) {
  try {
    const authHeader = c.req.header("Authorization");
    if (!authHeader) {
      return c.json({ error: "Authentication required" }, 401);
    }
    const token = authHeader.replace("Bearer ", "");
    const encoder2 = new TextEncoder();
    const { payload } = await jwtVerify(token, encoder2.encode(c.env.JWT_SECRET));
    const db = c.env.DB;
    const user = await db.prepare(
      "SELECT id, organization_id FROM users WHERE id = ?"
    ).bind(payload.id).first();
    if (!user) {
      return c.json({ error: "User not found" }, 401);
    }
    c.set("userId", user.id);
    c.set("organizationId", user.organization_id);
    await next();
  } catch (error3) {
    return c.json({ error: "Invalid token" }, 401);
  }
}
__name(authMiddleware, "authMiddleware");
app2.get("/balance", authMiddleware, async (c) => {
  try {
    const organizationId = c.get("organizationId");
    const db = c.env.DB;
    const org = await db.prepare(
      "SELECT credits FROM organizations WHERE id = ?"
    ).bind(organizationId).first();
    return c.json({ balance: org?.credits || 0 });
  } catch (error3) {
    return c.json({ error: error3.message }, 500);
  }
});
app2.get("/usage", authMiddleware, async (c) => {
  try {
    const organizationId = c.get("organizationId");
    const db = c.env.DB;
    const calls2 = await db.prepare(
      "SELECT COUNT(*) as count FROM calls WHERE organization_id = ?"
    ).bind(organizationId).first();
    const messages2 = await db.prepare(
      "SELECT COUNT(*) as count FROM messages WHERE organization_id = ?"
    ).bind(organizationId).first();
    return c.json({
      calls: calls2?.count || 0,
      messages: messages2?.count || 0
    });
  } catch (error3) {
    return c.json({ error: error3.message }, 500);
  }
});
app2.post("/checkout", authMiddleware, async (c) => {
  return c.json({
    message: "Stripe checkout not yet implemented",
    note: "This requires Stripe API integration"
  }, 501);
});
var billing_default = app2;

// src/twilio.js
var TwilioClient = class {
  static {
    __name(this, "TwilioClient");
  }
  constructor(accountSid, authToken) {
    this.accountSid = accountSid;
    this.authToken = authToken;
    this.baseUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}`;
  }
  // Create Basic Auth header
  getAuthHeader() {
    const credentials = btoa(`${this.accountSid}:${this.authToken}`);
    return `Basic ${credentials}`;
  }
  // Fetch call logs from Twilio
  async getCalls(params = {}) {
    const queryParams = new URLSearchParams({
      PageSize: params.pageSize || "100",
      ...params.from && { From: params.from },
      ...params.to && { To: params.to },
      ...params.startTime && { "StartTime>": params.startTime }
    });
    const response = await fetch(`${this.baseUrl}/Calls.json?${queryParams}`, {
      headers: {
        "Authorization": this.getAuthHeader()
      }
    });
    if (!response.ok) {
      throw new Error(`Twilio API error: ${response.status}`);
    }
    return await response.json();
  }
  // Fetch SMS messages from Twilio
  async getMessages(params = {}) {
    const queryParams = new URLSearchParams({
      PageSize: params.pageSize || "100",
      ...params.from && { From: params.from },
      ...params.to && { To: params.to },
      ...params.dateSent && { "DateSent>": params.dateSent }
    });
    const response = await fetch(`${this.baseUrl}/Messages.json?${queryParams}`, {
      headers: {
        "Authorization": this.getAuthHeader()
      }
    });
    if (!response.ok) {
      throw new Error(`Twilio API error: ${response.status}`);
    }
    return await response.json();
  }
  // Make an outbound call
  async makeCall(from, to, url) {
    const formData = new URLSearchParams({
      From: from,
      To: to,
      Url: url
    });
    const response = await fetch(`${this.baseUrl}/Calls.json`, {
      method: "POST",
      headers: {
        "Authorization": this.getAuthHeader(),
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: formData
    });
    if (!response.ok) {
      throw new Error(`Twilio API error: ${response.status}`);
    }
    return await response.json();
  }
  // Send an SMS
  async sendMessage(from, to, body) {
    const formData = new URLSearchParams({
      From: from,
      To: to,
      Body: body
    });
    const response = await fetch(`${this.baseUrl}/Messages.json`, {
      method: "POST",
      headers: {
        "Authorization": this.getAuthHeader(),
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: formData
    });
    if (!response.ok) {
      throw new Error(`Twilio API error: ${response.status}`);
    }
    return await response.json();
  }
  // Get phone numbers
  async getPhoneNumbers() {
    const response = await fetch(`${this.baseUrl}/IncomingPhoneNumbers.json`, {
      headers: {
        "Authorization": this.getAuthHeader()
      }
    });
    if (!response.ok) {
      throw new Error(`Twilio API error: ${response.status}`);
    }
    return await response.json();
  }
};
function createTwilioClient(env2) {
  return new TwilioClient(env2.TWILIO_ACCOUNT_SID, env2.TWILIO_AUTH_TOKEN);
}
__name(createTwilioClient, "createTwilioClient");

// src/routes/sync.js
var sync = new Hono2();
sync.use("*", async (c, next) => {
  try {
    const authHeader = c.req.header("Authorization");
    if (!authHeader) {
      return c.json({ error: "Authentication required" }, 401);
    }
    const token = authHeader.replace("Bearer ", "");
    const encoder2 = new TextEncoder();
    const { payload } = await jwtVerify(token, encoder2.encode(c.env.JWT_SECRET));
    const db = c.env.DB;
    const user = await db.prepare(
      "SELECT id, email, organization_id FROM users WHERE id = ?"
    ).bind(payload.id).first();
    if (!user) {
      return c.json({ error: "User not found" }, 401);
    }
    c.set("user", user);
    await next();
  } catch (error3) {
    console.error("Auth error:", error3);
    return c.json({ error: "Invalid token" }, 401);
  }
});
sync.post("/calls", async (c) => {
  try {
    const twilio = createTwilioClient(c.env);
    const db = c.env.DB;
    const user = c.get("user");
    if (!user || !user.organization_id) {
      return c.json({ error: "User not found" }, 404);
    }
    const twilioData = await twilio.getCalls({ pageSize: 100 });
    const calls2 = twilioData.calls || [];
    let synced = 0;
    let errors = 0;
    for (const call of calls2) {
      try {
        await db.prepare(`
                    INSERT OR REPLACE INTO calls (
                        id, sid, from_number, to_number, status, direction, 
                        duration, organization_id, user_id, created_at, updated_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `).bind(
          `call-${call.sid}`,
          call.sid,
          call.from,
          call.to,
          call.status,
          // completed, no-answer, busy, failed, canceled
          call.direction,
          // inbound, outbound
          call.duration || 0,
          user.organization_id,
          user.id,
          new Date(call.date_created).getTime() / 1e3,
          Date.now() / 1e3
        ).run();
        synced++;
      } catch (err) {
        console.error("Error inserting call:", err);
        errors++;
      }
    }
    return c.json({
      success: true,
      synced,
      errors,
      total: calls2.length
    });
  } catch (error3) {
    console.error("Sync calls error:", error3);
    return c.json({ error: error3.message }, 500);
  }
});
sync.post("/messages", async (c) => {
  try {
    const twilio = createTwilioClient(c.env);
    const db = c.env.DB;
    const user = c.get("user");
    if (!user || !user.organization_id) {
      return c.json({ error: "User not found" }, 404);
    }
    const twilioData = await twilio.getMessages({ pageSize: 100 });
    const messages2 = twilioData.messages || [];
    let synced = 0;
    let errors = 0;
    for (const msg of messages2) {
      try {
        await db.prepare(`
                    INSERT OR REPLACE INTO messages (
                        id, sid, from_number, to_number, body, status, 
                        direction, organization_id, created_at, updated_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `).bind(
          `msg-${msg.sid}`,
          msg.sid,
          msg.from,
          msg.to,
          msg.body || "",
          msg.status,
          // queued, sent, delivered, failed
          msg.direction,
          // inbound, outbound-api, outbound-call, outbound-reply
          user.organization_id,
          new Date(msg.date_created).getTime() / 1e3,
          Date.now() / 1e3
        ).run();
        synced++;
      } catch (err) {
        console.error("Error inserting message:", err);
        errors++;
      }
    }
    return c.json({
      success: true,
      synced,
      errors,
      total: messages2.length
    });
  } catch (error3) {
    console.error("Sync messages error:", error3);
    return c.json({ error: error3.message }, 500);
  }
});
sync.post("/numbers", async (c) => {
  try {
    const twilio = createTwilioClient(c.env);
    const db = c.env.DB;
    const user = c.get("user");
    if (!user || !user.organization_id) {
      return c.json({ error: "User not found" }, 404);
    }
    const twilioData = await twilio.getPhoneNumbers();
    const numbers = twilioData.incoming_phone_numbers || [];
    let synced = 0;
    let errors = 0;
    for (const number of numbers) {
      try {
        await db.prepare(`
                    INSERT OR REPLACE INTO phone_numbers (
                        id, sid, phone_number, friendly_name, 
                        organization_id, created_at, updated_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?)
                `).bind(
          `num-${number.sid}`,
          number.sid,
          number.phone_number,
          number.friendly_name,
          user.organization_id,
          new Date(number.date_created).getTime() / 1e3,
          Date.now() / 1e3
        ).run();
        synced++;
      } catch (err) {
        console.error("Error inserting phone number:", err);
        errors++;
      }
    }
    return c.json({
      success: true,
      synced,
      errors,
      total: numbers.length
    });
  } catch (error3) {
    console.error("Sync numbers error:", error3);
    return c.json({ error: error3.message }, 500);
  }
});
sync.post("/all", async (c) => {
  try {
    const results = {
      calls: { synced: 0, errors: 0 },
      messages: { synced: 0, errors: 0 },
      numbers: { synced: 0, errors: 0 }
    };
    const callsResponse = await sync.request("/sync/calls", {
      method: "POST",
      headers: c.req.headers
    }, c.env);
    const callsData = await callsResponse.json();
    results.calls = { synced: callsData.synced || 0, errors: callsData.errors || 0 };
    const messagesResponse = await sync.request("/sync/messages", {
      method: "POST",
      headers: c.req.headers
    }, c.env);
    const messagesData = await messagesResponse.json();
    results.messages = { synced: messagesData.synced || 0, errors: messagesData.errors || 0 };
    const numbersResponse = await sync.request("/sync/numbers", {
      method: "POST",
      headers: c.req.headers
    }, c.env);
    const numbersData = await numbersResponse.json();
    results.numbers = { synced: numbersData.synced || 0, errors: numbersData.errors || 0 };
    return c.json({
      success: true,
      results
    });
  } catch (error3) {
    console.error("Sync all error:", error3);
    return c.json({ error: error3.message }, 500);
  }
});
var sync_default = sync;

// src/modules/voice/tokenGenerator.js
var VoiceTokenGenerator = class {
  static {
    __name(this, "VoiceTokenGenerator");
  }
  constructor(env2) {
    this.accountSid = env2.TWILIO_ACCOUNT_SID;
    this.apiKey = env2.TWILIO_API_KEY;
    this.apiSecret = env2.TWILIO_API_SECRET;
    this.twimlAppSid = env2.TWILIO_TWIML_APP_SID;
  }
  /**
   * Generate Twilio Voice token for user
   */
  async generateToken(userEmail) {
    console.log("Generating token for user:", userEmail);
    if (!this.accountSid || !this.apiKey || !this.apiSecret || !this.twimlAppSid) {
      throw new Error("Missing Twilio credentials");
    }
    const now = Math.floor(Date.now() / 1e3);
    const exp = now + 3600;
    const header = {
      cty: "twilio-fpa;v=1",
      typ: "JWT",
      alg: "HS256"
    };
    const payload = {
      jti: `${this.apiKey}-${now}`,
      iss: this.apiKey,
      sub: this.accountSid,
      exp,
      grants: {
        identity: userEmail,
        voice: {
          outgoing: {
            application_sid: this.twimlAppSid
          },
          incoming: {
            allow: true
          }
        }
      }
    };
    const encoder2 = new TextEncoder();
    const headerB64 = btoa(String.fromCharCode(...encoder2.encode(JSON.stringify(header)))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
    const payloadB64 = btoa(String.fromCharCode(...encoder2.encode(JSON.stringify(payload)))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
    const message2 = `${headerB64}.${payloadB64}`;
    const key = await crypto.subtle.importKey(
      "raw",
      encoder2.encode(this.apiSecret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const signature = await crypto.subtle.sign("HMAC", key, encoder2.encode(message2));
    const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signature))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
    const twilioToken = `${message2}.${signatureB64}`;
    console.log("\u2705 Token generated successfully");
    return {
      token: twilioToken,
      identity: userEmail
    };
  }
};
function createTokenGenerator(env2) {
  return new VoiceTokenGenerator(env2);
}
__name(createTokenGenerator, "createTokenGenerator");

// src/modules/voice/twimlGenerator.js
var TwiMLGenerator = class {
  static {
    __name(this, "TwiMLGenerator");
  }
  constructor(env2) {
    this.baseUrl = env2.API_BASE_URL || "https://voipapp.shaikhrais.workers.dev";
  }
  /**
   * Generate TwiML for outbound call
   */
  generateOutboundCall(to, from, options = {}) {
    const {
      record = false,
      recordingCallback = null,
      statusCallback = null
    } = options;
    let dialAttributes = `callerId="${from}"`;
    if (record) {
      dialAttributes += ` record="record-from-answer"`;
      if (recordingCallback) {
        dialAttributes += ` recordingStatusCallback="${recordingCallback}"`;
        dialAttributes += ` recordingStatusCallbackMethod="POST"`;
        dialAttributes += ` recordingStatusCallbackEvent="completed"`;
      }
    }
    if (statusCallback) {
      dialAttributes += ` action="${statusCallback}"`;
    }
    return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Dial ${dialAttributes}>
        <Number>${to}</Number>
    </Dial>
</Response>`;
  }
  /**
   * Generate TwiML for voicemail
   */
  generateVoicemail(greetingText, recordingUrl = null) {
    const greeting = recordingUrl ? `<Play>${recordingUrl}</Play>` : `<Say>${greetingText}</Say>`;
    return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    ${greeting}
    <Record 
        maxLength="300"
        transcribe="true"
        transcribeCallback="${this.baseUrl}/api/voice/voicemail-transcription"
        action="${this.baseUrl}/api/voice/voicemail-complete"
    />
</Response>`;
  }
  /**
   * Generate TwiML for IVR menu
   */
  generateIVRMenu(menuText, menuOptions, timeout = 5) {
    return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Gather 
        numDigits="1" 
        action="${this.baseUrl}/api/voice/ivr-handle" 
        timeout="${timeout}"
    >
        <Say>${menuText}</Say>
    </Gather>
    <Say>We didn't receive any input. Goodbye!</Say>
    <Hangup/>
</Response>`;
  }
  /**
   * Generate TwiML for call forwarding
   */
  generateCallForward(destinations, ringStrategy = "simultaneous") {
    let dialContent = "";
    if (ringStrategy === "simultaneous") {
      dialContent = destinations.map((dest) => `<Number>${dest}</Number>`).join("\n        ");
    } else {
      dialContent = `<Number>${destinations[0]}</Number>`;
    }
    return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Dial timeout="30">
        ${dialContent}
    </Dial>
    <Say>The call could not be completed. Please try again later.</Say>
</Response>`;
  }
  /**
   * Generate error TwiML
   */
  generateError(message2 = "Sorry, there was an error placing your call.") {
    return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say>${message2}</Say>
    <Hangup/>
</Response>`;
  }
  /**
   * Generate TwiML for call queue
   */
  generateCallQueue(queueName, waitUrl = null) {
    const waitMusic = waitUrl ? `waitUrl="${waitUrl}"` : "";
    return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Enqueue ${waitMusic}>${queueName}</Enqueue>
</Response>`;
  }
};
function createTwiMLGenerator(env2) {
  return new TwiMLGenerator(env2);
}
__name(createTwiMLGenerator, "createTwiMLGenerator");

// src/modules/voice/callHandler.js
var CallHandler = class {
  static {
    __name(this, "CallHandler");
  }
  constructor(db, twilioClient) {
    this.db = db;
    this.twilioClient = twilioClient;
  }
  /**
   * Initiate outbound call
   */
  async initiateCall(userId, to, from) {
    console.log(`\u{1F4DE} Initiating call from ${from} to ${to} for user ${userId}`);
    const user = await this.db.prepare(
      "SELECT id, organization_id FROM users WHERE id = ?"
    ).bind(userId).first();
    if (!user) {
      throw new Error("User not found");
    }
    const phoneNumber = await this.db.prepare(
      "SELECT id FROM phone_numbers WHERE phone_number = ? AND organization_id = ?"
    ).bind(from, user.organization_id).first();
    if (!phoneNumber) {
      throw new Error("Phone number not found or does not belong to your organization");
    }
    return {
      success: true,
      message: "Call initiated",
      to,
      from,
      userId: user.id,
      organizationId: user.organization_id
    };
  }
  /**
   * Update call status
   */
  async updateCallStatus(callSid, status, duration = 0) {
    const now = Math.floor(Date.now() / 1e3);
    await this.db.prepare(`
            UPDATE calls 
            SET status = ?, duration = ?, updated_at = ?
            WHERE sid = ?
        `).bind(status, duration, now, callSid).run();
    console.log(`\u2705 Updated call ${callSid} status to ${status}`);
    return { success: true };
  }
  /**
   * Get call details
   */
  async getCallDetails(callSid) {
    const call = await this.db.prepare(
      "SELECT * FROM calls WHERE sid = ?"
    ).bind(callSid).first();
    return call;
  }
  /**
   * Get active calls for organization
   */
  async getActiveCalls(organizationId) {
    const result = await this.db.prepare(`
            SELECT * FROM calls 
            WHERE organization_id = ? 
            AND status IN ('initiated', 'ringing', 'in-progress')
            ORDER BY created_at DESC
        `).bind(organizationId).all();
    return result.results || [];
  }
};
function createCallHandler(db, twilioClient) {
  return new CallHandler(db, twilioClient);
}
__name(createCallHandler, "createCallHandler");

// src/routes/voice.js
var voice = new Hono2();
voice.use("*", async (c, next) => {
  const publicPaths = ["/twiml", "/status", "/recording-status", "/voicemail", "/ivr"];
  const isPublicPath = publicPaths.some((path) => c.req.path.includes(path));
  if (isPublicPath) {
    return await next();
  }
  try {
    const authHeader = c.req.header("Authorization");
    if (!authHeader) {
      return c.json({ error: "Authentication required" }, 401);
    }
    const token = authHeader.replace("Bearer ", "");
    const encoder2 = new TextEncoder();
    const { payload } = await jwtVerify(token, encoder2.encode(c.env.JWT_SECRET));
    const db = c.env.DB;
    const user = await db.prepare(
      "SELECT id, email, organization_id FROM users WHERE id = ?"
    ).bind(payload.id).first();
    if (!user) {
      return c.json({ error: "User not found" }, 401);
    }
    c.set("user", user);
    await next();
  } catch (error3) {
    console.error("Auth error:", error3);
    return c.json({ error: "Invalid token" }, 401);
  }
});
voice.get("/token", async (c) => {
  try {
    const user = c.get("user");
    const tokenGenerator = createTokenGenerator(c.env);
    const result = await tokenGenerator.generateToken(user.email);
    return c.json(result);
  } catch (error3) {
    console.error("Token generation error:", error3);
    return c.json({ error: "Failed to generate token: " + error3.message }, 500);
  }
});
voice.post("/call", async (c) => {
  try {
    const user = c.get("user");
    const { to, from } = await c.req.json();
    if (!to || !from) {
      return c.json({ error: "Missing required fields: to, from" }, 400);
    }
    const callHandler = createCallHandler(c.env.DB, null);
    const result = await callHandler.initiateCall(user.id, to, from);
    return c.json(result);
  } catch (error3) {
    console.error("Call error:", error3);
    return c.json({ error: error3.message }, 500);
  }
});
voice.post("/twiml", async (c) => {
  try {
    console.log("=== TWIML ENDPOINT ===");
    const body = await c.req.parseBody();
    const To = body.To || body.to;
    const From = body.From || body.from;
    console.log("\u{1F4DE} To:", To, "From:", From);
    if (!To) {
      const twimlGen2 = createTwiMLGenerator(c.env);
      return c.text(twimlGen2.generateError(), 200, {
        "Content-Type": "text/xml"
      });
    }
    if (!From) {
      console.error("\u26A0\uFE0F WARNING: No From parameter received!");
    }
    const twimlGen = createTwiMLGenerator(c.env);
    const twiml = twimlGen.generateOutboundCall(To, From, {
      record: true,
      recordingCallback: `${c.env.API_BASE_URL || "https://voipapp.shaikhrais.workers.dev"}/api/voice/recording-status`,
      statusCallback: `${c.env.API_BASE_URL || "https://voipapp.shaikhrais.workers.dev"}/api/voice/status`
    });
    console.log("\u{1F4C4} Generated TwiML");
    return c.text(twiml, 200, {
      "Content-Type": "text/xml"
    });
  } catch (error3) {
    console.error("TwiML error:", error3);
    const twimlGen = createTwiMLGenerator(c.env);
    return c.text(twimlGen.generateError(), 200, {
      "Content-Type": "text/xml"
    });
  }
});
voice.post("/status", async (c) => {
  try {
    const body = await c.req.parseBody();
    console.log("\u{1F4CA} Call status:", body.CallStatus);
    const callSid = body.CallSid;
    const callStatus = body.CallStatus;
    const callDuration = body.CallDuration;
    if (callSid) {
      const callHandler = createCallHandler(c.env.DB, null);
      await callHandler.updateCallStatus(callSid, callStatus, callDuration || 0);
    }
    return c.text("OK");
  } catch (error3) {
    console.error("Status callback error:", error3);
    return c.text("Error", 500);
  }
});
voice.post("/recording-status", async (c) => {
  try {
    const body = await c.req.parseBody();
    console.log("\u{1F399}\uFE0F Recording status:", body.RecordingStatus);
    const recordingSid = body.RecordingSid;
    const recordingUrl = body.RecordingUrl;
    const recordingDuration = body.RecordingDuration;
    const callSid = body.CallSid;
    if (recordingSid && callSid) {
      console.log(`\u2705 Recording ${recordingSid} for call ${callSid}`);
    }
    return c.text("OK");
  } catch (error3) {
    console.error("Recording callback error:", error3);
    return c.text("Error", 500);
  }
});
var voice_default = voice;

// src/helpers/organizations.js
var OrganizationHelper = class {
  static {
    __name(this, "OrganizationHelper");
  }
  constructor(db) {
    this.db = db;
  }
  // Get organization with full details
  async getOrganization(orgId) {
    return await this.db.prepare(
      "SELECT * FROM organizations_v2 WHERE id = ?"
    ).bind(orgId).first();
  }
  // Get organization hierarchy (parent chain)
  async getOrganizationHierarchy(orgId) {
    const hierarchy = [];
    let currentOrgId = orgId;
    while (currentOrgId) {
      const org = await this.getOrganization(currentOrgId);
      if (!org) break;
      hierarchy.push(org);
      currentOrgId = org.parent_organization_id;
    }
    return hierarchy;
  }
  // Get all child organizations
  async getChildOrganizations(parentOrgId, type = null) {
    let query = "SELECT * FROM organizations_v2 WHERE parent_organization_id = ?";
    const params = [parentOrgId];
    if (type) {
      query += " AND type = ?";
      params.push(type);
    }
    const result = await this.db.prepare(query).bind(...params).all();
    return result.results || [];
  }
  // Get all organizations in tree (recursive)
  async getOrganizationTree(rootOrgId) {
    const tree = [];
    const queue = [rootOrgId];
    while (queue.length > 0) {
      const currentOrgId = queue.shift();
      const org = await this.getOrganization(currentOrgId);
      if (org) {
        tree.push(org);
        const children = await this.getChildOrganizations(currentOrgId);
        queue.push(...children.map((c) => c.id));
      }
    }
    return tree;
  }
  // Check if user has permission in organization
  async hasPermission(userId, permission2) {
    const perms = await this.db.prepare(
      "SELECT * FROM user_permissions WHERE user_id = ?"
    ).bind(userId).first();
    if (!perms) return false;
    return perms[permission2] === 1;
  }
  // Check if organization can access another organization (hierarchy check)
  async canAccessOrganization(accessorOrgId, targetOrgId) {
    const accessor = await this.getOrganization(accessorOrgId);
    if (accessor?.type === "super_admin") return true;
    const targetHierarchy = await this.getOrganizationHierarchy(targetOrgId);
    return targetHierarchy.some((org) => org.id === accessorOrgId);
  }
  // Get pricing for organization
  async getPricing(orgId) {
    const pricing = await this.db.prepare(
      "SELECT * FROM pricing_tiers WHERE organization_id = ? LIMIT 1"
    ).bind(orgId).first();
    if (pricing) return pricing;
    const org = await this.getOrganization(orgId);
    return {
      call_rate_per_minute: org.call_rate_per_minute,
      sms_rate: org.sms_rate,
      number_monthly_fee: org.number_monthly_fee
    };
  }
  // Create transaction
  async createTransaction(orgId, type, amount, description, relatedId = null) {
    const org = await this.getOrganization(orgId);
    const balanceBefore = org.credits;
    const balanceAfter = type === "credit" ? balanceBefore + amount : balanceBefore - amount;
    const transactionId = `txn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    await this.db.prepare(`
            INSERT INTO transactions (
                id, organization_id, type, amount, description,
                balance_before, balance_after, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
      transactionId,
      orgId,
      type,
      amount,
      description,
      balanceBefore,
      balanceAfter,
      Math.floor(Date.now() / 1e3)
    ).run();
    await this.db.prepare(
      "UPDATE organizations_v2 SET credits = ? WHERE id = ?"
    ).bind(balanceAfter, orgId).run();
    return { transactionId, balanceAfter };
  }
  // Get organization stats
  async getOrganizationStats(orgId) {
    const [calls2, messages2, numbers, users] = await Promise.all([
      this.db.prepare(
        "SELECT COUNT(*) as count FROM calls WHERE organization_id = ?"
      ).bind(orgId).first(),
      this.db.prepare(
        "SELECT COUNT(*) as count FROM messages WHERE organization_id = ?"
      ).bind(orgId).first(),
      this.db.prepare(
        "SELECT COUNT(*) as count FROM phone_numbers WHERE organization_id = ?"
      ).bind(orgId).first(),
      this.db.prepare(
        "SELECT COUNT(*) as count FROM users WHERE organization_id = ?"
      ).bind(orgId).first()
    ]);
    return {
      totalCalls: calls2?.count || 0,
      totalMessages: messages2?.count || 0,
      totalNumbers: numbers?.count || 0,
      totalUsers: users?.count || 0
    };
  }
};
function createOrgHelper(db) {
  return new OrganizationHelper(db);
}
__name(createOrgHelper, "createOrgHelper");

// src/routes/admin.js
var admin = new Hono2();
admin.use("*", async (c, next) => {
  try {
    const authHeader = c.req.header("Authorization");
    if (!authHeader) {
      return c.json({ error: "Authentication required" }, 401);
    }
    const token = authHeader.replace("Bearer ", "");
    const encoder2 = new TextEncoder();
    const { payload } = await jwtVerify(token, encoder2.encode(c.env.JWT_SECRET));
    const db = c.env.DB;
    const user = await db.prepare(
      "SELECT id, email, role, organization_id FROM users WHERE id = ?"
    ).bind(payload.id).first();
    if (!user) {
      return c.json({ error: "User not found" }, 401);
    }
    if (user.role !== "super_admin" && user.role !== "admin") {
      return c.json({ error: "Super admin access required" }, 403);
    }
    c.set("user", user);
    await next();
  } catch (error3) {
    console.error("Auth error:", error3);
    return c.json({ error: "Invalid token" }, 401);
  }
});
admin.get("/dashboard", async (c) => {
  try {
    const db = c.env.DB;
    const [agencies, businesses, users, numbers, calls2, messages2] = await Promise.all([
      db.prepare("SELECT COUNT(*) as count FROM organizations_v2 WHERE type = ?").bind("agency").first(),
      db.prepare("SELECT COUNT(*) as count FROM organizations_v2 WHERE type = ?").bind("business").first(),
      db.prepare("SELECT COUNT(*) as count FROM users").first(),
      db.prepare("SELECT COUNT(*) as count FROM phone_numbers").first(),
      db.prepare("SELECT COUNT(*) as count FROM calls").first(),
      db.prepare("SELECT COUNT(*) as count FROM messages").first()
    ]);
    const revenue = await db.prepare(
      "SELECT SUM(amount) as total FROM transactions WHERE type = ?"
    ).bind("debit").first();
    const recentOrgs = await db.prepare(
      "SELECT * FROM organizations_v2 ORDER BY created_at DESC LIMIT 5"
    ).all();
    return c.json({
      stats: {
        totalAgencies: agencies?.count || 0,
        totalBusinesses: businesses?.count || 0,
        totalUsers: users?.count || 0,
        totalNumbers: numbers?.count || 0,
        totalCalls: calls2?.count || 0,
        totalMessages: messages2?.count || 0,
        totalRevenue: revenue?.total || 0
      },
      recentOrganizations: recentOrgs.results || []
    });
  } catch (error3) {
    console.error("Dashboard error:", error3);
    return c.json({ error: "Failed to fetch dashboard data" }, 500);
  }
});
admin.get("/agencies", async (c) => {
  try {
    const db = c.env.DB;
    const agencies = await db.prepare(`
            SELECT o.*, u.email as owner_email
            FROM organizations_v2 o
            LEFT JOIN users u ON o.owner_user_id = u.id
            WHERE o.type = 'agency'
            ORDER BY o.created_at DESC
        `).all();
    const agenciesWithStats = await Promise.all(
      (agencies.results || []).map(async (agency2) => {
        const customers = await db.prepare(
          "SELECT COUNT(*) as count FROM organizations_v2 WHERE parent_organization_id = ?"
        ).bind(agency2.id).first();
        return {
          ...agency2,
          customerCount: customers?.count || 0
        };
      })
    );
    return c.json({ agencies: agenciesWithStats });
  } catch (error3) {
    console.error("List agencies error:", error3);
    return c.json({ error: "Failed to fetch agencies" }, 500);
  }
});
admin.get("/agencies/:id", async (c) => {
  try {
    const db = c.env.DB;
    const agencyId = c.req.param("id");
    const orgHelper = createOrgHelper(db);
    const agency2 = await orgHelper.getOrganization(agencyId);
    if (!agency2 || agency2.type !== "agency") {
      return c.json({ error: "Agency not found" }, 404);
    }
    const customers = await orgHelper.getChildOrganizations(agencyId, "business");
    const stats = await orgHelper.getOrganizationStats(agencyId);
    return c.json({
      agency: agency2,
      customers,
      stats
    });
  } catch (error3) {
    console.error("Get agency error:", error3);
    return c.json({ error: "Failed to fetch agency details" }, 500);
  }
});
admin.post("/agencies", async (c) => {
  try {
    const db = c.env.DB;
    const body = await c.req.json();
    const { name, email, password, billing_email, call_rate, sms_rate, number_fee } = body;
    if (!name || !email || !password) {
      return c.json({ error: "Missing required fields: name, email, password" }, 400);
    }
    const existingUser = await db.prepare(
      "SELECT id FROM users WHERE email = ?"
    ).bind(email).first();
    if (existingUser) {
      return c.json({ error: "Email already exists" }, 400);
    }
    const orgId = `org-agency-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const userId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const encoder2 = new TextEncoder();
    const data = encoder2.encode(password);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashedPassword = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    await db.prepare(`
            INSERT INTO organizations_v2 (
                id, name, type, parent_organization_id, owner_user_id,
                credits, billing_email, call_rate_per_minute, sms_rate, number_monthly_fee,
                status, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
      orgId,
      name,
      "agency",
      "org-super-admin",
      userId,
      0,
      billing_email || email,
      call_rate || 0.02,
      sms_rate || 0.01,
      number_fee || 2,
      "active",
      Math.floor(Date.now() / 1e3),
      Math.floor(Date.now() / 1e3)
    ).run();
    await db.prepare(`
            INSERT INTO users (
                id, email, password, role, organization_id, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `).bind(
      userId,
      email,
      hashedPassword,
      "agency_admin",
      orgId,
      Math.floor(Date.now() / 1e3),
      Math.floor(Date.now() / 1e3)
    ).run();
    await db.prepare(`
            INSERT INTO user_permissions (
                user_id, full_name, can_make_calls, can_send_sms, 
                can_buy_numbers, can_manage_users, can_view_billing
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `).bind(userId, name, 1, 1, 1, 1, 1).run();
    const tierId = `tier-${orgId}`;
    await db.prepare(`
            INSERT INTO pricing_tiers (
                id, organization_id, name, call_rate_per_minute, sms_rate, number_monthly_fee
            ) VALUES (?, ?, ?, ?, ?, ?)
        `).bind(
      tierId,
      orgId,
      "Agency Pricing",
      call_rate || 0.02,
      sms_rate || 0.01,
      number_fee || 2
    ).run();
    return c.json({
      success: true,
      agency: {
        id: orgId,
        name,
        email
      }
    }, 201);
  } catch (error3) {
    console.error("Create agency error:", error3);
    return c.json({ error: "Failed to create agency: " + error3.message }, 500);
  }
});
admin.put("/agencies/:id", async (c) => {
  try {
    const db = c.env.DB;
    const agencyId = c.req.param("id");
    const body = await c.req.json();
    const { name, billing_email, call_rate, sms_rate, number_fee, status } = body;
    await db.prepare(`
            UPDATE organizations_v2 
            SET name = COALESCE(?, name),
                billing_email = COALESCE(?, billing_email),
                call_rate_per_minute = COALESCE(?, call_rate_per_minute),
                sms_rate = COALESCE(?, sms_rate),
                number_monthly_fee = COALESCE(?, number_monthly_fee),
                status = COALESCE(?, status),
                updated_at = ?
            WHERE id = ? AND type = 'agency'
        `).bind(
      name,
      billing_email,
      call_rate,
      sms_rate,
      number_fee,
      status,
      Math.floor(Date.now() / 1e3),
      agencyId
    ).run();
    return c.json({ success: true });
  } catch (error3) {
    console.error("Update agency error:", error3);
    return c.json({ error: "Failed to update agency" }, 500);
  }
});
admin.delete("/agencies/:id", async (c) => {
  try {
    const db = c.env.DB;
    const agencyId = c.req.param("id");
    await db.prepare(
      "UPDATE organizations_v2 SET status = ?, updated_at = ? WHERE id = ?"
    ).bind("cancelled", Math.floor(Date.now() / 1e3), agencyId).run();
    return c.json({ success: true });
  } catch (error3) {
    console.error("Delete agency error:", error3);
    return c.json({ error: "Failed to delete agency" }, 500);
  }
});
admin.get("/analytics", async (c) => {
  try {
    const db = c.env.DB;
    const revenueByAgency = await db.prepare(`
            SELECT o.id, o.name, SUM(t.amount) as revenue
            FROM organizations_v2 o
            LEFT JOIN transactions t ON o.id = t.organization_id
            WHERE o.type = 'agency' AND t.type = 'debit'
            GROUP BY o.id, o.name
            ORDER BY revenue DESC
        `).all();
    const thirtyDaysAgo = Math.floor(Date.now() / 1e3) - 30 * 24 * 60 * 60;
    const callVolume = await db.prepare(`
            SELECT DATE(created_at, 'unixepoch') as date, COUNT(*) as count
            FROM calls
            WHERE created_at >= ?
            GROUP BY date
            ORDER BY date
        `).bind(thirtyDaysAgo).all();
    const userGrowth = await db.prepare(`
            SELECT DATE(created_at, 'unixepoch') as date, COUNT(*) as count
            FROM users
            WHERE created_at >= ?
            GROUP BY date
            ORDER BY date
        `).bind(thirtyDaysAgo).all();
    return c.json({
      revenueByAgency: revenueByAgency.results || [],
      callVolume: callVolume.results || [],
      userGrowth: userGrowth.results || []
    });
  } catch (error3) {
    console.error("Analytics error:", error3);
    return c.json({ error: "Failed to fetch analytics" }, 500);
  }
});
admin.get("/numbers", async (c) => {
  try {
    const db = c.env.DB;
    const numbers = await db.prepare(`
            SELECT 
                p.id,
                p.sid,
                p.phone_number,
                p.friendly_name,
                p.organization_id,
                p.created_at,
                p.updated_at,
                o.name as organization_name,
                o.type as organization_type
            FROM phone_numbers p
            LEFT JOIN organizations_v2 o ON p.organization_id = o.id
            ORDER BY p.created_at DESC
        `).all();
    return c.json({
      success: true,
      numbers: numbers.results || [],
      total: numbers.results?.length || 0
    });
  } catch (error3) {
    console.error("Get numbers error:", error3);
    return c.json({ error: "Failed to fetch phone numbers" }, 500);
  }
});
var admin_default = admin;

// src/routes/agency.js
var agency = new Hono2();
agency.use("*", async (c, next) => {
  try {
    const authHeader = c.req.header("Authorization");
    if (!authHeader) {
      return c.json({ error: "Authentication required" }, 401);
    }
    const token = authHeader.replace("Bearer ", "");
    const encoder2 = new TextEncoder();
    const { payload } = await jwtVerify(token, encoder2.encode(c.env.JWT_SECRET));
    const db = c.env.DB;
    const user = await db.prepare(
      "SELECT id, email, role, organization_id FROM users WHERE id = ?"
    ).bind(payload.id).first();
    if (!user) {
      return c.json({ error: "User not found" }, 401);
    }
    if (user.role !== "admin" && user.role !== "super_admin" && user.role !== "agency_admin") {
      return c.json({ error: "Agency admin access required" }, 403);
    }
    c.set("user", user);
    await next();
  } catch (error3) {
    console.error("Auth error:", error3);
    return c.json({ error: "Invalid token" }, 401);
  }
});
agency.get("/dashboard", async (c) => {
  try {
    const db = c.env.DB;
    const user = c.get("user");
    const orgHelper = createOrgHelper(db);
    const agency2 = await orgHelper.getOrganization(user.organization_id);
    const customers = await orgHelper.getChildOrganizations(user.organization_id, "business");
    let totalCalls = 0;
    let totalMessages = 0;
    let totalNumbers = 0;
    let totalUsers = 0;
    for (const customer of customers) {
      const stats = await orgHelper.getOrganizationStats(customer.id);
      totalCalls += stats.totalCalls;
      totalMessages += stats.totalMessages;
      totalNumbers += stats.totalNumbers;
      totalUsers += stats.totalUsers;
    }
    const revenue = await db.prepare(
      "SELECT SUM(amount) as total FROM transactions WHERE organization_id = ? AND type = ?"
    ).bind(user.organization_id, "credit").first();
    return c.json({
      agency: agency2,
      stats: {
        totalCustomers: customers.length,
        totalCalls,
        totalMessages,
        totalNumbers,
        totalUsers,
        totalRevenue: revenue?.total || 0,
        credits: agency2.credits
      },
      recentCustomers: customers.slice(0, 5)
    });
  } catch (error3) {
    console.error("Agency dashboard error:", error3);
    return c.json({ error: "Failed to fetch dashboard data" }, 500);
  }
});
agency.get("/customers", async (c) => {
  try {
    const db = c.env.DB;
    const user = c.get("user");
    const orgHelper = createOrgHelper(db);
    const customers = await orgHelper.getChildOrganizations(user.organization_id, "business");
    const customersWithStats = await Promise.all(
      customers.map(async (customer) => {
        const stats = await orgHelper.getOrganizationStats(customer.id);
        const users = await db.prepare(
          "SELECT COUNT(*) as count FROM users WHERE organization_id = ?"
        ).bind(customer.id).first();
        return {
          ...customer,
          ...stats,
          userCount: users?.count || 0
        };
      })
    );
    return c.json({ customers: customersWithStats });
  } catch (error3) {
    console.error("List customers error:", error3);
    return c.json({ error: "Failed to fetch customers" }, 500);
  }
});
agency.post("/customers", async (c) => {
  try {
    const db = c.env.DB;
    const user = c.get("user");
    const body = await c.req.json();
    const { name, email, password, call_rate, sms_rate, number_fee } = body;
    if (!name || !email || !password) {
      return c.json({ error: "Missing required fields" }, 400);
    }
    const existingUser = await db.prepare(
      "SELECT id FROM users WHERE email = ?"
    ).bind(email).first();
    if (existingUser) {
      return c.json({ error: "Email already exists" }, 400);
    }
    const agency2 = await db.prepare(
      "SELECT * FROM organizations_v2 WHERE id = ?"
    ).bind(user.organization_id).first();
    const orgId = `org-business-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const userId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const encoder2 = new TextEncoder();
    const data = encoder2.encode(password);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashedPassword = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    await db.prepare(`
            INSERT INTO organizations_v2 (
                id, name, type, parent_organization_id, owner_user_id,
                credits, billing_email, call_rate_per_minute, sms_rate, number_monthly_fee,
                status, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
      orgId,
      name,
      "business",
      user.organization_id,
      userId,
      0,
      email,
      call_rate || agency2.call_rate_per_minute,
      sms_rate || agency2.sms_rate,
      number_fee || agency2.number_monthly_fee,
      "active",
      Math.floor(Date.now() / 1e3),
      Math.floor(Date.now() / 1e3)
    ).run();
    await db.prepare(`
            INSERT INTO users (
                id, email, password, role, organization_id, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `).bind(
      userId,
      email,
      hashedPassword,
      "business_admin",
      orgId,
      Math.floor(Date.now() / 1e3),
      Math.floor(Date.now() / 1e3)
    ).run();
    await db.prepare(`
            INSERT INTO user_permissions (
                user_id, full_name, can_make_calls, can_send_sms,
                can_buy_numbers, can_manage_users, can_view_billing
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `).bind(userId, name, 1, 1, 1, 1, 1).run();
    return c.json({
      success: true,
      customer: { id: orgId, name, email }
    }, 201);
  } catch (error3) {
    console.error("Create customer error:", error3);
    return c.json({ error: "Failed to create customer: " + error3.message }, 500);
  }
});
agency.put("/customers/:id", async (c) => {
  try {
    const db = c.env.DB;
    const user = c.get("user");
    const customerId = c.req.param("id");
    const body = await c.req.json();
    const customer = await db.prepare(
      "SELECT * FROM organizations_v2 WHERE id = ? AND parent_organization_id = ?"
    ).bind(customerId, user.organization_id).first();
    if (!customer) {
      return c.json({ error: "Customer not found" }, 404);
    }
    const { name, call_rate, sms_rate, number_fee, status } = body;
    await db.prepare(`
            UPDATE organizations_v2
            SET name = COALESCE(?, name),
                call_rate_per_minute = COALESCE(?, call_rate_per_minute),
                sms_rate = COALESCE(?, sms_rate),
                number_monthly_fee = COALESCE(?, number_monthly_fee),
                status = COALESCE(?, status),
                updated_at = ?
            WHERE id = ?
        `).bind(
      name,
      call_rate,
      sms_rate,
      number_fee,
      status,
      Math.floor(Date.now() / 1e3),
      customerId
    ).run();
    return c.json({ success: true });
  } catch (error3) {
    console.error("Update customer error:", error3);
    return c.json({ error: "Failed to update customer" }, 500);
  }
});
agency.get("/revenue", async (c) => {
  try {
    const db = c.env.DB;
    const user = c.get("user");
    const revenueByCustomer = await db.prepare(`
            SELECT o.id, o.name, SUM(t.amount) as revenue
            FROM organizations_v2 o
            LEFT JOIN transactions t ON o.id = t.organization_id
            WHERE o.parent_organization_id = ? AND t.type = 'debit'
            GROUP BY o.id, o.name
            ORDER BY revenue DESC
        `).bind(user.organization_id).all();
    return c.json({
      revenueByCustomer: revenueByCustomer.results || []
    });
  } catch (error3) {
    console.error("Revenue error:", error3);
    return c.json({ error: "Failed to fetch revenue data" }, 500);
  }
});
var agency_default = agency;

// src/routes/business.js
var business = new Hono2();
business.use("*", async (c, next) => {
  try {
    const authHeader = c.req.header("Authorization");
    if (!authHeader) {
      return c.json({ error: "Authentication required" }, 401);
    }
    const token = authHeader.replace("Bearer ", "");
    const encoder2 = new TextEncoder();
    const { payload } = await jwtVerify(token, encoder2.encode(c.env.JWT_SECRET));
    const db = c.env.DB;
    const user = await db.prepare(
      "SELECT id, email, role, organization_id FROM users WHERE id = ?"
    ).bind(payload.id).first();
    if (!user) {
      return c.json({ error: "User not found" }, 401);
    }
    if (user.role !== "admin" && user.role !== "super_admin" && user.role !== "business_admin") {
      return c.json({ error: "Business admin access required" }, 403);
    }
    c.set("user", user);
    await next();
  } catch (error3) {
    console.error("Auth error:", error3);
    return c.json({ error: "Invalid token" }, 401);
  }
});
business.get("/team", async (c) => {
  try {
    const db = c.env.DB;
    const user = c.get("user");
    const team = await db.prepare(`
            SELECT u.id, u.email, u.role, u.created_at,
                   p.full_name, p.can_make_calls, p.can_send_sms,
                   p.can_buy_numbers, p.can_manage_users, p.can_view_billing
            FROM users u
            LEFT JOIN user_permissions p ON u.id = p.user_id
            WHERE u.organization_id = ?
            ORDER BY u.created_at DESC
        `).bind(user.organization_id).all();
    return c.json({ team: team.results || [] });
  } catch (error3) {
    console.error("Get team error:", error3);
    return c.json({ error: "Failed to fetch team" }, 500);
  }
});
business.post("/team/invite", async (c) => {
  try {
    const db = c.env.DB;
    const user = c.get("user");
    const body = await c.req.json();
    const { email, role, permissions } = body;
    if (!email || !role) {
      return c.json({ error: "Missing required fields" }, 400);
    }
    const existingUser = await db.prepare(
      "SELECT id FROM users WHERE email = ?"
    ).bind(email).first();
    if (existingUser) {
      return c.json({ error: "Email already exists" }, 400);
    }
    const token = Math.random().toString(36).substr(2) + Date.now().toString(36);
    const invitationId = `inv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const expiresAt = Math.floor(Date.now() / 1e3) + 7 * 24 * 60 * 60;
    await db.prepare(`
            INSERT INTO invitations (
                id, email, organization_id, invited_by_user_id,
                role, token, status, expires_at, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
      invitationId,
      email,
      user.organization_id,
      user.id,
      role,
      token,
      "pending",
      expiresAt,
      Math.floor(Date.now() / 1e3)
    ).run();
    const invitationLink = `https://main.voipapp-frontend.pages.dev/invite/${token}`;
    return c.json({
      success: true,
      invitationLink,
      message: "Invitation created. Send this link to the user."
    });
  } catch (error3) {
    console.error("Invite error:", error3);
    return c.json({ error: "Failed to create invitation" }, 500);
  }
});
business.put("/team/:userId", async (c) => {
  try {
    const db = c.env.DB;
    const user = c.get("user");
    const userId = c.req.param("userId");
    const body = await c.req.json();
    const teamMember = await db.prepare(
      "SELECT * FROM users WHERE id = ? AND organization_id = ?"
    ).bind(userId, user.organization_id).first();
    if (!teamMember) {
      return c.json({ error: "User not found" }, 404);
    }
    const { can_make_calls, can_send_sms, can_buy_numbers, can_manage_users, can_view_billing } = body;
    await db.prepare(`
            UPDATE user_permissions
            SET can_make_calls = COALESCE(?, can_make_calls),
                can_send_sms = COALESCE(?, can_send_sms),
                can_buy_numbers = COALESCE(?, can_buy_numbers),
                can_manage_users = COALESCE(?, can_manage_users),
                can_view_billing = COALESCE(?, can_view_billing),
                updated_at = ?
            WHERE user_id = ?
        `).bind(
      can_make_calls,
      can_send_sms,
      can_buy_numbers,
      can_manage_users,
      can_view_billing,
      Math.floor(Date.now() / 1e3),
      userId
    ).run();
    return c.json({ success: true });
  } catch (error3) {
    console.error("Update permissions error:", error3);
    return c.json({ error: "Failed to update permissions" }, 500);
  }
});
business.delete("/team/:userId", async (c) => {
  try {
    const db = c.env.DB;
    const user = c.get("user");
    const userId = c.req.param("userId");
    const teamMember = await db.prepare(
      "SELECT * FROM users WHERE id = ? AND organization_id = ?"
    ).bind(userId, user.organization_id).first();
    if (!teamMember) {
      return c.json({ error: "User not found" }, 404);
    }
    if (userId === user.id) {
      return c.json({ error: "Cannot remove yourself" }, 400);
    }
    await db.prepare("DELETE FROM users WHERE id = ?").bind(userId).run();
    await db.prepare("DELETE FROM user_permissions WHERE user_id = ?").bind(userId).run();
    return c.json({ success: true });
  } catch (error3) {
    console.error("Remove team member error:", error3);
    return c.json({ error: "Failed to remove team member" }, 500);
  }
});
var business_default = business;

// src/routes/calls.js
var calls = new Hono2();
calls.use("*", async (c, next) => {
  try {
    const authHeader = c.req.header("Authorization");
    if (!authHeader) {
      return c.json({ error: "Authentication required" }, 401);
    }
    const token = authHeader.replace("Bearer ", "");
    const encoder2 = new TextEncoder();
    const { payload } = await jwtVerify(token, encoder2.encode(c.env.JWT_SECRET));
    const db = c.env.DB;
    const user = await db.prepare(
      "SELECT id, email, role, organization_id FROM users WHERE id = ?"
    ).bind(payload.id).first();
    if (!user) {
      return c.json({ error: "User not found" }, 401);
    }
    c.set("user", user);
    await next();
  } catch (error3) {
    console.error("Auth error:", error3);
    return c.json({ error: "Invalid token" }, 401);
  }
});
calls.get("/recent", async (c) => {
  try {
    const db = c.env.DB;
    const user = c.get("user");
    console.log("Fetching recent calls for user:", user.email, "role:", user.role);
    let query = "SELECT * FROM calls";
    let result;
    if (user.role !== "super_admin" && user.role !== "admin" && user.role !== "business_admin" && user.role !== "agency_admin") {
      query += " WHERE user_id = ? ORDER BY created_at DESC LIMIT 50";
      result = await db.prepare(query).bind(user.id).all();
    } else if (user.role === "admin" || user.role === "business_admin" || user.role === "agency_admin") {
      query += " WHERE organization_id = ? ORDER BY created_at DESC LIMIT 50";
      result = await db.prepare(query).bind(user.organization_id).all();
    } else {
      query += " ORDER BY created_at DESC LIMIT 50";
      result = await db.prepare(query).all();
    }
    console.log("Found calls:", result.results?.length || 0);
    return c.json({
      success: true,
      calls: result.results || []
    });
  } catch (error3) {
    console.error("Get recent calls error:", error3);
    console.error("Error stack:", error3.stack);
    return c.json({ error: "Failed to fetch calls: " + error3.message }, 500);
  }
});
calls.post("/log", async (c) => {
  try {
    const db = c.env.DB;
    const user = c.get("user");
    const body = await c.req.json();
    console.log("Logging call - User:", user.email, "Body:", JSON.stringify(body));
    const { sid, from_number, to_number, direction } = body;
    const callId = `call-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    console.log("Inserting call:", callId, "SID:", sid, "From:", from_number, "To:", to_number);
    await db.prepare(`
            INSERT INTO calls (
                id, sid, from_number, to_number, status, direction,
                organization_id, user_id, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
      callId,
      sid,
      from_number,
      to_number,
      "initiated",
      direction,
      user.organization_id,
      user.id,
      Math.floor(Date.now() / 1e3),
      Math.floor(Date.now() / 1e3)
    ).run();
    console.log("Call logged successfully:", callId);
    return c.json({
      success: true,
      callId,
      sid
    });
  } catch (error3) {
    console.error("Log call error:", error3);
    console.error("Error message:", error3.message);
    console.error("Error stack:", error3.stack);
    return c.json({ error: "Failed to log call: " + error3.message }, 500);
  }
});
calls.put("/update/:sid", async (c) => {
  try {
    const db = c.env.DB;
    const user = c.get("user");
    const { sid } = c.req.param();
    const body = await c.req.json();
    const { status, duration, sid: newSid } = body;
    console.log("Updating call:", sid, "Body:", JSON.stringify(body));
    if (newSid && newSid !== sid) {
      await db.prepare(`
                UPDATE calls 
                SET sid = ?, 
                    status = ?,
                    updated_at = ?
                WHERE sid = ? AND user_id = ?
            `).bind(
        newSid,
        status || "ringing",
        Math.floor(Date.now() / 1e3),
        sid,
        user.id
      ).run();
      console.log("Call SID updated from", sid, "to", newSid);
    } else {
      await db.prepare(`
                UPDATE calls 
                SET status = ?, 
                    duration = ?,
                    updated_at = ?
                WHERE sid = ? AND user_id = ?
            `).bind(
        status,
        duration || 0,
        Math.floor(Date.now() / 1e3),
        sid,
        user.id
      ).run();
      console.log("Call status updated to:", status);
    }
    return c.json({
      success: true
    });
  } catch (error3) {
    console.error("Update call error:", error3);
    return c.json({ error: "Failed to update call: " + error3.message }, 500);
  }
});
var calls_default = calls;

// src/routes/messages.js
var messages = new Hono2();
messages.use("*", async (c, next) => {
  try {
    const authHeader = c.req.header("Authorization");
    if (!authHeader) {
      return c.json({ error: "Authentication required" }, 401);
    }
    const token = authHeader.replace("Bearer ", "");
    const encoder2 = new TextEncoder();
    const { payload } = await jwtVerify(token, encoder2.encode(c.env.JWT_SECRET));
    const db = c.env.DB;
    const user = await db.prepare(
      "SELECT id, email, role, organization_id FROM users WHERE id = ?"
    ).bind(payload.id).first();
    if (!user) {
      return c.json({ error: "User not found" }, 401);
    }
    c.set("user", user);
    await next();
  } catch (error3) {
    console.error("Auth error:", error3);
    return c.json({ error: "Invalid token" }, 401);
  }
});
messages.get("/recent", async (c) => {
  try {
    const db = c.env.DB;
    const user = c.get("user");
    console.log("Fetching recent messages for user:", user.email);
    let query = "SELECT * FROM messages";
    let result;
    if (user.role !== "super_admin" && user.role !== "admin") {
      query += " WHERE user_id = ? ORDER BY created_at DESC LIMIT 50";
      result = await db.prepare(query).bind(user.id).all();
    } else if (user.role === "admin") {
      query += " WHERE organization_id = ? ORDER BY created_at DESC LIMIT 50";
      result = await db.prepare(query).bind(user.organization_id).all();
    } else {
      query += " ORDER BY created_at DESC LIMIT 50";
      result = await db.prepare(query).all();
    }
    return c.json({
      success: true,
      messages: result.results || []
    });
  } catch (error3) {
    console.error("Get recent messages error:", error3);
    return c.json({ error: "Failed to fetch messages: " + error3.message }, 500);
  }
});
messages.get("/conversation/:phoneNumber", async (c) => {
  try {
    const db = c.env.DB;
    const user = c.get("user");
    const { phoneNumber } = c.req.param();
    console.log("Fetching conversation with:", phoneNumber);
    const result = await db.prepare(`
            SELECT * FROM messages 
            WHERE user_id = ? 
            AND (from_number = ? OR to_number = ?)
            ORDER BY created_at ASC
        `).bind(user.id, phoneNumber, phoneNumber).all();
    return c.json({
      success: true,
      messages: result.results || []
    });
  } catch (error3) {
    console.error("Get conversation error:", error3);
    return c.json({ error: "Failed to fetch conversation: " + error3.message }, 500);
  }
});
messages.post("/send", async (c) => {
  try {
    const db = c.env.DB;
    const user = c.get("user");
    const { from_number, to_number, body } = await c.req.json();
    console.log("Sending message from:", from_number, "to:", to_number);
    const twilio = createTwilioClient(c.env);
    const twilioMessage = await twilio.sendMessage(from_number, to_number, body);
    const messageId = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    await db.prepare(`
            INSERT INTO messages (
                id, sid, from_number, to_number, body, status, direction,
                organization_id, user_id, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
      messageId,
      twilioMessage.sid,
      from_number,
      to_number,
      body,
      twilioMessage.status,
      "outbound",
      user.organization_id,
      user.id,
      Math.floor(Date.now() / 1e3),
      Math.floor(Date.now() / 1e3)
    ).run();
    console.log("Message sent and logged:", messageId);
    return c.json({
      success: true,
      messageId,
      sid: twilioMessage.sid
    });
  } catch (error3) {
    console.error("Send message error:", error3);
    return c.json({ error: "Failed to send message: " + error3.message }, 500);
  }
});
messages.get("/conversations", async (c) => {
  try {
    const db = c.env.DB;
    const user = c.get("user");
    console.log("Fetching conversations for user:", user.email);
    const result = await db.prepare(`
            SELECT 
                CASE 
                    WHEN direction = 'outbound' THEN to_number 
                    ELSE from_number 
                END as contact_number,
                MAX(created_at) as last_message_time,
                COUNT(*) as message_count
            FROM messages 
            WHERE user_id = ?
            GROUP BY contact_number
            ORDER BY last_message_time DESC
        `).bind(user.id).all();
    return c.json({
      success: true,
      conversations: result.results || []
    });
  } catch (error3) {
    console.error("Get conversations error:", error3);
    return c.json({ error: "Failed to fetch conversations: " + error3.message }, 500);
  }
});
var messages_default = messages;

// src/routes/routing.js
var routing = new Hono2();
routing.use("*", async (c, next) => {
  try {
    const authHeader = c.req.header("Authorization");
    if (!authHeader) {
      return c.json({ error: "Authentication required" }, 401);
    }
    const token = authHeader.replace("Bearer ", "");
    const encoder2 = new TextEncoder();
    const { payload } = await jwtVerify(token, encoder2.encode(c.env.JWT_SECRET));
    const db = c.env.DB;
    const user = await db.prepare(
      "SELECT id, email, role, organization_id FROM users WHERE id = ?"
    ).bind(payload.id).first();
    if (!user) {
      return c.json({ error: "User not found" }, 401);
    }
    c.set("user", user);
    await next();
  } catch (error3) {
    console.error("Auth error:", error3);
    return c.json({ error: "Invalid token" }, 401);
  }
});
routing.get("/config", async (c) => {
  try {
    const db = c.env.DB;
    const user = c.get("user");
    let config2 = await db.prepare(
      "SELECT * FROM call_routing_config WHERE user_id = ?"
    ).bind(user.id).first();
    if (!config2) {
      const defaultConfig = {
        id: `config-${user.id}`,
        user_id: user.id,
        organization_id: user.organization_id,
        routing_mode: "simultaneous",
        ring_all_devices: 1,
        ring_timeout: 30,
        ai_enabled: 0,
        ai_provider: null,
        ai_greeting: "Hello, I am an AI assistant. How can I help you today?",
        ai_can_transfer: 1,
        ai_take_messages: 1,
        business_hours_enabled: 0,
        business_hours_json: JSON.stringify({
          monday: { start: "09:00", end: "17:00", enabled: true },
          tuesday: { start: "09:00", end: "17:00", enabled: true },
          wednesday: { start: "09:00", end: "17:00", enabled: true },
          thursday: { start: "09:00", end: "17:00", enabled: true },
          friday: { start: "09:00", end: "17:00", enabled: true },
          saturday: { enabled: false },
          sunday: { enabled: false }
        }),
        timezone: "America/New_York",
        after_hours_mode: "voicemail",
        after_hours_forward_to: null,
        fallback_chain: JSON.stringify([
          { type: "ring_devices", timeout: 30 },
          { type: "voicemail", timeout: 60 }
        ]),
        fallback_timeout: 30,
        voicemail_enabled: 1,
        voicemail_greeting: null,
        missed_call_sms: 1,
        missed_call_email: 1,
        created_at: Math.floor(Date.now() / 1e3),
        updated_at: Math.floor(Date.now() / 1e3)
      };
      await db.prepare(`
                INSERT INTO call_routing_config VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).bind(...Object.values(defaultConfig)).run();
      config2 = defaultConfig;
    }
    const parsedConfig = {
      ...config2,
      business_hours_json: config2.business_hours_json ? JSON.parse(config2.business_hours_json) : null,
      fallback_chain: config2.fallback_chain ? JSON.parse(config2.fallback_chain) : []
    };
    return c.json({
      success: true,
      config: parsedConfig
    });
  } catch (error3) {
    console.error("Get config error:", error3);
    return c.json({ error: "Failed to get configuration: " + error3.message }, 500);
  }
});
routing.put("/config", async (c) => {
  try {
    const db = c.env.DB;
    const user = c.get("user");
    const body = await c.req.json();
    const config2 = {
      ...body,
      business_hours_json: body.business_hours_json ? JSON.stringify(body.business_hours_json) : null,
      fallback_chain: body.fallback_chain ? JSON.stringify(body.fallback_chain) : null,
      updated_at: Math.floor(Date.now() / 1e3)
    };
    await db.prepare(`
            UPDATE call_routing_config 
            SET routing_mode = ?,
                ring_all_devices = ?,
                ring_timeout = ?,
                ai_enabled = ?,
                ai_provider = ?,
                ai_greeting = ?,
                ai_can_transfer = ?,
                ai_take_messages = ?,
                business_hours_enabled = ?,
                business_hours_json = ?,
                timezone = ?,
                after_hours_mode = ?,
                after_hours_forward_to = ?,
                fallback_chain = ?,
                fallback_timeout = ?,
                voicemail_enabled = ?,
                voicemail_greeting = ?,
                missed_call_sms = ?,
                missed_call_email = ?,
                updated_at = ?
            WHERE user_id = ?
        `).bind(
      config2.routing_mode,
      config2.ring_all_devices ? 1 : 0,
      config2.ring_timeout,
      config2.ai_enabled ? 1 : 0,
      config2.ai_provider,
      config2.ai_greeting,
      config2.ai_can_transfer ? 1 : 0,
      config2.ai_take_messages ? 1 : 0,
      config2.business_hours_enabled ? 1 : 0,
      config2.business_hours_json,
      config2.timezone,
      config2.after_hours_mode,
      config2.after_hours_forward_to,
      config2.fallback_chain,
      config2.fallback_timeout,
      config2.voicemail_enabled ? 1 : 0,
      config2.voicemail_greeting,
      config2.missed_call_sms ? 1 : 0,
      config2.missed_call_email ? 1 : 0,
      config2.updated_at,
      user.id
    ).run();
    return c.json({
      success: true,
      message: "Configuration updated successfully"
    });
  } catch (error3) {
    console.error("Update config error:", error3);
    return c.json({ error: "Failed to update configuration: " + error3.message }, 500);
  }
});
routing.get("/export", async (c) => {
  try {
    const db = c.env.DB;
    const user = c.get("user");
    const config2 = await db.prepare(
      "SELECT * FROM call_routing_config WHERE user_id = ?"
    ).bind(user.id).first();
    if (!config2) {
      return c.json({ error: "No configuration found" }, 404);
    }
    const exportConfig = {
      routing_mode: config2.routing_mode,
      ring_all_devices: Boolean(config2.ring_all_devices),
      ring_timeout: config2.ring_timeout,
      ai_enabled: Boolean(config2.ai_enabled),
      ai_provider: config2.ai_provider,
      ai_greeting: config2.ai_greeting,
      ai_can_transfer: Boolean(config2.ai_can_transfer),
      ai_take_messages: Boolean(config2.ai_take_messages),
      business_hours_enabled: Boolean(config2.business_hours_enabled),
      business_hours: config2.business_hours_json ? JSON.parse(config2.business_hours_json) : null,
      timezone: config2.timezone,
      after_hours_mode: config2.after_hours_mode,
      after_hours_forward_to: config2.after_hours_forward_to,
      fallback_chain: config2.fallback_chain ? JSON.parse(config2.fallback_chain) : [],
      fallback_timeout: config2.fallback_timeout,
      voicemail_enabled: Boolean(config2.voicemail_enabled),
      voicemail_greeting: config2.voicemail_greeting,
      missed_call_sms: Boolean(config2.missed_call_sms),
      missed_call_email: Boolean(config2.missed_call_email)
    };
    return c.json(exportConfig);
  } catch (error3) {
    console.error("Export config error:", error3);
    return c.json({ error: "Failed to export configuration: " + error3.message }, 500);
  }
});
routing.post("/import", async (c) => {
  try {
    const db = c.env.DB;
    const user = c.get("user");
    const importConfig = await c.req.json();
    const config2 = {
      routing_mode: importConfig.routing_mode || "simultaneous",
      ring_all_devices: importConfig.ring_all_devices ? 1 : 0,
      ring_timeout: importConfig.ring_timeout || 30,
      ai_enabled: importConfig.ai_enabled ? 1 : 0,
      ai_provider: importConfig.ai_provider,
      ai_greeting: importConfig.ai_greeting,
      ai_can_transfer: importConfig.ai_can_transfer ? 1 : 0,
      ai_take_messages: importConfig.ai_take_messages ? 1 : 0,
      business_hours_enabled: importConfig.business_hours_enabled ? 1 : 0,
      business_hours_json: importConfig.business_hours ? JSON.stringify(importConfig.business_hours) : null,
      timezone: importConfig.timezone || "America/New_York",
      after_hours_mode: importConfig.after_hours_mode || "voicemail",
      after_hours_forward_to: importConfig.after_hours_forward_to,
      fallback_chain: importConfig.fallback_chain ? JSON.stringify(importConfig.fallback_chain) : null,
      fallback_timeout: importConfig.fallback_timeout || 30,
      voicemail_enabled: importConfig.voicemail_enabled ? 1 : 0,
      voicemail_greeting: importConfig.voicemail_greeting,
      missed_call_sms: importConfig.missed_call_sms ? 1 : 0,
      missed_call_email: importConfig.missed_call_email ? 1 : 0,
      updated_at: Math.floor(Date.now() / 1e3)
    };
    await db.prepare(`
            UPDATE call_routing_config 
            SET routing_mode = ?, ring_all_devices = ?, ring_timeout = ?,
                ai_enabled = ?, ai_provider = ?, ai_greeting = ?,
                ai_can_transfer = ?, ai_take_messages = ?,
                business_hours_enabled = ?, business_hours_json = ?, timezone = ?,
                after_hours_mode = ?, after_hours_forward_to = ?,
                fallback_chain = ?, fallback_timeout = ?,
                voicemail_enabled = ?, voicemail_greeting = ?,
                missed_call_sms = ?, missed_call_email = ?, updated_at = ?
            WHERE user_id = ?
        `).bind(...Object.values(config2), user.id).run();
    return c.json({
      success: true,
      message: "Configuration imported successfully"
    });
  } catch (error3) {
    console.error("Import config error:", error3);
    return c.json({ error: "Failed to import configuration: " + error3.message }, 500);
  }
});
var routing_default = routing;

// src/routes/teams.js
var teams = new Hono2();
teams.use("*", async (c, next) => {
  try {
    const authHeader = c.req.header("Authorization");
    if (!authHeader) {
      return c.json({ error: "Authentication required" }, 401);
    }
    const token = authHeader.replace("Bearer ", "");
    const encoder2 = new TextEncoder();
    const { payload } = await jwtVerify(token, encoder2.encode(c.env.JWT_SECRET));
    const db = c.env.DB;
    const user = await db.prepare(
      "SELECT id, email, role, organization_id FROM users WHERE id = ?"
    ).bind(payload.id).first();
    if (!user) {
      return c.json({ error: "User not found" }, 401);
    }
    c.set("user", user);
    await next();
  } catch (error3) {
    console.error("Auth error:", error3);
    return c.json({ error: "Invalid token" }, 401);
  }
});
teams.get("/", async (c) => {
  try {
    const db = c.env.DB;
    const user = c.get("user");
    const result = await db.prepare(
      "SELECT * FROM teams WHERE organization_id = ? ORDER BY created_at DESC"
    ).bind(user.organization_id).all();
    return c.json({
      success: true,
      teams: result.results || []
    });
  } catch (error3) {
    console.error("Get teams error:", error3);
    return c.json({ error: "Failed to get teams: " + error3.message }, 500);
  }
});
teams.get("/:id", async (c) => {
  try {
    const db = c.env.DB;
    const user = c.get("user");
    const { id } = c.req.param();
    const team = await db.prepare(
      "SELECT * FROM teams WHERE id = ? AND organization_id = ?"
    ).bind(id, user.organization_id).first();
    if (!team) {
      return c.json({ error: "Team not found" }, 404);
    }
    return c.json({
      success: true,
      team
    });
  } catch (error3) {
    console.error("Get team error:", error3);
    return c.json({ error: "Failed to get team: " + error3.message }, 500);
  }
});
teams.post("/", async (c) => {
  try {
    const db = c.env.DB;
    const user = c.get("user");
    const body = await c.req.json();
    const teamId = `team-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const now = Math.floor(Date.now() / 1e3);
    await db.prepare(`
            INSERT INTO teams (
                id, organization_id, name, description, distribution_strategy,
                max_queue_size, max_wait_time, overflow_action, ring_timeout,
                created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
      teamId,
      user.organization_id,
      body.name,
      body.description || null,
      body.distribution_strategy || "round_robin",
      body.max_queue_size || 50,
      body.max_wait_time || 300,
      body.overflow_action || "voicemail",
      body.ring_timeout || 30,
      now,
      now
    ).run();
    return c.json({
      success: true,
      teamId,
      message: "Team created successfully"
    });
  } catch (error3) {
    console.error("Create team error:", error3);
    return c.json({ error: "Failed to create team: " + error3.message }, 500);
  }
});
teams.put("/:id", async (c) => {
  try {
    const db = c.env.DB;
    const user = c.get("user");
    const { id } = c.req.param();
    const body = await c.req.json();
    await db.prepare(`
            UPDATE teams 
            SET name = ?, description = ?, distribution_strategy = ?,
                max_queue_size = ?, max_wait_time = ?, overflow_action = ?,
                ring_timeout = ?, updated_at = ?
            WHERE id = ? AND organization_id = ?
        `).bind(
      body.name,
      body.description,
      body.distribution_strategy,
      body.max_queue_size,
      body.max_wait_time,
      body.overflow_action,
      body.ring_timeout,
      Math.floor(Date.now() / 1e3),
      id,
      user.organization_id
    ).run();
    return c.json({
      success: true,
      message: "Team updated successfully"
    });
  } catch (error3) {
    console.error("Update team error:", error3);
    return c.json({ error: "Failed to update team: " + error3.message }, 500);
  }
});
teams.delete("/:id", async (c) => {
  try {
    const db = c.env.DB;
    const user = c.get("user");
    const { id } = c.req.param();
    await db.prepare("DELETE FROM team_members WHERE team_id = ?").bind(id).run();
    await db.prepare(
      "DELETE FROM teams WHERE id = ? AND organization_id = ?"
    ).bind(id, user.organization_id).run();
    return c.json({
      success: true,
      message: "Team deleted successfully"
    });
  } catch (error3) {
    console.error("Delete team error:", error3);
    return c.json({ error: "Failed to delete team: " + error3.message }, 500);
  }
});
teams.get("/:id/members", async (c) => {
  try {
    const db = c.env.DB;
    const { id } = c.req.param();
    const result = await db.prepare(`
            SELECT tm.*, u.email, u.name 
            FROM team_members tm
            JOIN users u ON tm.user_id = u.id
            WHERE tm.team_id = ?
            ORDER BY tm.priority ASC
        `).bind(id).all();
    return c.json({
      success: true,
      members: result.results || []
    });
  } catch (error3) {
    console.error("Get members error:", error3);
    return c.json({ error: "Failed to get members: " + error3.message }, 500);
  }
});
teams.post("/:id/members", async (c) => {
  try {
    const db = c.env.DB;
    const { id } = c.req.param();
    const body = await c.req.json();
    const memberId = `member-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    await db.prepare(`
            INSERT INTO team_members (
                id, team_id, user_id, role, priority, skills, max_concurrent_calls, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
      memberId,
      id,
      body.user_id,
      body.role || "agent",
      body.priority || 1,
      body.skills ? JSON.stringify(body.skills) : null,
      body.max_concurrent_calls || 1,
      Math.floor(Date.now() / 1e3)
    ).run();
    return c.json({
      success: true,
      memberId,
      message: "Member added successfully"
    });
  } catch (error3) {
    console.error("Add member error:", error3);
    return c.json({ error: "Failed to add member: " + error3.message }, 500);
  }
});
teams.delete("/:id/members/:userId", async (c) => {
  try {
    const db = c.env.DB;
    const { id, userId } = c.req.param();
    await db.prepare(
      "DELETE FROM team_members WHERE team_id = ? AND user_id = ?"
    ).bind(id, userId).run();
    return c.json({
      success: true,
      message: "Member removed successfully"
    });
  } catch (error3) {
    console.error("Remove member error:", error3);
    return c.json({ error: "Failed to remove member: " + error3.message }, 500);
  }
});
teams.get("/agents/status", async (c) => {
  try {
    const db = c.env.DB;
    const user = c.get("user");
    const result = await db.prepare(`
            SELECT as.*, u.email, u.name 
            FROM agent_status as
            JOIN users u ON as.user_id = u.id
            WHERE u.organization_id = ?
            ORDER BY as.status ASC
        `).bind(user.organization_id).all();
    return c.json({
      success: true,
      agents: result.results || []
    });
  } catch (error3) {
    console.error("Get agent status error:", error3);
    return c.json({ error: "Failed to get agent status: " + error3.message }, 500);
  }
});
teams.put("/agents/status", async (c) => {
  try {
    const db = c.env.DB;
    const user = c.get("user");
    const body = await c.req.json();
    const existing = await db.prepare(
      "SELECT id FROM agent_status WHERE user_id = ?"
    ).bind(user.id).first();
    if (existing) {
      await db.prepare(`
                UPDATE agent_status 
                SET status = ?, status_message = ?, updated_at = ?
                WHERE user_id = ?
            `).bind(
        body.status,
        body.status_message || null,
        Math.floor(Date.now() / 1e3),
        user.id
      ).run();
    } else {
      const statusId = `status-${user.id}`;
      await db.prepare(`
                INSERT INTO agent_status (
                    id, user_id, status, status_message, updated_at
                ) VALUES (?, ?, ?, ?, ?)
            `).bind(
        statusId,
        user.id,
        body.status,
        body.status_message || null,
        Math.floor(Date.now() / 1e3)
      ).run();
    }
    return c.json({
      success: true,
      message: "Status updated successfully"
    });
  } catch (error3) {
    console.error("Update status error:", error3);
    return c.json({ error: "Failed to update status: " + error3.message }, 500);
  }
});
teams.get("/agents/available", async (c) => {
  try {
    const db = c.env.DB;
    const user = c.get("user");
    const result = await db.prepare(`
            SELECT as.*, u.email, u.name 
            FROM agent_status as
            JOIN users u ON as.user_id = u.id
            WHERE u.organization_id = ? AND as.status = 'available'
            ORDER BY as.last_call_at ASC NULLS FIRST
        `).bind(user.organization_id).all();
    return c.json({
      success: true,
      agents: result.results || []
    });
  } catch (error3) {
    console.error("Get available agents error:", error3);
    return c.json({ error: "Failed to get available agents: " + error3.message }, 500);
  }
});
teams.get("/queue", async (c) => {
  try {
    const db = c.env.DB;
    const user = c.get("user");
    const result = await db.prepare(`
            SELECT cq.*, t.name as team_name
            FROM call_queue cq
            LEFT JOIN teams t ON cq.team_id = t.id
            WHERE t.organization_id = ? AND cq.status = 'waiting'
            ORDER BY cq.priority DESC, cq.entered_at ASC
        `).bind(user.organization_id).all();
    return c.json({
      success: true,
      queue: result.results || []
    });
  } catch (error3) {
    console.error("Get queue error:", error3);
    return c.json({ error: "Failed to get queue: " + error3.message }, 500);
  }
});
teams.post("/queue", async (c) => {
  try {
    const db = c.env.DB;
    const body = await c.req.json();
    const queueId = `queue-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const now = Math.floor(Date.now() / 1e3);
    const posResult = await db.prepare(
      "SELECT COUNT(*) as count FROM call_queue WHERE team_id = ? AND status = ?"
    ).bind(body.team_id, "waiting").first();
    const position = (posResult?.count || 0) + 1;
    await db.prepare(`
            INSERT INTO call_queue (
                id, call_sid, team_id, caller_number, priority, position, entered_at, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
      queueId,
      body.call_sid,
      body.team_id,
      body.caller_number,
      body.priority || 1,
      position,
      now,
      "waiting"
    ).run();
    return c.json({
      success: true,
      queueId,
      position
    });
  } catch (error3) {
    console.error("Add to queue error:", error3);
    return c.json({ error: "Failed to add to queue: " + error3.message }, 500);
  }
});
teams.post("/queue/assign", async (c) => {
  try {
    const db = c.env.DB;
    const body = await c.req.json();
    await db.prepare(`
            UPDATE call_queue 
            SET assigned_to = ?, status = 'assigned', wait_time = ?
            WHERE id = ?
        `).bind(
      body.agent_id,
      Math.floor(Date.now() / 1e3) - body.entered_at,
      body.queue_id
    ).run();
    return c.json({
      success: true,
      message: "Call assigned successfully"
    });
  } catch (error3) {
    console.error("Assign call error:", error3);
    return c.json({ error: "Failed to assign call: " + error3.message }, 500);
  }
});
teams.put("/queue/:id/status", async (c) => {
  try {
    const db = c.env.DB;
    const { id } = c.req.param();
    const body = await c.req.json();
    await db.prepare(`
            UPDATE call_queue 
            SET status = ?
            WHERE id = ?
        `).bind(body.status, id).run();
    return c.json({
      success: true,
      message: "Queue status updated"
    });
  } catch (error3) {
    console.error("Update queue status error:", error3);
    return c.json({ error: "Failed to update queue status: " + error3.message }, 500);
  }
});
var teams_default = teams;

// src/utils/callDistributor.js
var CallDistributor = class {
  static {
    __name(this, "CallDistributor");
  }
  constructor(db) {
    this.db = db;
  }
  /**
   * Find best agent for incoming call
   * @param {string} teamId - Team to route call to
   * @param {object} callData - Call information
   * @returns {object} Selected agent or null
   */
  async findAgent(teamId, callData = {}) {
    const team = await this.db.prepare(
      "SELECT * FROM teams WHERE id = ?"
    ).bind(teamId).first();
    if (!team) {
      throw new Error("Team not found");
    }
    const availableAgents = await this.getAvailableAgents(teamId);
    if (availableAgents.length === 0) {
      return null;
    }
    switch (team.distribution_strategy) {
      case "round_robin":
        return this.roundRobin(availableAgents, teamId);
      case "longest_idle":
        return this.longestIdle(availableAgents);
      case "simultaneous":
        return this.simultaneousRing(availableAgents);
      case "skills_based":
        return this.skillsBased(availableAgents, callData.requiredSkills || []);
      default:
        return this.roundRobin(availableAgents, teamId);
    }
  }
  /**
   * Get available agents for a team
   */
  async getAvailableAgents(teamId) {
    const result = await this.db.prepare(`
            SELECT tm.*, as.status, as.last_call_at, u.email, u.name
            FROM team_members tm
            JOIN users u ON tm.user_id = u.id
            LEFT JOIN agent_status as ON tm.user_id = as.user_id
            WHERE tm.team_id = ? 
            AND (as.status = 'available' OR as.status IS NULL)
            ORDER BY tm.priority ASC
        `).bind(teamId).all();
    return result.results || [];
  }
  /**
   * Round Robin: Rotate through agents
   * Uses a simple counter stored in team metadata
   */
  async roundRobin(agents, teamId) {
    if (agents.length === 0) return null;
    const index = Math.floor(Date.now() / 1e3) % agents.length;
    return agents[index];
  }
  /**
   * Longest Idle: Agent who hasn't taken a call in longest time
   */
  longestIdle(agents) {
    if (agents.length === 0) return null;
    const sorted = agents.sort((a, b) => {
      if (!a.last_call_at) return -1;
      if (!b.last_call_at) return 1;
      return a.last_call_at - b.last_call_at;
    });
    return sorted[0];
  }
  /**
   * Simultaneous Ring: Return all agents
   * TwiML will dial all at once, first to answer gets call
   */
  simultaneousRing(agents) {
    return {
      type: "simultaneous",
      agents
    };
  }
  /**
   * Skills-based: Match agent skills to required skills
   */
  skillsBased(agents, requiredSkills = []) {
    if (agents.length === 0) return null;
    if (requiredSkills.length === 0) {
      return agents[0];
    }
    const matchedAgents = agents.filter((agent) => {
      if (!agent.skills) return false;
      const agentSkills = JSON.parse(agent.skills);
      return requiredSkills.every(
        (skill) => agentSkills.includes(skill)
      );
    });
    if (matchedAgents.length === 0) {
      return agents[0];
    }
    return matchedAgents[0];
  }
  /**
   * Add call to queue
   */
  async addToQueue(teamId, callSid, callerNumber, priority = 1) {
    const queueId = `queue-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const now = Math.floor(Date.now() / 1e3);
    const posResult = await this.db.prepare(
      "SELECT COUNT(*) as count FROM call_queue WHERE team_id = ? AND status = ?"
    ).bind(teamId, "waiting").first();
    const position = (posResult?.count || 0) + 1;
    await this.db.prepare(`
            INSERT INTO call_queue (
                id, call_sid, team_id, caller_number, priority, position, entered_at, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
      queueId,
      callSid,
      callerNumber,
      priority,
      position,
      now,
      "waiting"
    ).run();
    return {
      queueId,
      position,
      estimatedWait: this.estimateWaitTime(teamId)
    };
  }
  /**
   * Estimate wait time based on queue depth and average handle time
   */
  async estimateWaitTime(teamId) {
    const queueResult = await this.db.prepare(
      "SELECT COUNT(*) as count FROM call_queue WHERE team_id = ? AND status = ?"
    ).bind(teamId, "waiting").first();
    const queueDepth = queueResult?.count || 0;
    const agents = await this.getAvailableAgents(teamId);
    const availableCount = agents.length;
    if (availableCount === 0) {
      return queueDepth * 120;
    }
    const avgHandleTime = 180;
    return Math.ceil(queueDepth / availableCount * avgHandleTime);
  }
  /**
   * Get next call from queue
   */
  async getNextFromQueue(teamId) {
    const result = await this.db.prepare(`
            SELECT * FROM call_queue 
            WHERE team_id = ? AND status = 'waiting'
            ORDER BY priority DESC, entered_at ASC
            LIMIT 1
        `).bind(teamId).first();
    return result;
  }
  /**
   * Assign call to agent
   */
  async assignCall(queueId, agentId) {
    const now = Math.floor(Date.now() / 1e3);
    const queueItem = await this.db.prepare(
      "SELECT * FROM call_queue WHERE id = ?"
    ).bind(queueId).first();
    if (!queueItem) {
      throw new Error("Queue item not found");
    }
    const waitTime = now - queueItem.entered_at;
    await this.db.prepare(`
            UPDATE call_queue 
            SET assigned_to = ?, status = 'assigned', wait_time = ?
            WHERE id = ?
        `).bind(agentId, waitTime, queueId).run();
    await this.db.prepare(`
            UPDATE agent_status 
            SET status = 'busy', last_call_at = ?, total_calls_today = total_calls_today + 1
            WHERE user_id = ?
        `).bind(now, agentId).run();
    return {
      success: true,
      waitTime
    };
  }
  /**
   * Mark call as completed
   */
  async completeCall(queueId) {
    await this.db.prepare(`
            UPDATE call_queue 
            SET status = 'answered'
            WHERE id = ?
        `).bind(queueId).run();
  }
  /**
   * Mark call as abandoned (caller hung up)
   */
  async abandonCall(queueId) {
    await this.db.prepare(`
            UPDATE call_queue 
            SET status = 'abandoned'
            WHERE id = ?
        `).bind(queueId).run();
  }
};
function createDistributor(db) {
  return new CallDistributor(db);
}
__name(createDistributor, "createDistributor");

// src/routes/distribute.js
var distribute = new Hono2();
distribute.post("/test", async (c) => {
  try {
    const db = c.env.DB;
    const { teamId, requiredSkills } = await c.req.json();
    const distributor = createDistributor(db);
    const agent = await distributor.findAgent(teamId, { requiredSkills });
    if (!agent) {
      return c.json({
        success: false,
        message: "No available agents"
      });
    }
    if (agent.type === "simultaneous") {
      return c.json({
        success: true,
        strategy: "simultaneous",
        agents: agent.agents.map((a) => ({
          id: a.user_id,
          name: a.name || a.email,
          priority: a.priority
        }))
      });
    }
    return c.json({
      success: true,
      agent: {
        id: agent.user_id,
        name: agent.name || agent.email,
        email: agent.email,
        priority: agent.priority,
        lastCall: agent.last_call_at
      }
    });
  } catch (error3) {
    console.error("Test distribution error:", error3);
    return c.json({ error: error3.message }, 500);
  }
});
distribute.post("/route", async (c) => {
  try {
    const db = c.env.DB;
    const { teamId, callerNumber, callSid, requiredSkills } = await c.req.json();
    const distributor = createDistributor(db);
    const agent = await distributor.findAgent(teamId, { requiredSkills });
    if (!agent) {
      const queueInfo = await distributor.addToQueue(teamId, callSid, callerNumber);
      return c.json({
        success: true,
        action: "queued",
        queuePosition: queueInfo.position,
        estimatedWait: queueInfo.estimatedWait,
        queueId: queueInfo.queueId
      });
    }
    if (agent.type === "simultaneous") {
      return c.json({
        success: true,
        action: "ring_all",
        agents: agent.agents.map((a) => a.user_id)
      });
    }
    return c.json({
      success: true,
      action: "ring_agent",
      agentId: agent.user_id,
      agentName: agent.name || agent.email
    });
  } catch (error3) {
    console.error("Route call error:", error3);
    return c.json({ error: error3.message }, 500);
  }
});
distribute.get("/queue/stats/:teamId", async (c) => {
  try {
    const db = c.env.DB;
    const { teamId } = c.req.param();
    const distributor = createDistributor(db);
    const queueResult = await db.prepare(
      "SELECT COUNT(*) as count FROM call_queue WHERE team_id = ? AND status = ?"
    ).bind(teamId, "waiting").first();
    const agents = await distributor.getAvailableAgents(teamId);
    const estimatedWait = await distributor.estimateWaitTime(teamId);
    return c.json({
      success: true,
      stats: {
        queueDepth: queueResult?.count || 0,
        availableAgents: agents.length,
        estimatedWait
      }
    });
  } catch (error3) {
    console.error("Get queue stats error:", error3);
    return c.json({ error: error3.message }, 500);
  }
});
var distribute_default = distribute;

// src/index.js
var app3 = new Hono2();
app3.use("*", cors());
app3.use("*", async (c, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  console.log(`${c.req.method} ${c.req.url} - ${ms}ms`);
});
app3.get("/health", (c) => {
  return c.json({
    status: "OK",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    message: "VOIP SaaS API - Modular Architecture",
    version: "5.0",
    database: "Cloudflare D1 (SQLite)",
    features: [
      "Authentication",
      "Multi-Tier Organizations",
      "Billing & Credits",
      "Twilio Voice & SMS",
      "Call Recording",
      "Usage Analytics",
      "Admin Dashboard"
    ]
  });
});
app3.get("/test-db", async (c) => {
  try {
    const db = c.env.DB;
    const result = await db.prepare("SELECT COUNT(*) as count FROM users").first();
    return c.json({
      success: true,
      userCount: result.count,
      database: "Connected"
    });
  } catch (error3) {
    return c.json({
      success: false,
      error: error3.message
    }, 500);
  }
});
app3.route("/api/auth", auth_default);
app3.route("/api/billing", billing_default);
app3.route("/api/calls", calls_default);
app3.route("/api/messages", messages_default);
app3.route("/api/routing", routing_default);
app3.route("/api/teams", teams_default);
app3.route("/api/distribute", distribute_default);
app3.route("/api/sync", sync_default);
app3.route("/api/voice", voice_default);
app3.route("/api/admin", admin_default);
app3.route("/api/agency", agency_default);
app3.route("/api/business", business_default);
app3.notFound((c) => {
  return c.json({
    error: "Not Found",
    message: "The requested endpoint does not exist",
    path: c.req.url
  }, 404);
});
app3.onError((err, c) => {
  console.error("Global error handler:", err);
  return c.json({
    error: "Internal Server Error",
    message: err.message
  }, 500);
});
var src_default = app3;

// ../../../AppData/Roaming/npm/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env2, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env2);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// ../../../AppData/Roaming/npm/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env2, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env2);
  } catch (e) {
    const error3 = reduceError(e);
    return Response.json(error3, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-rPo8uR/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = src_default;

// ../../../AppData/Roaming/npm/node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env2, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env2, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env2, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env2, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-rPo8uR/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env2, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env2, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env2, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env2, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env2, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env2, ctx) => {
      this.env = env2;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=index.js.map
