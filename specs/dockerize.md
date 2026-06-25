## Spec: Dockerize the app for single-command run

### Problem
Running the site currently requires two manual `npm run dev` processes (backend + Vite) in
separate terminals, with Vite proxying `/api` to the backend. That's fine for active
development but not for handing the project to someone else (the friend doing ops, or a
classmate) to just run it. Need one command that builds and serves the whole app — frontend
+ backend + persistent shared-sequence storage — on one port.

### Out of scope
- Production TLS/HTTPS termination, reverse proxy, or domain setup — assumed handled by
  whoever deploys it (e.g. behind Caddy/Nginx or a platform's built-in HTTPS).
- Multi-container orchestration (Kubernetes, swarm) — one container is enough for this scale.
- CI/CD pipeline to build/push the image automatically.
- Hot-reload-in-Docker dev workflow — Docker is for running the built app, not day-to-day dev
  (local `npm run dev` stays the dev workflow).

### Solution
- Single multi-stage `Dockerfile` at repo root: stage 1 builds the React app (`frontend/`,
  `vite build` → `dist/`), stage 2 is the Express backend with `frontend/dist` copied in —
  matches what `backend/src/server.js` already expects (it serves `frontend/dist` as static
  files and falls back to `index.html` for any non-`/api` route).
- One container, one exposed port (3001) — no nginx/proxy needed, Express serves both the SPA
  and the API, same as the existing `server.js` design.
- SQLite file lives in a named Docker volume mounted at `/app/data`, so the shared sequence
  survives container restarts/rebuilds.
- `docker-compose.yml` wraps the build + port mapping + volume so the whole thing is
  `docker compose up` — one command, matches the "just run it" goal.
- `.dockerignore` excludes `node_modules`, `dist`, and `backend/data` from the build context.

### Service interactions

| From | To | Protocol | Trigger |
|---|---|---|---|
| Browser (any device on LAN) | container:3001 | HTTP | page load, API calls, SSE stream |
| Express (in container) | SQLite file on mounted volume | local file I/O | every GET/POST `/api/sequence` |
| `docker compose up` | Docker daemon | Docker API | builds image (if needed) + starts container |

### API / Interface changes
None — same `/api/sequence` (GET/POST) and `/api/sequence/stream` (SSE) contract as today.
Only the run/deploy mechanism changes.

**New or changed endpoints:** none

**New RabbitMQ events:** none

**New or changed DB fields:** none — same single-row `sequence_state` SQLite table, just now
living inside a Docker volume instead of `backend/data/` on the host filesystem directly.

### Data model
No schema change. Volume layout:
```
docker volume: stealth-solutions-data
  └── sequence.sqlite   (same file/schema as backend/src/infra/sequenceRepository.js creates today)
```

### Failure modes

| Failure | Detected by | Handling |
|---|---|---|
| Container starts before volume is writable | Express throws on `DatabaseSync` open | Fail fast, non-zero exit — Docker restart policy (`unless-stopped`) retries |
| Port 3001 already taken on host | `docker compose up` fails to bind | Document `PORT`/host-port mapping override in compose file via env var |
| Frontend build fails (stage 1) | `docker build` exits non-zero before stage 2 starts | No broken image gets produced/tagged |
| Volume not mounted (fresh `docker run` without `-v`) | Data resets to `DEFAULT_SEQUENCE` on every restart | Acceptable degraded mode, but compose file mounts the volume by default so this only bites manual `docker run` use |
| Stale image cache after code changes | `docker compose up` without `--build` | Document `docker compose up --build` for picking up new code |

### Test plan
- [ ] Happy path: `docker compose up --build` from a clean checkout → site reachable at `http://<host>:3001`, default sequence renders, Heap Sort + Quick Sort sections match the non-Docker output
- [ ] Happy path: submit a new sequence in container A's browser tab, open a second tab → SSE push still works inside the single container
- [ ] Edge case: `docker compose down && docker compose up` (no `-v` removal) → previously submitted sequence persists (volume survives)
- [ ] Edge case: `docker compose down -v` → sequence resets to `DEFAULT_SEQUENCE`
- [ ] Failure: kill the container mid-request → client falls back to its existing "offline" badge behavior, recovers when container restarts
- [ ] Regression: `npm test` (both backend and frontend) still passes when run outside Docker — Dockerizing doesn't change app logic
