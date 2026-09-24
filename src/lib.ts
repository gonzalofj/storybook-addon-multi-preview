import { buildArgsParam } from 'storybook/internal/router';
import type { Renderer, StoryContext } from 'storybook/internal/types';
import type { Viewport } from 'storybook/viewport';

import { PARAM_KEY } from './constants';
import type { MultiPreviewParameters } from './types';
import { DEFAULT_VIEWPORTS } from './types';

export interface Frame {
  key: string;
  name: string;
  width: number;
  height: number;
}

export function parsePx(value: string): number | null {
  const match = /^\s*(\d+(?:\.\d+)?)px\s*$/.exec(value);
  return match ? Number(match[1]) : null;
}

export function collectFrames(context: StoryContext<Renderer>): Frame[] {
  const options: Record<string, Viewport> =
    (context.parameters.viewport?.options as Record<string, Viewport> | undefined) ?? DEFAULT_VIEWPORTS;
  const selected = (context.parameters[PARAM_KEY] as MultiPreviewParameters | undefined)?.viewports;
  const keys = selected ?? Object.keys(options);

  return keys.flatMap((key) => {
    const viewport = options[key];
    if (!viewport) return [];
    const width = parsePx(viewport.styles.width);
    const height = parsePx(viewport.styles.height);
    if (width === null || height === null) return [];
    return [{ key, name: viewport.name, width, height }];
  });
}

export const MIN_ZOOM = 0.15;
export const LABEL_HEIGHT = 24; // 16px line + 8px top margin

/** Height of the layout when frames greedily wrap into rows at `zoom`. */
export function wrappedLayoutHeight(zoom: number, frames: Frame[], budgetWidth: number, gap: number): number {
  let rows = 1;
  let rowWidth = 0;
  let rowMaxHeight = 0;
  let totalHeight = 0;
  for (const frame of frames) {
    const width = frame.width * zoom;
    const height = frame.height * zoom;
    const needed = rowWidth === 0 ? width : width + gap;
    if (rowWidth > 0 && rowWidth + needed > budgetWidth) {
      totalHeight += rowMaxHeight + LABEL_HEIGHT;
      rows += 1;
      rowWidth = width;
      rowMaxHeight = height;
    } else {
      rowWidth += needed;
      rowMaxHeight = Math.max(rowMaxHeight, height);
    }
  }
  totalHeight += rowMaxHeight + LABEL_HEIGHT;
  return totalHeight + gap * (rows - 1);
}

/**
 * Largest zoom in [MIN_ZOOM, 1] whose wrapped layout fits the preview area.
 * Layout height grows monotonically with zoom, so binary search works.
 */
export function fitZoom(availableWidth: number, availableHeight: number, frames: Frame[], gap: number, padding: number): number {
  const budgetWidth = availableWidth - padding * 2;
  if (budgetWidth <= 0 || availableHeight <= 0) return 1;
  const widest = Math.max(...frames.map((frame) => frame.width));
  const hi = Math.min(1, budgetWidth / widest);
  if (hi <= MIN_ZOOM) return MIN_ZOOM;
  if (wrappedLayoutHeight(hi, frames, budgetWidth, gap) <= availableHeight) return hi;
  let lo = MIN_ZOOM;
  let high = hi;
  for (let i = 0; i < 30; i++) {
    const mid = (lo + high) / 2;
    if (wrappedLayoutHeight(mid, frames, budgetWidth, gap) <= availableHeight) {
      lo = mid;
    } else {
      high = mid;
    }
  }
  return lo;
}

export function storyHref(context: StoryContext<Renderer>): string {
  const params = new URLSearchParams();
  params.set('id', context.id);
  params.set('viewMode', 'story');
  const args = buildArgsParam(context.initialArgs, context.args);
  if (args) params.set('args', args);
  // No `globals` param: inner frames load with default globals, which keeps
  // this decorator disabled inside them (no infinite recursion).
  return `./iframe.html?${params.toString()}`;
}
