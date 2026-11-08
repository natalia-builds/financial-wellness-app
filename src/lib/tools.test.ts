import { describe, expect, it } from 'vitest';
import { text } from '../text/en';
import { GROUP_ORDER, groupTools, TOOLS } from './tools';
import type { Tool } from './tools';

const tool = (key: string, group: Tool['group']): Tool => ({
  key: key as Tool['key'],
  url: `/${key}/`,
  icon: '/icons/x.svg',
  group,
});

describe('TOOLS', () => {
  it('puts every tool in a known group', () => {
    for (const { group } of TOOLS) {
      expect(GROUP_ORDER).toContain(group);
    }
  });

  it('has wording and a group description for everything it uses', () => {
    for (const { key, group } of TOOLS) {
      expect(text.toolList).toHaveProperty(key);
      expect(text.toolsPage.groups).toHaveProperty(group);
    }
  });

  it('has no duplicate keys or URLs', () => {
    expect(new Set(TOOLS.map((t) => t.key)).size).toBe(TOOLS.length);
    expect(new Set(TOOLS.map((t) => t.url)).size).toBe(TOOLS.length);
  });

  it('puts the credit score and budget tools under Getting started and the debt tool under Building habits', () => {
    const groups = groupTools();
    expect(groups.map((g) => [g.id, g.tools.map((t) => t.key)])).toEqual([
      ['getting-started', ['credit', 'budget']],
      ['building-habits', ['debt']],
    ]);
  });
});

describe('groupTools', () => {
  it('orders groups simplest to most advanced, whatever order the tools are listed in', () => {
    const groups = groupTools([tool('c', 'planning-ahead'), tool('a', 'getting-started'), tool('b', 'building-habits')]);
    expect(groups.map((g) => g.id)).toEqual(['getting-started', 'building-habits', 'planning-ahead']);
  });

  it('leaves out groups that have no tools', () => {
    expect(groupTools([tool('a', 'getting-started')]).map((g) => g.id)).toEqual(['getting-started']);
    expect(groupTools([])).toEqual([]);
  });

  it('keeps tools in their listed order inside a group', () => {
    const [group] = groupTools([tool('first', 'getting-started'), tool('second', 'getting-started')]);
    expect(group.tools.map((t) => t.key)).toEqual(['first', 'second']);
  });
});
