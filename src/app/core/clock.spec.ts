import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Clock } from './clock';

describe('Clock', () => {
  let clock: Clock;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    clock = TestBed.inject(Clock);
  });

  it('now() returns a number (FR-010)', () => {
    expect(typeof clock.now()).toBe('number');
  });

  it('every() does not fire before the interval elapses (FR-010)', fakeAsync(() => {
    let ticks = 0;
    const stop = clock.every(1000, () => (ticks += 1));
    tick(999);
    expect(ticks).toBe(0);
    stop();
  }));

  it('every() fires once per interval (FR-010)', fakeAsync(() => {
    let ticks = 0;
    const stop = clock.every(1000, () => (ticks += 1));
    tick(3000);
    stop();
    expect(ticks).toBe(3);
  }));

  it('the returned cleanup stops the interval (FR-010)', fakeAsync(() => {
    let ticks = 0;
    const stop = clock.every(1000, () => (ticks += 1));
    tick(1000);
    stop();
    tick(10_000);
    expect(ticks).toBe(1);
  }));
});
