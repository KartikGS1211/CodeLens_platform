/* empty css                         */
import { monitoring } from '@wix/essentials';

// src/monitoring.ts

// ../monitoring-common/build/index.js
var getCallStack = () => {
  try {
    throw new Error();
  } catch (e) {
    return e?.stack;
  }
};
var getCallLocation = (stack) => {
  stack = stack ?? getCallStack();
  const frames = stack?.trim().split("\n");
  if (!frames) {
    return null;
  }
  for (let i = frames.length - 1; i >= 0; i--) {
    const match = frames[i].match(/https?:\/\/.+?(\/.+):(\d+):(\d+)/) ?? frames[i].match(/.*(\/[^/]+):(\d+):(\d+)/);
    if (match) {
      return {
        file: match[1],
        line: parseInt(match[2], 10) ?? 0,
        column: parseInt(match[3], 10) ?? 0
      };
    }
  }
  return null;
};

// src/constants.ts
var METHODS = [
  "debug",
  "error",
  "info",
  "log",
  "warn"
];

// src/monitoring.ts
var transformLevel = (method) => {
  switch (method) {
    case "log":
      return "info";
    case "warn":
      return "warning";
    default:
      return method;
  }
};
var stringifySafe = (value) => {
  try {
    return JSON.stringify(value);
  } catch (error) {
    return `Failed to stringify log value: ${error?.toString()}`;
  }
};
var log = ({ method, stack }, ...args) => {
  const message = args.map((value) => typeof value === "string" ? value : value instanceof Error ? value.toString() : stringifySafe(value)).join(" ");
  stack = stack ?? getCallStack();
  const sourceLocation = getCallLocation(stack);
  const contexts = sourceLocation ? {
    __sourceLocation: sourceLocation
  } : void 0;
  monitoring.getMonitoringClient().captureMessage(message, {
    level: transformLevel(method),
    contexts
  });
};
var overrideConsoleMethods = (originalConsole) => {
  for (const method of METHODS) {
    const originalMethod = originalConsole[method];
    console[method] = (...args) => {
      originalMethod(...args);
      log({ method }, ...args);
    };
  }
};

// src/server/setup-server.ts
function setupServerMonitoring() {
  overrideConsoleMethods(console);
}

setupServerMonitoring();
