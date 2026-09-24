import React, { Fragment, memo, useCallback } from 'react';
import { useGlobals } from 'storybook/manager-api';
import { Select } from 'storybook/internal/components';

import { KEY, TOOL_ID, ZOOM_KEY } from './constants';
import type { MultiPreviewZoom } from './types';

// Material Symbols Outlined "splitscreen_right" glyph, wght 200, inlined from
// google/material-design-icons (Apache-2.0) so the addon ships one SVG path
// instead of the icon font. No JSX here: Storybook's manager globals map does
// not provide react/jsx-runtime, so manager code must use React.createElement.
function SplitScreenIcon() {
  return React.createElement(
    'svg',
    {
      xmlns: 'http://www.w3.org/2000/svg',
      height: 14,
      viewBox: '0 -960 960 960',
      width: 14,
      fill: 'currentColor',
    },
    React.createElement('path', {
      d: 'M600-160q-27.62 0-46.12-18.5-18.5-18.5-18.5-46.12v-510.76q0-27.62 18.5-46.12Q572.38-800 600-800h110.77q27.61 0 46.12 18.5 18.5 18.5 18.5 46.12v510.76q0 27.62-18.5 46.12-18.51 18.5-46.12 18.5H600Zm-350.77 0q-27.61 0-46.11-18.5-18.51-18.5-18.51-46.12v-510.76q0-27.62 18.51-46.12 18.5-18.5 46.11-18.5H360q27.62 0 46.12 18.5 18.5 18.5 18.5 46.12v510.76q0 27.62-18.5 46.12Q387.62-160 360-160H249.23Zm-24.61-575.38v510.76q0 9.24 7.69 16.93Q240-200 249.23-200H360q9.23 0 16.92-7.69 7.7-7.69 7.7-16.93v-510.76q0-9.24-7.7-16.93Q369.23-760 360-760H249.23q-9.23 0-16.92 7.69-7.69 7.69-7.69 16.93Z',
    }),
  );
}

const ZOOM_OPTIONS: { value: MultiPreviewZoom; title: string }[] = [
  { value: 'fit', title: 'Fit zoom' },
  { value: 'none', title: 'No zoom' },
];

export const Tool = memo(function MultiPreviewTool() {
  const [globals, updateGlobals, storyGlobals] = useGlobals();

  const isLocked = KEY in storyGlobals;
  const isActive = globals[KEY] === true;
  const zoom = (globals[ZOOM_KEY] ?? 'fit') as MultiPreviewZoom;

  const select = useCallback((value: string | number | null | boolean | undefined) => {
    // Compare mode owns the preview size — reset any selected viewport so
    // the outer preview goes back to responsive. Same shape the core
    // viewport tool's own reset action writes.
    updateGlobals({
      [KEY]: true,
      [ZOOM_KEY]: value === 'none' ? 'none' : 'fit',
      viewport: { value: undefined, isRotated: false },
    });
  }, []);

  const reset = useCallback(() => {
    updateGlobals({ [KEY]: false, [ZOOM_KEY]: 'fit' });
  }, []);

  // While compare mode is on, the core viewport selector fights with the
  // fixed-width iframes, so hide it (both of its possible aria-labels).
  // The Select renders the selected option's title next to the icon — the
  // same "value in the toolbar button" behavior as the core viewport tool —
  // only while compare mode is active.
  return React.createElement(
    Fragment,
    null,
    isActive
      ? React.createElement(
          'style',
          { key: 'multi-preview-hide-viewport' },
          'button[aria-label="Viewport size"], button[aria-label="Viewport size set by story parameters"] { display: none !important; }',
        )
      : null,
    React.createElement(Select, {
      key: TOOL_ID,
      size: 'small',
      padding: 'small',
      disabled: isLocked,
      ariaLabel: 'Multi-preview zoom',
      tooltip: 'Preview story across viewports',
      options: ZOOM_OPTIONS,
      defaultOptions: isActive ? zoom : undefined,
      onSelect: select,
      onReset: isActive ? reset : undefined,
      resetLabel: 'Disable multi-preview',
      icon: React.createElement(SplitScreenIcon),
    }),
  );
});
