import { AccountStore, ACCOUNT_KEY, DEFAULT_ACCOUNT } from './account.store';
import { InMemoryPersistencePort } from './persistence/in-memory.port';

describe('AccountStore', () => {
  it('starts from defaults: empty device number, two-step disabled', () => {
    const store = new AccountStore(new InMemoryPersistencePort());
    expect(store.account()).toEqual(DEFAULT_ACCOUNT);
  });

  it('persists and reloads the device number', () => {
    const port = new InMemoryPersistencePort();
    const first = new AccountStore(port);
    first.setDeviceNumber('+1 555-0100');

    const reloaded = new AccountStore(port);
    expect(reloaded.account().deviceNumber).toBe('+1 555-0100');
    expect(port.read(ACCOUNT_KEY)).toContain('+1 555-0100');
  });

  it('refuses a blank device number', () => {
    const store = new AccountStore(new InMemoryPersistencePort());
    store.setDeviceNumber('   ');
    expect(store.account().deviceNumber).toBe('');
  });

  it('persists and reloads a valid two-step PIN + recovery email', () => {
    const port = new InMemoryPersistencePort();
    const first = new AccountStore(port);
    first.setTwoStep('123456', 'a@b.co');

    const reloaded = new AccountStore(port);
    expect(reloaded.account().twoStep).toEqual({ pin: '123456', email: 'a@b.co' });
  });

  it('refuses an invalid two-step rule: short PIN or no @ in email (FR-006)', () => {
    const store = new AccountStore(new InMemoryPersistencePort());
    store.setTwoStep('12345', 'a@b.co');
    expect(store.account().twoStep).toBeNull();
    store.setTwoStep('123456', 'invalid');
    expect(store.account().twoStep).toBeNull();
  });

  it('removeTwoStep clears only on a PIN match and otherwise leaves state untouched', () => {
    const store = new AccountStore(new InMemoryPersistencePort());
    store.setTwoStep('123456', 'a@b.co');

    expect(store.removeTwoStep('wrong')).toBe(false);
    expect(store.account().twoStep).toEqual({ pin: '123456', email: 'a@b.co' });

    expect(store.removeTwoStep('123456')).toBe(true);
    expect(store.account().twoStep).toBeNull();
  });

  it('removeTwoStep on a disabled account returns false without changing anything', () => {
    const store = new AccountStore(new InMemoryPersistencePort());
    expect(store.removeTwoStep('123456')).toBe(false);
    expect(store.account().twoStep).toBeNull();
  });

  it('normalizes a malformed persisted twoStep block to disabled (FR-006 model guard)', () => {
    const port = new InMemoryPersistencePort({ [ACCOUNT_KEY]: '{"version":1,"twoStep":{"pin":"123456"}}' });
    const store = new AccountStore(port);
    expect(store.account().twoStep).toBeNull();
  });

  it('normalizes a non-string device number to the empty default', () => {
    const port = new InMemoryPersistencePort({ [ACCOUNT_KEY]: '{"version":1,"deviceNumber":42}' });
    const store = new AccountStore(port);
    expect(store.account().deviceNumber).toBe('');
  });

  it('ignores a snapshot of the wrong version', () => {
    const port = new InMemoryPersistencePort({ [ACCOUNT_KEY]: '{"version":2,"twoStep":{"pin":"123456","email":"a@b.co"}}' });
    const store = new AccountStore(port);
    expect(store.account()).toEqual(DEFAULT_ACCOUNT);
  });

  it('reset removes the key and restores defaults (F-013 convention)', () => {
    const port = new InMemoryPersistencePort();
    const store = new AccountStore(port);
    store.setTwoStep('123456', 'a@b.co');
    store.setDeviceNumber('+1 555-0100');

    store.reset();

    expect(port.read(ACCOUNT_KEY)).toBeNull();
    expect(store.account()).toEqual(DEFAULT_ACCOUNT);
  });
});