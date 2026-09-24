import type { ProjectAnnotations, Renderer } from 'storybook/internal/types';

import { withMultiPreview } from './decorator';
import { KEY, ZOOM_KEY } from './constants';
import './types';

const preview: ProjectAnnotations<Renderer> = {
  decorators: [withMultiPreview],
  initialGlobals: {
    [KEY]: false,
    [ZOOM_KEY]: 'fit',
  },
};

export default preview;
