import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StatusStore } from '../../core/status.store';
import { Clock } from '../../core/clock';
import { downscaleToJpegDataUrl } from '../../core/status-photo';
import { StatusKeyboard } from './status-keyboard';

@Component({
  selector: 'app-compose-page',
  imports: [StatusKeyboard],
  templateUrl: './compose-page.html',
  styleUrl: './compose-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComposePage {
  private readonly router = inject(Router);
  private readonly store = inject(StatusStore);
  private readonly clock = inject(Clock);
  private readonly route = inject(ActivatedRoute);

  /**
   * F-050 FR-001. A mode of this screen rather than a new one, so the design-verified
   * `0:9634` surface and glyphs are reused instead of a second chrome being invented.
   * Anything other than `photo` is text mode, so a mistyped or absent param lands on
   * the working screen rather than an empty one.
   */
  protected readonly photoMode = this.route.snapshot.queryParamMap.get('kind') === 'photo';

  protected readonly value = signal('');

  /** F-050 FR-002: the downscaled data URL, held only once an image has decoded. */
  protected readonly photo = signal<string | null>(null);

  /**
   * F-050: decoding is a real async step (read file → decode → draw → encode), and a
   * button that sits inert through it reads as broken. It also gives the unit tests a
   * deterministic thing to await: an `Image` load is not a task zone.js tracks, so
   * `whenStable()` returns before the decode lands.
   */
  protected readonly decoding = signal(false);

  protected readonly canSend = computed(() =>
    this.photoMode ? this.photo() !== null : this.value().trim().length > 0,
  );

  protected onValue(event: Event): void {
    this.value.set((event.target as HTMLInputElement).value);
  }

  /**
   * F-051 FR-007: the on-screen keys and the real input edit the same `value` signal,
   * so entry through either is reflected in the field, the keys and Send identically.
   */
  protected onKeyType(character: string): void {
    this.value.update((value) => value + character);
  }

  protected onKeyBackspace(): void {
    this.value.update((value) =>
      value.length === 0 ? value : Array.from(value).slice(0, -1).join(''),
    );
  }

  /**
   * F-050 FR-004. A file that will not decode resolves `null` and leaves the preview
   * empty with `Send` disabled, so a broken file can never be published as a broken
   * image. The decode is awaited here and nowhere else — an in-flight decode must
   * never publish on its own if the user has already navigated away.
   */
  protected onFileChosen(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.item(0);
    if (file === null || file === undefined) {
      return;
    }
    this.decoding.set(true);
    void downscaleToJpegDataUrl(file).then((dataUrl) => {
      this.photo.set(dataUrl);
      this.decoding.set(false);
    });
  }

  protected onClose(): void {
    void this.router.navigate(['/status']);
  }

  protected onSend(): void {
    // F-049/F-050: both publish methods refuse what they cannot store and return null,
    // so the guard is the store's contract rather than a second copy of the same check.
    const entry = this.photoMode
      ? this.store.publishPhoto(this.photo() ?? '', this.clock.now())
      : this.store.publish(this.value(), this.clock.now());
    if (entry === null) {
      return;
    }
    void this.router.navigate(['/status']);
  }
}
