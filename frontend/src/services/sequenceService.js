// All HTTP/SSE access to the backend lives here — components and the store
// never call fetch()/EventSource directly.

const API_URL = "/api/sequence";
const STREAM_URL = "/api/sequence/stream";
const POLL_MS = 4000;

export async function fetchSequence() {
  const res = await fetch(API_URL, { cache: "no-store" });
  if (!res.ok) throw new Error(`GET ${API_URL} failed: ${res.status}`);
  return res.json(); // { sequence, updatedAt }
}

export async function postSequence(sequence) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sequence }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.error || `POST ${API_URL} failed: ${res.status}`);
  return body;
}

// Subscribes to live updates. Prefers SSE; if EventSource isn't available
// (some watch browsers), falls back to polling. Returns an unsubscribe fn.
export function subscribeToSequence(onUpdate, onStatusChange) {
  if (typeof EventSource === "undefined") {
    return subscribeByPolling(onUpdate, onStatusChange);
  }

  const source = new EventSource(STREAM_URL);
  source.addEventListener("update", (ev) => {
    onStatusChange?.("synced");
    onUpdate(JSON.parse(ev.data));
  });
  source.onerror = () => onStatusChange?.("offline");
  source.onopen = () => onStatusChange?.("synced");

  return () => source.close();
}

function subscribeByPolling(onUpdate, onStatusChange) {
  let lastUpdatedAt = null;
  const tick = async () => {
    try {
      const data = await fetchSequence();
      onStatusChange?.("synced");
      if (data.updatedAt !== lastUpdatedAt) {
        lastUpdatedAt = data.updatedAt;
        onUpdate(data);
      }
    } catch {
      onStatusChange?.("offline");
    }
  };
  tick();
  const id = setInterval(tick, POLL_MS);
  return () => clearInterval(id);
}
