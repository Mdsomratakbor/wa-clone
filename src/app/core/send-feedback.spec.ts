import { TestBed } from '@angular/core/testing';
import {
  BrowserFeedbackEffects,
  SendFeedback,
} from './send-feedback';
import { PrefsStore } from './prefs.store';

describe('SendFeedback (F-060 FR-005/FR-006)', () => {
  function fakeEffects(): {
    tone: jasmine.Spy;
    vibrate: jasmine.Spy;
    provider: unknown;
  } {
    const tone = jasmine.createSpy('tone');
    const vibrate = jasmine.createSpy('vibrate');
    return {
      tone,
      vibrate,
      provider: { provide: BrowserFeedbackEffects, useValue: { tone, vibrate } },
    };
  }

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [fakeEffects().provider],
    });
    TestBed.inject(PrefsStore).reset();
  });

  function setup(): {
    feedback: SendFeedback;
    tone: jasmine.Spy;
    vibrate: jasmine.Spy;
    prefs: PrefsStore;
  } {
    const effects = TestBed.inject(BrowserFeedbackEffects) as unknown as {
      tone: jasmine.Spy;
      vibrate: jasmine.Spy;
    };
    return {
      feedback: TestBed.inject(SendFeedback),
      tone: effects.tone,
      vibrate: effects.vibrate,
      prefs: TestBed.inject(PrefsStore),
    };
  }

  it('fires tone and vibration when both prefs are on (default)', () => {
    const { feedback, tone, vibrate } = setup();
    feedback.onMessageSent();
    expect(tone).toHaveBeenCalledTimes(1);
    expect(vibrate).toHaveBeenCalledTimes(1);
  });

  it('fires nothing when both prefs are off', () => {
    const { feedback, tone, vibrate, prefs } = setup();
    prefs.set('sound', false);
    prefs.set('vibrate', false);
    feedback.onMessageSent();
    expect(tone).not.toHaveBeenCalled();
    expect(vibrate).not.toHaveBeenCalled();
  });

  it('fires only the tone when sound is on and vibration is off', () => {
    const { feedback, tone, vibrate, prefs } = setup();
    prefs.set('vibrate', false);
    feedback.onMessageSent();
    expect(tone).toHaveBeenCalledTimes(1);
    expect(vibrate).not.toHaveBeenCalled();
  });

  it('fires only the vibration when sound is off and vibration is on', () => {
    const { feedback, tone, vibrate, prefs } = setup();
    prefs.set('sound', false);
    feedback.onMessageSent();
    expect(tone).not.toHaveBeenCalled();
    expect(vibrate).toHaveBeenCalledTimes(1);
  });

  it('rereads the prefs on each call - a mid-session toggle changes the next send', () => {
    const { feedback, tone, vibrate, prefs } = setup();
    feedback.onMessageSent();
    prefs.set('sound', false);
    prefs.set('vibrate', false);
    feedback.onMessageSent();
    expect(tone).toHaveBeenCalledTimes(1);
    expect(vibrate).toHaveBeenCalledTimes(1);
  });
});

describe('BrowserFeedbackEffects (F-060 FR-006)', () => {
  it('never throws when the browser has no vibration API and no audio surface', () => {
    const effects = new BrowserFeedbackEffects();
    expect(() => effects.vibrate()).not.toThrow();
    expect(() => effects.tone()).not.toThrow();
  });
});