import { InMemoryPersistencePort } from './in-memory.port';

/**
 * The double gets its own spec on purpose. Every FR-010 assertion downstream rests on this object
 * behaving like the port: if `read` returned `undefined` for a missing key, or two instances shared
 * state, the seam tests would pass or fail for reasons that have nothing to do with the store.
 */
describe('InMemoryPersistencePort', () => {
  it('round-trips a payload', () => {
    const port = new InMemoryPersistencePort();

    port.write('k', '{"a":1}');

    expect(port.read('k')).toBe('{"a":1}');
  });

  it('returns null for an absent key, matching the port contract', () => {
    const port = new InMemoryPersistencePort();

    expect(port.read('absent')).toBeNull();
  });

  it('overwrites rather than appending on a second write', () => {
    const port = new InMemoryPersistencePort();

    port.write('k', 'first');
    port.write('k', 'second');

    expect(port.read('k')).toBe('second');
  });

  it('remove deletes the key entirely', () => {
    const port = new InMemoryPersistencePort({ k: 'v' });

    port.remove('k');

    expect(port.read('k')).toBeNull();
  });

  it('seeds initial payloads as if a previous session wrote them', () => {
    const port = new InMemoryPersistencePort({ 'wa.chat-store.v1': '{"version":1}' });

    expect(port.read('wa.chat-store.v1')).toBe('{"version":1}');
  });

  it('keeps instances independent, so a fresh instance starts empty', () => {
    const first = new InMemoryPersistencePort();

    first.write('k', 'v');

    // This is what makes the "a fresh store hydrates from a previous store's payload" assertion
    // meaningful: sharing state here would make it pass for the wrong reason.
    expect(new InMemoryPersistencePort().read('k')).toBeNull();
  });
});