export const MIN_LENGTH = 2;
export const MAX_LENGTH = 31;

export class InvalidSequenceError extends Error {}

// Value object — validates on construction so an invalid sequence can never
// exist past this point (no separate "is it valid?" checks needed downstream).
export class Sequence {
  constructor(values) {
    if (!Array.isArray(values)) {
      throw new InvalidSequenceError("sequence must be an array");
    }
    if (values.length < MIN_LENGTH || values.length > MAX_LENGTH) {
      throw new InvalidSequenceError(`sequence must have between ${MIN_LENGTH} and ${MAX_LENGTH} numbers`);
    }
    if (!values.every((v) => typeof v === "number" && Number.isFinite(v))) {
      throw new InvalidSequenceError("sequence must contain only finite numbers");
    }
    this.values = values.slice();
  }

  toJSON() {
    return this.values;
  }
}
