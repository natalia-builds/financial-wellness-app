// Where anonymous counting is set up. These values are public, not secrets:
// anyone can see them in the page. Counts go to GoatCounter, which sets no
// cookies. See docs/operations.md for the dashboard and Issue #23 for why.

// The address GoatCounter receives counts at.
export const COUNT_ENDPOINT = 'https://fin-wellness.goatcounter.com/count';

// The site's own copy of GoatCounter's script (public/goatcounter.js), so no
// script from another company runs on our pages.
export const COUNT_SCRIPT = '/goatcounter.js';

// Counting happens only here. Local development and Cloudflare preview
// addresses (which end in `.financial-wellness-app.pages.dev`) are never counted.
// If the site gets its own domain, add it here.
export const LIVE_HOSTNAME = 'financial-wellness-app.pages.dev';
