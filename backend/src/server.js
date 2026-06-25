import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { makeSequenceRepository } from "./infra/sequenceRepository.js";
import { makeEventBus } from "./infra/eventBus.js";
import { makeGetSequence } from "./usecase/getSequence.js";
import { makeUpdateSequence } from "./usecase/updateSequence.js";
import { makeSequenceRouter } from "./presentation/sequenceRouter.js";
import { KnapsackInput } from "./domain/knapsackInput.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_SEQUENCE = [12, 3, 5, 43, 16, 15, 17, 0, 1, 5, 0, 89, 23];
const DEFAULT_BST_SEQUENCE = [19, 3, 31, 1, 27, 17, 21, 16, 18, 15, 22, 37, 25, 11, 26, 2, 98];
const DEFAULT_KNAPSACK = {
  capacity: 9,
  items: [
    { size: 6, value: 3 },
    { size: 2, value: 2 },
    { size: 2, value: 5 },
    { size: 1, value: 2 },
    { size: 7, value: 24 },
    { size: 12, value: 44 },
  ],
};
const DB_PATH = process.env.DB_PATH || path.join(__dirname, "../data/sequence.sqlite");
const PORT = process.env.PORT || 3001;

function makeResource(resourcePath, defaultValue, tableName, DomainClass) {
  const repository = makeSequenceRepository(DB_PATH, defaultValue, tableName);
  const eventBus = makeEventBus();
  const getSequence = makeGetSequence({ repository });
  const updateSequence = makeUpdateSequence({ repository, eventBus, DomainClass });
  return makeSequenceRouter({ resourcePath, getSequence, updateSequence, eventBus });
}

const app = express();
app.use(express.json());
app.use("/api", makeResource("sequence", DEFAULT_SEQUENCE, "sequence_state"));
app.use("/api", makeResource("bst-sequence", DEFAULT_BST_SEQUENCE, "bst_sequence_state"));
app.use("/api", makeResource("knapsack", DEFAULT_KNAPSACK, "knapsack_state", KnapsackInput));

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
