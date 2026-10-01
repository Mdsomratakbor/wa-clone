export interface StatusPhoto {
  /**
   * F-050: a JPEG data URL, already downscaled by `downscaleToJpegDataUrl`. Held as
   * a string because `PersistencePort`'s payload is an opaque string (F-047), so a
   * photo needs no new adapter and no change to the seam.
   */
  dataUrl: string;
  width: number;
  height: number;
}

export interface StatusEntry {
  id: string;
  text: string;
  createdAtMs: number;
  /**
   * F-050 FR-001: optional and additive, so a snapshot written by F-049 loads
   * unchanged and no migration is needed. A text status simply has no photo, and a
   * malformed photo is dropped at load rather than allowed to render `undefined`.
   */
  photo?: StatusPhoto;
}
