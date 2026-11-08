// The one list of tools. The home page and the tools page both read from it,
// so they can't drift apart. Wording for each tool lives in src/text/en.ts,
// found with the tool's `key`.

import type { text } from '../text/en';

// From simplest to most advanced. Group names describe topics, never a person's level.
export const GROUP_ORDER = ['getting-started', 'building-habits', 'planning-ahead'] as const;

export type GroupId = (typeof GROUP_ORDER)[number];

export interface Tool {
  key: keyof typeof text.toolList; // Finds the tool's wording in text.toolList
  url: string;
  icon: string;
  group: GroupId;
}

export const TOOLS: Tool[] = [
  { key: 'credit', url: '/credit-score-and-interest/', icon: '/icons/gauge.svg', group: 'getting-started' },
  { key: 'budget', url: '/budget/', icon: '/icons/wallet.svg', group: 'getting-started' },
  { key: 'debt', url: '/debt-or-emergency-fund/', icon: '/icons/scale.svg', group: 'building-habits' },
];

export interface ToolGroup {
  id: GroupId;
  tools: Tool[];
}

// Groups in the right order. A group with no tools is left out.
export function groupTools(tools: Tool[] = TOOLS): ToolGroup[] {
  return GROUP_ORDER.map((id) => ({ id, tools: tools.filter((tool) => tool.group === id) })).filter(
    (group) => group.tools.length > 0,
  );
}
