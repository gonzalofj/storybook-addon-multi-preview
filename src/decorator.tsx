import React, { useLayoutEffect, useRef, useState } from 'react';
import { useGlobals } from 'storybook/preview-api';
import type { Renderer, StoryContext } from 'storybook/internal/types';

import { KEY, PARAM_KEY, ZOOM_KEY } from './constants';
import { collectFrames, fitZoom, storyHref } from './lib';
import type { MultiPreviewParameters, MultiPreviewZoom } from './types';

function CompareGrid({
  context,
  options,
  zoomGlobal,
}: {
  context: StoryContext<Renderer>;
  options: MultiPreviewParameters;
  zoomGlobal?: MultiPreviewZoom;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [available, setAvailable] = useState<{ width: number; height: number } | null>(null);

  useLayoutEffect(() => {
    // Measure the grid container (its `minWidth: 0` keeps it from being
    // stretched by its own content, so clientWidth is the real row budget)
    // and the preview iframe's viewport for the height budget. Re-read after
    // layout settles: the manager can still be resizing the preview
    // (sidebar/panel transitions) when the decorator first mounts.
    const update = () => {
      const element = containerRef.current;
      setAvailable({
        width: element ? element.clientWidth : document.documentElement.clientWidth,
        height: document.documentElement.clientHeight,
      });
    };
    update();
    let raf = 0;
    const settle = () => {
      update();
      raf = requestAnimationFrame(settle);
    };
    raf = requestAnimationFrame(settle);
    const timeout = setTimeout(() => cancelAnimationFrame(raf), 500);
    const observer =
      typeof ResizeObserver !== 'undefined' && containerRef.current
        ? new ResizeObserver(update)
        : null;
    if (containerRef.current) observer?.observe(containerRef.current);
    window.addEventListener('resize', update);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timeout);
      observer?.disconnect();
      window.removeEventListener('resize', update);
    };
  }, []);

  const frames = collectFrames(context);
  if (frames.length === 0) return null;

  const gap = options.gap ?? 24;
  const padding = options.padding ?? 16;
  // The toolbar's "No zoom" is the only global that overrides parameters;
  // "Fit" defers so an explicit numeric `zoom` parameter keeps applying.
  const zoomSetting: number | MultiPreviewZoom =
    zoomGlobal === 'none' ? 'none' : (options.zoom ?? 'fit');
  const zoom =
    zoomSetting === 'none'
      ? 1
      : typeof zoomSetting === 'number'
        ? zoomSetting
        : fitZoom(available?.width ?? 0, available?.height ?? 0, frames, gap, padding);

  const href = storyHref(context);

  return (
    <div
      ref={containerRef}
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap,
        alignItems: 'flex-start',
        alignContent: 'flex-start',
        padding,
        boxSizing: 'border-box',
        width: '100%',
        minWidth: 0,
        // Safety valve for an explicit numeric `zoom` larger than fits.
        overflowX: 'auto',
      }}
    >
      {frames.map((frame) => (
        <div key={frame.key} style={{ flex: '0 0 auto' }}>
          <div
            style={{
              width: frame.width * zoom,
              height: frame.height * zoom,
              boxSizing: 'border-box',
              border: '1px solid rgba(117, 117, 117, 0.35)',
              borderRadius: 4,
              overflow: 'hidden',
              background: '#fff',
            }}
          >
            <div
              style={{
                width: frame.width,
                height: frame.height,
                transform: `scale(${zoom})`,
                transformOrigin: 'top left',
              }}
            >
              <iframe
                src={href}
                title={`${context.title} — ${frame.name}`}
                style={{ display: 'block', width: '100%', height: '100%', border: 0 }}
              />
            </div>
          </div>
          <div
            style={{
              marginTop: 8,
              fontSize: 11,
              lineHeight: '16px',
              color: '#747474',
              fontFamily:
                'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
            }}
          >
            {frame.name} · {frame.width}×{frame.height}
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Renders the active story once per configured Storybook viewport, each inside
 * a real iframe so media queries and viewport-unit CSS behave at that width.
 */
export const withMultiPreview = (StoryFn: () => any, context: StoryContext<Renderer>) => {
  const [globals] = useGlobals();
  const enabled = globals[KEY] === true;
  const options = context.parameters[PARAM_KEY] as MultiPreviewParameters | undefined;

  if (!enabled || context.viewMode !== 'story' || options?.disable) {
    return StoryFn();
  }

  return <CompareGrid context={context} options={options ?? {}} zoomGlobal={globals[ZOOM_KEY]} />;
};
