import { EventEmitter } from "node:events";

// Backs the SSE stream — a write anywhere calls eventBus.emit("update", ...),
// every connected /api/sequence/stream client gets pushed the new value.
export function makeEventBus() {
  return new EventEmitter();
}
