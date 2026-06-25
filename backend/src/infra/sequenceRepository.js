import { DatabaseSync } from "node:sqlite";

// Single shared row — there is exactly one sequence for the whole site, no
// per-user rows, so a full DB server would be pure overhead.
export function makeSequenceRepository(dbPath, defaultSequence) {
  const db = new DatabaseSync(dbPath);
  db.exec(`
    CREATE TABLE IF NOT EXISTS sequence_state (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      sequence TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);

  const existing = db.prepare("SELECT sequence, updated_at FROM sequence_state WHERE id = 1").get();
  if (!existing) {
    db.prepare("INSERT INTO sequence_state (id, sequence, updated_at) VALUES (1, ?, ?)")
      .run(JSON.stringify(defaultSequence), new Date().toISOString());
  }

  function read() {
    const row = db.prepare("SELECT sequence, updated_at FROM sequence_state WHERE id = 1").get();
    return { sequence: JSON.parse(row.sequence), updatedAt: row.updated_at };
  }

  function write(sequence) {
    const updatedAt = new Date().toISOString();
    db.prepare("UPDATE sequence_state SET sequence = ?, updated_at = ? WHERE id = 1")
      .run(JSON.stringify(sequence.toJSON()), updatedAt);
    return { sequence: sequence.toJSON(), updatedAt };
  }

  return { read, write };
}
