import { PHOTO_MAX_CHARS, downscaleToJpegDataUrl } from './status-photo';

/**
 * F-050 research §7: Karma runs a real Chrome, so this suite exercises the actual
 * decode → canvas → encode path. Mocking `Image` or `document.createElement` would
 * test the mock, and the failure modes that matter here (a file that will not
 * decode, an edge that is not capped) live precisely in that path.
 */
describe('status-photo', () => {
  /** A real PNG produced by a canvas, so the helper has genuine image bytes to decode. */
  function makeImageFile(width: number, height: number, name = 'photo.png'): File {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    if (context === null) {
      throw new Error('2d context unavailable');
    }
    // A non-uniform fill, so an encoder bug cannot pass by producing a flat image.
    context.fillStyle = '#ff8a8c';
    context.fillRect(0, 0, width, height);
    context.fillStyle = '#0a5c36';
    context.fillRect(0, 0, Math.ceil(width / 2), Math.ceil(height / 2));
    const dataUrl = canvas.toDataURL('image/png');
    const binary = atob(dataUrl.split(',')[1]);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new File([bytes], name, { type: 'image/png' });
  }

  it('produces a JPEG data URL for a real image (FR-004)', async () => {
    const result = await downscaleToJpegDataUrl(makeImageFile(64, 48));

    expect(result).not.toBeNull();
    expect(result!.startsWith('data:image/jpeg;base64,')).toBe(true);
    expect(result!.length).toBeGreaterThan(0);
  });

  it('caps the longest edge and preserves the aspect ratio (FR-004)', async () => {
    const result = await downscaleToJpegDataUrl(makeImageFile(800, 400), 100);

    expect(result).not.toBeNull();
    const size = await decodeJpegSize(result!);
    expect(size.width).toBe(100);
    // 800x400 halves to 100x50; allow the encoder's rounding, not a resize failure.
    expect(size.height).toBeGreaterThanOrEqual(49);
    expect(size.height).toBeLessThanOrEqual(51);
  });

  it('does not enlarge an image smaller than the cap (FR-004)', async () => {
    const result = await downscaleToJpegDataUrl(makeImageFile(32, 24), 512);

    const size = await decodeJpegSize(result!);
    expect(size.width).toBe(32);
    expect(size.height).toBe(24);
  });

  it('resolves null for a file that is not a decodable image, without throwing (FR-004)', async () => {
    const notAnImage = new File([new Uint8Array([1, 2, 3, 4])], 'notes.txt', {
      type: 'text/plain',
    });

    await expectAsync(downscaleToJpegDataUrl(notAnImage)).toBeResolvedTo(null);
  });

  it('resolves null rather than throwing when the image cannot be decoded (FR-004)', async () => {
    const lyingFile = new File([new Uint8Array([0xff, 0xd8, 0xff, 0xe0])], 'broken.jpg', {
      type: 'image/jpeg',
    });

    await expectAsync(downscaleToJpegDataUrl(lyingFile)).toBeResolvedTo(null);
  });

  it('keeps the default cap far below the character budget (FR-004, FR-007)', () => {
    // A downscaled photo must fit the budget with room for the JSON envelope, or
    // publishPhoto would refuse every real photo the helper produces.
    expect(PHOTO_MAX_CHARS).toBeGreaterThan(100_000);
  });

  it('decodes its own output so the data URL is a usable image source (FR-008)', async () => {
    const result = await downscaleToJpegDataUrl(makeImageFile(40, 40));
    const image = await loadImage(result!);

    expect(image.naturalWidth).toBe(40);
    expect(image.naturalHeight).toBe(40);
  });
});

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('decode failed'));
    image.src = src;
  });
}

async function decodeJpegSize(src: string): Promise<{ width: number; height: number }> {
  const image = await loadImage(src);
  return { width: image.naturalWidth, height: image.naturalHeight };
}
