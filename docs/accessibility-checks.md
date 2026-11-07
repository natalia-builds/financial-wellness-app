# Accessibility checks

Run these on every page a change touches, before opening a pull request. They check the change against WCAG 2.2 Level AA. They don't replace the full review and the screen reader testing in [Issue #16](https://github.com/natalia-builds/financial-wellness-app/issues/16).

Use the production build or the Cloudflare preview, not only the dev server. Check light and dark modes.

## 1. Automated scan

Run [axe-core](https://github.com/dequelabs/axe-core) on each changed page, in light and dark mode. Paste this into the browser console, or run it with the browser's JavaScript tool:

```js
await new Promise((resolve, reject) => {
  const script = document.createElement('script');
  script.src = 'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.10.2/axe.min.js';
  script.onload = resolve;
  script.onerror = reject;
  document.head.appendChild(script);
});
const result = await axe.run(document, {
  runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'] },
});
({ violations: result.violations.map((v) => `${v.id}: ${v.help}`), needsReview: result.incomplete.map((v) => v.id) });
```

Fix every violation. Look at each "needs review" item by hand. Automated tools catch only some problems, so continue with the checks below.

## 2. Checks by hand

| What to check | How | WCAG |
| --- | --- | --- |
| Structure | One `h1`, headings in order with no skipped levels, lists and tables use real elements, landmarks are labeled | 1.3.1, 2.4.6 |
| Images | Decorative images have `alt=""`; meaningful ones describe what they show | 1.1.1 |
| Page title | Says what the page is | 2.4.2 |
| Contrast | Text 4.5:1 or higher (3:1 for large text), interface parts and focus outlines 3:1 or higher, in light and dark modes | 1.4.3, 1.4.11 |
| Color | Meaning never depends on color alone | 1.4.1 |
| Reflow | No sideways page scrolling at 320px wide (also check 375px) | 1.4.10 |
| Text spacing | Apply the spacing below; nothing is cut off or overlaps | 1.4.12 |
| Zoom | Double the text size at about 640px wide; nothing is cut off and the page doesn't scroll sideways | 1.4.4 |
| Keyboard | Tab through the whole page from the top: everything works, the order makes sense, and nothing traps focus | 2.1.1, 2.1.2, 2.4.3 |
| Focus | Every focused element has a visible outline, and nothing (such as a sticky header) hides it | 2.4.7, 2.4.11 |
| Target size | Links and buttons are at least 24 by 24 pixels, or have that much space around them | 2.5.8 |
| Links | Each link's text says where it goes | 2.4.4 |
| Changing content | Results and errors are announced (`aria-live`); errors are linked to their field and marked `aria-invalid` | 4.1.3, 3.3.1 |
| Consistency | Navigation and repeated parts look and work the same on every page | 3.2.3, 3.2.4 |

Text spacing to apply for the 1.4.12 check:

```css
* { line-height: 1.5 !important; letter-spacing: 0.12em !important; word-spacing: 0.16em !important; }
p { margin-bottom: 2em !important; }
```

## 3. Say what was and wasn't tested

In the pull request, list the results by WCAG criterion and say plainly what wasn't tested. Usually that includes screen readers, real phones, browsers other than the one used, and Windows high contrast mode. Never describe a page as fully compliant unless it has had a full review.
