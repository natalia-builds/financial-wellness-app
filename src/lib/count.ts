// Anonymous counting with GoatCounter. Totals only: nothing a person types is
// ever sent, and every function here is safe to call when counting is blocked.
// It never throws and never changes how the page works.

import { COUNT_ENDPOINT, COUNT_SCRIPT, LIVE_HOSTNAME } from './analytics';
import type { Tool } from './tools';

export type ToolKey = Tool['key'];

// Each question and the answers its buttons can send. Answers are fixed words
// from buttons, never typed text.
export const QUESTIONS = {
  helpful: ['yes', 'no'],
  goal: ['yes', 'not-yet'],
} as const;

export type Question = keyof typeof QUESTIONS;
export type Answer<Q extends Question> = (typeof QUESTIONS)[Q][number];

// Event names are paths like `helpful/credit/yes`. GoatCounter doesn't allow a
// leading slash. The tool's key comes from src/lib/tools.ts, so a new tool needs no new code here.
export function feedbackEvent<Q extends Question>(question: Q, tool: ToolKey, answer: Answer<Q>): string {
  return `${question}/${tool}/${answer}`;
}

export function usedEvent(tool: ToolKey): string {
  return `used/${tool}`;
}

// An exact match, so preview addresses like `abc123.financial-wellness-app.pages.dev` don't count.
export function isLiveSite(hostname: string): boolean {
  return hostname === LIVE_HOSTNAME;
}

// The small part of the browser window that counting needs. Tests pass a stand-in.
interface CounterWindow {
  location: { hostname: string };
  goatcounter?: { count?: (vars: { path: string; event: boolean }) => void };
}

interface CounterDocument {
  head: { appendChild: (element: any) => unknown };
  createElement: (tag: 'script') => {
    src: string;
    async: boolean;
    setAttribute: (name: string, value: string) => void;
  };
}

// Loads GoatCounter's script, but only on the live site. It counts the page
// visit by itself once it loads. Returns whether it started loading.
export function startCounting(
  doc: CounterDocument = document,
  win: CounterWindow = window,
): boolean {
  try {
    if (!isLiveSite(win.location.hostname)) return false;
    const script = doc.createElement('script');
    script.src = COUNT_SCRIPT;
    script.async = true;
    script.setAttribute('data-goatcounter', COUNT_ENDPOINT);
    // We send our own events, so the script's click tracking stays off.
    script.setAttribute('data-goatcounter-settings', JSON.stringify({ no_events: true }));
    doc.head.appendChild(script);
    return true;
  } catch {
    return false;
  }
}

// Sends one event. Returns true only if it was handed to GoatCounter. It does
// nothing, and returns false, off the live site, before the script has
// loaded, or when an ad blocker stopped the script.
export function sendEvent(name: string, win: CounterWindow = window): boolean {
  try {
    if (!isLiveSite(win.location.hostname)) return false;
    const count = win.goatcounter?.count;
    if (typeof count !== 'function') return false;
    count.call(win.goatcounter, { path: name, event: true });
    return true;
  } catch {
    return false;
  }
}

// "Calculator used": one event per page view, sent the first time something in
// the calculator changes. It carries no values. If the event couldn't be sent
// (for example, the script hadn't loaded yet), the next change tries again.
export function createUsedReporter(tool: ToolKey, send: (name: string) => boolean = sendEvent): () => void {
  let sent = false;
  return () => {
    if (sent) return;
    sent = send(usedEvent(tool));
  };
}
