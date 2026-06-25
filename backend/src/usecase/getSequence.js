export function makeGetSequence({ repository }) {
  return function getSequence() {
    return repository.read();
  };
}
