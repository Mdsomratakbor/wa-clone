import { Injectable, inject } from '@angular/core';
import { PrefsStore } from './prefs.store';

// F-060 FR-005/FR-006. The send-feedback consumer in ChatWindowPage plays a short
// tone and/or a vibration after the store accepts a sent message. `BrowserFeedbackEffects`
// is the seam: ChatWindowPage/SendFeedback specs override that provider with a
// recording fake, so the routing is asserted deterministically without a real
// speaker or vibration motor (research.md section 2, F-047 mental model).

@Injectable({ providedIn: 'root' })
export class BrowserFeedbackEffects {
  // Best-effort by design: the browser may lack an AudioContext (or autoplay may
  // block one), and navigator.vibrate is not present on every platform. Both must
  // degrade to a silent no-op, never a throw - sending the message must still work
  // if the notification prefs point at hardware this device does not have.
  tone(): void {
    try {
      const windowRef = window as unknown as { webkitAudioContext?: typeof AudioContext };
      const AudioCtor = window.AudioContext ?? windowRef.webkitAudioContext;
      if (!AudioCtor) {
        return;
      }
      const context = new AudioCtor();
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      // PROVISIONAL tone shape - research.md section 3; no Figma node exists for a
      // local synth. Short sine glide, quiet gain, a "sent" blip, not a sound.
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, context.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(620, context.currentTime + 0.15);
      gain.gain.setValueAtTime(0.04, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.15);
      oscillator.connect(gain);
      gain.connect(context.destination);
      void oscillator.start();
      void oscillator.stop(context.currentTime + 0.15);
      void context.close();
    } catch {
      // Missing/blocked audio surface: silent no-op.
    }
  }

  vibrate(): void {
    // PROVISIONAL pattern - research.md section 3. Single short pulse.
    try {
      if (typeof navigator.vibrate === 'function') {
        navigator.vibrate([60]);
      }
    } catch {
      // Platform refused the vibration: silent no-op.
    }
  }
}

@Injectable({ providedIn: 'root' })
export class SendFeedback {
  private readonly prefs = inject(PrefsStore);
  private readonly effects = inject(BrowserFeedbackEffects);

  // FR-005: fired only after the store accepts a send; the page gates on the
  // store's return before calling this, so a blank draft or refused file never
  // reaches here.
  onMessageSent(): void {
    if (this.prefs.prefs().sound) {
      this.effects.tone();
    }
    if (this.prefs.prefs().vibrate) {
      this.effects.vibrate();
    }
  }
}