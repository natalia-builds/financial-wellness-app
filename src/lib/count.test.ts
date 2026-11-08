import { describe, expect, it, vi } from 'vitest';
import { COUNT_ENDPOINT, COUNT_SCRIPT } from './analytics';
import {
  createUsedReporter,
  feedbackEvent,
  isLiveSite,
  QUESTIONS,
  sendEvent,
  startCounting,
  usedEvent,
} from './count';
import { TOOLS } from './tools';

const live = { hostname: 'financial-wellness-app.pages.dev' };

describe('event names', () => {
  it('follows the pattern from Issue #23', () => {
    expect(feedbackEvent('helpful', 'credit', 'yes')).toBe('helpful/credit/yes');
    expect(feedbackEvent('helpful', 'debt', 'no')).toBe('helpful/debt/no');
    expect(feedbackEvent('goal', 'credit', 'not-yet')).toBe('goal/credit/not-yet');
    expect(feedbackEvent('goal', 'debt', 'yes')).toBe('goal/debt/yes');
    expect(usedEvent('credit')).toBe('used/credit');
    expect(usedEvent('debt')).toBe('used/debt');
  });

  it('never starts with a slash, which GoatCounter does not allow, for any tool or answer', () => {
    const names = TOOLS.flatMap(({ key }) => [
      usedEvent(key),
      ...(Object.keys(QUESTIONS) as (keyof typeof QUESTIONS)[]).flatMap((question) =>
        QUESTIONS[question].map((answer) => feedbackEvent(question, key, answer as never)),
      ),
    ]);
    expect(names.length).toBeGreaterThan(0);
    for (const name of names) {
      expect(name.startsWith('/')).toBe(false);
      expect(name).toMatch(/^[a-z-]+(\/[a-z-]+)+$/);
    }
  });
});

describe('isLiveSite', () => {
  it('accepts only the live address', () => {
    expect(isLiveSite('financial-wellness-app.pages.dev')).toBe(true);
  });

  it('rejects localhost, preview addresses, and look-alikes', () => {
    for (const hostname of [
      'localhost',
      '127.0.0.1',
      '[::1]',
      '',
      'abc123.financial-wellness-app.pages.dev',
      'add-success-measures.financial-wellness-app.pages.dev',
      'financial-wellness-app.pages.dev.example.com',
      'example.com',
    ]) {
      expect(isLiveSite(hostname)).toBe(false);
    }
  });
});

describe('sendEvent', () => {
  it('hands the event to GoatCounter on the live site, with the name and nothing else', () => {
    const count = vi.fn();
    const goatcounter = { count };
    expect(sendEvent('used/credit', { location: live, goatcounter })).toBe(true);
    expect(count).toHaveBeenCalledTimes(1);
    expect(count).toHaveBeenCalledWith({ path: 'used/credit', event: true });
  });

  it('does nothing off the live site', () => {
    const count = vi.fn();
    for (const hostname of ['localhost', 'abc123.financial-wellness-app.pages.dev']) {
      expect(sendEvent('used/credit', { location: { hostname }, goatcounter: { count } })).toBe(false);
    }
    expect(count).not.toHaveBeenCalled();
  });

  it('does nothing when GoatCounter is blocked or has not loaded', () => {
    expect(sendEvent('used/credit', { location: live })).toBe(false);
    expect(sendEvent('used/credit', { location: live, goatcounter: {} })).toBe(false);
  });

  it('never throws, even if GoatCounter fails or the window is unusable', () => {
    const goatcounter = {
      count: () => {
        throw new Error('storage is blocked');
      },
    };
    expect(() => sendEvent('used/credit', { location: live, goatcounter })).not.toThrow();
    expect(sendEvent('used/credit', { location: live, goatcounter })).toBe(false);
    expect(sendEvent('used/credit', {} as never)).toBe(false);
  });
});

describe('startCounting', () => {
  function fakeDocument() {
    const attributes: Record<string, string> = {};
    const script = {
      src: '',
      async: false,
      setAttribute: (name: string, value: string) => {
        attributes[name] = value;
      },
    };
    const appendChild = vi.fn();
    return { doc: { head: { appendChild }, createElement: () => script }, script, attributes, appendChild };
  }

  it('loads the site\'s own copy of the script on the live site', () => {
    const { doc, script, attributes, appendChild } = fakeDocument();
    expect(startCounting(doc, { location: live })).toBe(true);
    expect(script.src).toBe(COUNT_SCRIPT);
    expect(script.async).toBe(true);
    expect(attributes['data-goatcounter']).toBe(COUNT_ENDPOINT);
    expect(JSON.parse(attributes['data-goatcounter-settings'])).toEqual({ no_events: true });
    expect(appendChild).toHaveBeenCalledWith(script);
  });

  it('loads nothing off the live site', () => {
    for (const hostname of ['localhost', 'abc123.financial-wellness-app.pages.dev']) {
      const { doc, appendChild } = fakeDocument();
      expect(startCounting(doc, { location: { hostname } })).toBe(false);
      expect(appendChild).not.toHaveBeenCalled();
    }
  });

  it('never throws', () => {
    const doc = {
      head: {
        appendChild: () => {
          throw new Error('nope');
        },
      },
      createElement: () => ({ src: '', async: false, setAttribute: () => {} }),
    };
    expect(() => startCounting(doc, { location: live })).not.toThrow();
  });
});

describe('createUsedReporter', () => {
  it('sends "used" once per page view, with no values in it', () => {
    const send = vi.fn(() => true);
    const reportUsed = createUsedReporter('debt', send);
    reportUsed();
    reportUsed();
    reportUsed();
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith('used/debt');
  });

  it('tries again on the next change if the event could not be sent', () => {
    const send = vi.fn().mockReturnValueOnce(false).mockReturnValue(true);
    const reportUsed = createUsedReporter('credit', send);
    reportUsed();
    reportUsed();
    reportUsed();
    expect(send).toHaveBeenCalledTimes(2);
  });
});
