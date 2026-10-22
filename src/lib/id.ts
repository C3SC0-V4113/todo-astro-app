/** Unique id for client-side records. */
let fallbackSequence = 0;

export function createId(): string {
  const randomUUID = globalThis.crypto?.randomUUID;
  if (typeof randomUUID === 'function') return randomUUID.call(globalThis.crypto);
  fallbackSequence += 1;
  return `todo-${Date.now().toString(36)}-${fallbackSequence.toString(36)}-${Math.random()
    .toString(36)
    .slice(2)}`;
}
