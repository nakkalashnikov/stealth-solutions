// All HTTP/SSE access to the backend lives here — components and the store
// never call fetch()/EventSource directly. resourcePath selects which shared
// sequence ("sequence" for Task 1, "bst-sequence" for Task 2) — each is an
// independent resource on the backend, isolated from the other.

const POLL_MS = 4000;

export async function fetchSequence(resourcePath) {
  const url = `/api/${resourcePath}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`GET ${url} failed: ${res.status}`);
  return res.json(); // { sequence, updatedAt }
}

export async function postSequence(resourcePath, sequence) {
  const url = `/api/${resourcePath}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sequence }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.error || `POST ${url} failed: ${res.status}`);
  return body;
}

// Subscribes to live updates. Prefers SSE; if EventSource isn't available
// (some watch browsers), falls back to polling. Returns an unsubscribe fn.
export function subscribeToSequence(resourcePath, onUpdate, onStatusChange) {
  if (typeof EventSource === "undefined") {
    return subscribeByPolling(resourcePath, onUpdate, onStatusChange);
  }

  const source = new EventSource(`/api/${resourcePath}/stream`);
  source.addEventListener("update", (ev) => {
    onStatusChange?.("synced");
    onUpdate(JSON.parse(ev.data));
  });
  source.onerror = () => onStatusChange?.("offline");
  source.onopen = () => onStatusChange?.("synced");

  return () => source.close();
}

function subscribeByPolling(resourcePath, onUpdate, onStatusChange) {
  let lastUpdatedAt = null;
  const tick = async () => {
    try {
      const data = await fetchSequence(resourcePath);
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
