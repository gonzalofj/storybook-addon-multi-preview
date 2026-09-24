import { MINIMAL_VIEWPORTS } from 'storybook/viewport';
import type { Viewport } from 'storybook/viewport';

export type MultiPreviewZoom = 'fit' | 'none';

export interface MultiPreviewParameters {
  /** Turn the addon off for specific stories or the whole project. */
  disable?: boolean;
  /** Keys of `parameters.viewport.options` to render. Defaults to all of them. */
  viewports?: string[];
  /**
   * Scale applied to each frame. `'fit'` (default) scales the row to the
   * preview width, `'none'` renders frames at natural size, a number is used
   * as-is. The toolbar zoom overrides this only when set to `'none'`.
   */
  zoom?: number | MultiPreviewZoom;
  /** Gap between frames in px. Default 24. */
  gap?: number;
  /** Padding around the row in px. Default 16. */
  padding?: number;
}

/** Used when the project defines no `parameters.viewport.options` of its own. */
export const DEFAULT_VIEWPORTS: Record<string, Viewport> = MINIMAL_VIEWPORTS;

declare module 'storybook/internal/types' {
  export interface Globals {
    multiPreview?: boolean;
    multiPreviewZoom?: MultiPreviewZoom;
  }
}
