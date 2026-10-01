/**
 * F-050 FR-004. Turns a picked file into a JPEG data URL small enough to persist.
 *
 * ## Why this is not in the store
 *
 * Decoding and encoding are asynchronous, and the three stores hydrate in their
 * constructors. Making `StatusStore` async to accommodate one image pipeline would
 * change the shape every store shares (research §6), so the pipeline lives here as a
 * pure function and the store only ever sees a finished string.
 *
 * ## Why the edge cap and the character budget are separate
 *
 * The edge cap controls how much detail is thrown away; the character budget
 * controls whether the result can be persisted at all. The cap is what makes the
 * budget reachable, and `StatusStore.publishPhoto` enforces the budget (FR-007),
 * because the adapter swallows quota errors and only the store can keep the visible
 * status and the persisted status identical.
 */

/** Longest edge, in pixels, of the stored photo. */
export const PHOTO_MAX_EDGE = 640;

/**
 * F-050 FR-007 / research §5. The origin's `localStorage` quota is browser-dependent
 * and already shared with the chat, call and prefs snapshots, so this is a
 * deliberately pessimistic character count on the data URL rather than a byte figure
 * pretending to a precision the platform does not offer. A base64 string is ~4/3 the
 * size of its binary, and a 640px JPEG at quality 0.72 lands far below this, so the
 * cap is headroom rather than the binding constraint.
 */
export const PHOTO_MAX_CHARS = 400_000;

/** Encoder quality. Fixed rather than exposed: an unsourced quality ladder is a guess. */
const JPEG_QUALITY = 0.72;

/**
 * Decodes `file` and re-encodes it as a downscaled JPEG data URL.
 *
 * Resolves `null` — never rejects — when the file is not a decodable image, so the
 * caller has one failure path to handle and a bad file cannot leave a broken preview
 * behind or an unhandled rejection in the page.
 */
export function downscaleToJpegDataUrl(
  file: File,
  maxEdge: number = PHOTO_MAX_EDGE,
  quality: number = JPEG_QUALITY,
): Promise<string | null> {
  return new Promise((resolve) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    const finish = (value: string | null): void => {
      URL.revokeObjectURL(objectUrl);
      resolve(value);
    };

    image.onload = () => {
      const sourceWidth = image.naturalWidth;
      const sourceHeight = image.naturalHeight;
      if (sourceWidth === 0 || sourceHeight === 0) {
        finish(null);
        return;
      }

      // Never enlarge: upscaling a small photo would inflate the payload and invent
      // detail that was never captured.
      const scale = Math.min(1, maxEdge / Math.max(sourceWidth, sourceHeight));
      const width = Math.max(1, Math.round(sourceWidth * scale));
      const height = Math.max(1, Math.round(sourceHeight * scale));

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext('2d');
      if (context === null) {
        finish(null);
        return;
      }
      context.drawImage(image, 0, 0, width, height);
      finish(canvas.toDataURL('image/jpeg', quality));
    };

    // An undecodable file lands here. Reporting it as "no photo" is the honest
    // outcome: FR-004 requires the preview to stay empty and Send disabled.
    image.onerror = () => finish(null);

    image.src = objectUrl;
  });
}
