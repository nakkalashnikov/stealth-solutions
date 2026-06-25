import { Router } from "express";
import { InvalidSequenceError } from "../domain/sequence.js";

export function makeSequenceRouter({ resourcePath, getSequence, updateSequence, eventBus }) {
  const router = Router();

  router.get(`/${resourcePath}`, (req, res) => {
    res.json(getSequence());
  });

  router.post(`/${resourcePath}`, (req, res) => {
    try {
      const result = updateSequence(req.body?.sequence);
      res.json(result);
    } catch (err) {
      if (err instanceof InvalidSequenceError) {
        res.status(400).json({ error: err.message });
        return;
      }
      throw err;
    }
  });

  router.get(`/${resourcePath}/stream`, (req, res) => {
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });
    res.write(`event: update\ndata: ${JSON.stringify(getSequence())}\n\n`);

    const onUpdate = (payload) => {
      res.write(`event: update\ndata: ${JSON.stringify(payload)}\n\n`);
    };
    eventBus.on("update", onUpdate);

    req.on("close", () => {
      eventBus.off("update", onUpdate);
    });
  });

  return router;
}
