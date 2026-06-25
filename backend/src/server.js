import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { makeSequenceRepository } from "./infra/sequenceRepository.js";
import { makeEventBus } from "./infra/eventBus.js";
import { makeGetSequence } from "./usecase/getSequence.js";
import { makeUpdateSequence } from "./usecase/updateSequence.js";
import { makeSequenceRouter } from "./presentation/sequenceRouter.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_SEQUENCE = [12, 3, 5, 43, 16, 15, 17, 0, 1, 5, 0, 89, 23];
const DB_PATH = process.env.DB_PATH || path.join(__dirname, "../data/sequence.sqlite");
const PORT = process.env.PORT || 3001;

const repository = makeSequenceRepository(DB_PATH, DEFAULT_SEQUENCE);
const eventBus = makeEventBus();
const getSequence = makeGetSequence({ repository });
const updateSequence = makeUpdateSequence({ repository, eventBus });

const app = express();
app.use(express.json());
app.use("/api", makeSequenceRouter({ getSequence, updateSequence, eventBus }));

// Serve the built React app (frontend/dist) in production.
const frontendDist = path.join(__dirname, "../../frontend/dist");
app.use(express.static(frontendDist));
app.get("*", (req, res) => {
  if (req.path.startsWith("/api")) return res.status(404).end();
  res.sendFile(path.join(frontendDist, "index.html"));
});

app.listen(PORT, () => {
  console.log(`backend listening on :${PORT}`);
});
