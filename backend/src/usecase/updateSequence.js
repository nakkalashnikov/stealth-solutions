import { Sequence } from "../domain/sequence.js";

export function makeUpdateSequence({ repository, eventBus }) {
  return function updateSequence(rawValues) {
    const sequence = new Sequence(rawValues); // throws InvalidSequenceError if bad input
    const saved = repository.write(sequence);
    eventBus.emit("update", saved);
    return saved;
  };
}
