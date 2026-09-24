import { describe, expect, it } from 'vitest';
import type { Renderer, StoryContext } from 'storybook/internal/types';

import { collectFrames, fitZoom, MIN_ZOOM, parsePx, storyHref, wrappedLayoutHeight, type Frame } from './lib';
import { DEFAULT_VIEWPORTS } from './types';

const XS: Frame = { key: 'xs', name: 'XS', width: 360, height: 740 };
const LG: Frame = { key: 'lg', name: 'LG', width: 1024, height: 768 };

function context(parameters: Record<string, unknown>, id = 'swee-jobcard--full'): StoryContext<Renderer> {
  return {
    id,
    viewMode: 'story',
    parameters,
    initialArgs: {},
    args: {},
  } as unknown as StoryContext<Renderer>;
}

describe('parsePx', () => {
  it('parses integer and fractional px values', () => {
    expect(parsePx('360px')).toBe(360);
    expect(parsePx(' 12.5px ')).toBe(12.5);
  });

  it('rejects non-px and malformed values', () => {
    expect(parsePx('auto')).toBeNull();
    expect(parsePx('50%')).toBeNull();
    expect(parsePx('360')).toBeNull();
    expect(parsePx('')).toBeNull();
  });
});

describe('collectFrames', () => {
  const viewportOptions = {
    xs: { name: 'XS — phone', styles: { width: '360px', height: '740px' }, type: 'mobile' },
    frac: { name: 'Bad width', styles: { width: '50%', height: '740px' }, type: 'mobile' },
    noheight: { name: 'No height', styles: { width: '768px' }, type: 'tablet' },
    lg: { name: 'LG — desktop', styles: { width: '1024px', height: '768px' }, type: 'desktop' },
  };

  it('follows the configured key order and drops unknown or unparseable viewports', () => {
    const frames = collectFrames(context({
      viewport: { options: viewportOptions },
      multiPreview: { viewports: ['lg', 'frac', 'missing', 'xs'] },
    }));
    expect(frames.map((frame) => frame.key)).toEqual(['lg', 'xs']);
    expect(frames[0]).toEqual({ key: 'lg', name: 'LG — desktop', width: 1024, height: 768 });
  });

  it('renders every parseable viewport when no multiPreview param is set', () => {
    const frames = collectFrames(context({ viewport: { options: viewportOptions } }));
    expect(frames.map((frame) => frame.key)).toEqual(['xs', 'lg']);
  });

  it('falls back to the addon default viewports when the project defines none', () => {
    const frames = collectFrames(context({}));
    expect(frames.map((frame) => frame.key)).toEqual(Object.keys(DEFAULT_VIEWPORTS));
    expect(frames.length).toBeGreaterThan(0);
    for (const frame of frames) {
      expect(frame.width).toBeGreaterThan(0);
      expect(frame.height).toBeGreaterThan(0);
    }
  });
});

describe('wrappedLayoutHeight', () => {
  it('lays two frames out in one row when the budget allows', () => {
    // 360 + gap 24 + 1024 = 1408 fits exactly; height = tallest row (768) + label 24
    expect(wrappedLayoutHeight(1, [XS, LG], 1408, 24)).toBe(792);
  });

  it('wraps into a second row one px short of fitting', () => {
    // row 1: 740 + 24 label; row 2: 768 + 24 label; row gap 24
    expect(wrappedLayoutHeight(1, [XS, LG], 1407, 24)).toBe(1580);
  });

  it('scales frame sizes with zoom before wrapping', () => {
    // At zoom 0.5: 180 + 24 + 512 = 716 fits in 720; height = 384 + 24
    expect(wrappedLayoutHeight(0.5, [XS, LG], 720, 24)).toBe(408);
  });
});

describe('fitZoom', () => {
  it('returns 1 when everything fits comfortably', () => {
    expect(fitZoom(2200, 1200, [XS, LG], 24, 16)).toBe(1);
  });

  it('returns 1 for degenerate budgets', () => {
    expect(fitZoom(10, 1200, [XS, LG], 24, 16)).toBe(1);
    expect(fitZoom(2200, 0, [XS, LG], 24, 16)).toBe(1);
  });

  it('clamps to MIN_ZOOM when even the minimum does not come close', () => {
    expect(fitZoom(100, 1000, [LG], 24, 16)).toBe(MIN_ZOOM);
  });

  it('shrinks zoom until the tallest frame plus label fits the height budget', () => {
    // budgetWidth 1168; 768·z + 24 ≤ 500 → z ≤ 476/768 ≈ 0.6198
    const zoom = fitZoom(1200, 500, [LG], 24, 16);
    expect(Math.abs(zoom - 476 / 768)).toBeLessThan(0.001);
    expect(wrappedLayoutHeight(zoom, [LG], 1168, 24)).toBeLessThanOrEqual(500);
  });
});

describe('storyHref', () => {
  it('encodes id, viewMode and args, and never globals', () => {
    const ctx = context({}, 'swee-jobcard--saved');
    ctx.initialArgs = { saved: false };
    ctx.args = { saved: true };
    const params = new URLSearchParams(storyHref(ctx).split('?')[1]);
    expect(params.get('id')).toBe('swee-jobcard--saved');
    expect(params.get('viewMode')).toBe('story');
    expect(params.get('args')).toContain('true');
    expect(params.has('globals')).toBe(false);
  });

  it('omits the args param when there is nothing to encode', () => {
    const params = new URLSearchParams(storyHref(context({})).split('?')[1]);
    expect(params.has('args')).toBe(false);
  });
});
