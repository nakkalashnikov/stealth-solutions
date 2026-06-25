import { Sequence } from "../domain/sequence.js";

// DomainClass defaults to Sequence (Task 1/2's flat-number-array shape), but
// any resource whose domain class validates in its constructor and exposes
// toJSON() can plug in here — e.g. KnapsackInput's {capacity, items} shape.
export function makeUpdateSequence({ repository, eventBus, DomainClass = Sequence }) {
  return function updateSequence(rawValue) {
    const value = new DomainClass(rawValue); // throws InvalidSequenceError if bad input
    const saved = repository.write(value);
    eventBus.emit("update", saved);
    return saved;
  };
}
