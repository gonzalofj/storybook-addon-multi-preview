import { addons, types } from 'storybook/manager-api';

import { Tool } from './Tool';
import { ADDON_ID, TOOL_ID } from './constants';

addons.register(ADDON_ID, () => {
  addons.add(TOOL_ID, {
    type: types.TOOL,
    title: 'Multi preview',
    match: ({ viewMode }) => viewMode === 'story',
    render: Tool,
  });
});
