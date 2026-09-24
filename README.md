# storybook-addon-multi-preview

[![npm version](https://img.shields.io/npm/v/storybook-addon-multi-preview)](https://www.npmjs.com/package/storybook-addon-multi-preview)
[![license](https://img.shields.io/npm/l/storybook-addon-multi-preview)](https://github.com/gonzalofj/storybook-addon-multi-preview/blob/main/LICENSE)
[![CI](https://github.com/gonzalofj/storybook-addon-multi-preview/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/gonzalofj/storybook-addon-multi-preview/actions/workflows/ci.yml)

A [Storybook](https://storybook.js.org) addon that renders the active story once per configured
viewport, **side by side**, each inside a **real iframe** — so media queries, `vw`/`vh` units and
fluid typography behave at each frame's true width, exactly as they would on that device.

Activate it from the toolbar: a dropdown (split-screen icon) switches the canvas between a single
preview and a compare grid of every configured viewport, scaled to fit or shown at natural size.

## Requirements

- Storybook `^10.0.0` (peer dependency)
- React renderer

## Install

```sh
bun add storybook-addon-multi-preview
# or
npm install storybook-addon-multi-preview --save-dev
```

## Setup

Add it to the `addons` array in `.storybook/main.ts`:

```ts
const config: StorybookConfig = {
  addons: ['storybook-addon-multi-preview'],
};
```

That's it — Storybook 10 auto-wires the addon's manager and preview entries; no preset or manual
registration needed.

## Usage

Open a story and use the toolbar dropdown:

- **Fit zoom** (default) — one frame per viewport, each scaled as large as the preview area allows,
  wrapping into rows on narrow windows.
- **No zoom** — every frame at natural size (scroll horizontally if needed), useful for pixel-checking.
- While compare mode is active, the selected value is shown next to the toolbar icon, and a
  **Disable multi-preview** reset item turns it off again.
- While active, the core viewport tool is hidden (the compare grid owns the preview size) and any
  selected viewport is reset.

Every frame is a genuine iframe pointing at the story, so each one re-runs the story with real
responsive behavior at its width — media queries and viewport-unit CSS are correct per frame, and
Storybook's canvas zoom does not affect them.

### Choosing which viewports to compare

The addon reads `parameters.viewport.options` from your project (the same viewports the core
viewport tool uses). If none are defined, a built-in mobile/tablet/desktop fallback set is used.
Viewport sizes must be in `px` (e.g. `'360px'`) — options using other units such as `'50%'` are
silently skipped.

## Configuration

Configure per story, per component, or globally under the `multiPreview` parameter key:

```ts
// MyComponent.stories.ts (CSF3)
import type { Meta } from '@storybook/react-vite';

const meta: Meta = {
  component: MyComponent,
  parameters: {
    multiPreview: {
      viewports: ['mobile1', 'tablet'], // subset of viewport option keys (default: all)
      zoom: 0.5,                        // number | 'fit' | 'none' (default: 'fit')
      gap: 24,                          // px between frames (default: 24)
      padding: 16,                      // px around the grid (default: 16)
    },
  },
};

export default meta;
```

```ts
// .storybook/preview.ts — project-wide defaults
const preview: Preview = {
  parameters: {
    multiPreview: {
      gap: 12,
    },
  },
};
```

To turn the addon off for specific stories:

```ts
const meta: Meta = {
  component: IsolatedWidget,
  parameters: {
    multiPreview: { disable: true },
  },
};
```

| Parameter  | Type                        | Default  | Description                                              |
| ---------- | --------------------------- | -------- | -------------------------------------------------------- |
| `disable`  | `boolean`                   | `false`  | Turn the addon off for specific stories or the project.  |
| `viewports`| `string[]`                  | all      | Keys of `parameters.viewport.options` to render.         |
| `zoom`     | `number \| 'fit' \| 'none'` | `'fit'`  | `'fit'` scales the grid to the preview width, `'none'` renders frames at natural size, a number is used as-is. |
| `gap`      | `number`                    | `24`     | Gap between frames in px.                                |
| `padding`  | `number`                    | `16`     | Padding around the grid in px.                           |

### Zoom behavior

The toolbar zoom takes precedence over parameters: picking **No zoom** (the global
`multiPreviewZoom: 'none'`) renders frames at scale 1 regardless of parameters. **Fit** defers to
your configuration, so an explicit numeric `parameters.multiPreview.zoom` keeps applying.

## Links

- [Documentation](https://gonzalofj.github.io/storybook-addon-multi-preview/)
- [GitHub repository](https://github.com/gonzalofj/storybook-addon-multi-preview)
- [Issue tracker](https://github.com/gonzalofj/storybook-addon-multi-preview/issues)

There is no separate changelog — releases are tagged on GitHub.

## Contributing

Contributions are welcome! See [CONTRIBUTING.md](./CONTRIBUTING.md) for the development setup and
the branch model — pull requests target the `dev` branch.

## License

MIT — see [LICENSE](./LICENSE). The toolbar icon is the "splitscreen_right" glyph from
[Material Symbols](https://github.com/google/material-design-icons) (Apache License 2.0), inlined
as a single SVG.
