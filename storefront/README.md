# MikeScripts storefront — review build

Built 2026-09-25. This is a separate static storefront in `storefront/`. It does not replace the existing repository-root website or modify its deployment. No build step or npm dependencies are required.

## Preview

From the repository root run `python -m http.server 8000` and open `http://localhost:8000/storefront/`.
The delivered `MikeScripts_Preview.html` is also a single-file browsing preview. External product artwork and YouTube need an internet connection. Production checkout requires an HTTPS site; opening the preview as a local file is not a checkout deployment.

## What works now

Four product entries (Flight Simulator, Heavy Rotator Wrecker, Police Helicopter System, Advanced Fire System), five verified purchase variants, category filters, search, product dialogs, image/GIF/video galleries, a per-tab bag, Discord support links, and separate MS100 MAX / MS8000 showcase entries.

With `publicToken` blank, prices say **View on Tebex** and purchases link to the correct hosted Tebex listing. The bag is explicitly not transferred in that fallback mode. Prices, ratings, sales counts, and release dates are not fabricated.

The two aircraft are showcase-only until their actual Tebex package IDs are supplied. No aircraft are advertised as included with the Flight Simulator.

## Connect on-site checkout

1. In `config.js`, set `publicToken` to the store's **Headless public token**. Never commit a private key, plugin secret, password, or Checkout API credential. The public token is intentionally browser-visible. The current format guard accepts a four-character prefix, a hyphen, then 10–100 alphanumeric characters.
2. Publish this `storefront/` directory as the root on a commerce-permitted HTTPS host. Keep source control on GitHub. Do **not** use GitHub Pages to host the production commercial storefront: GitHub's Pages limits prohibit sites primarily facilitating commercial transactions.
3. Test the real store on that exact host: catalog response and CORS, FiveM authentication return, one-time and monthly options, basket totals, canceled checkout, SDK popup/mobile tab, receipt, and actual Tebex fulfillment. Configure any Tebex domain settings required by your account. Product-specific variables and special purchase restrictions may require additional work; unexpected basket contents or API errors deliberately stop this checkout and leave the hosted store link available.
4. Confirm your package configuration, license disclosures, refund terms and privacy disclosures before launch. The FAQ's data description is a technical summary, not a substitute for a reviewed legal policy.

Integration uses **Headless API + Tebex.js**, not the separate Checkout API. Payment credentials never pass through this site's own forms. It sends package IDs and quantity 1; authoritative prices and checkout URLs come from Tebex. Authorization comes from the API response, not the URL hash. API failures are not automatically retried; a manual retry reads the basket first to avoid adding an item twice. No client-side entitlement or resource delivery is implemented.

## Add your aircraft media

In `config.js` update each aircraft's `cover` and `media` fields, for example:

```js
cover: 'assets/ms8000/cover.webp',
media: [
  {type: 'image', url: 'assets/ms8000/cabin.webp', label: 'Walkable cabin'},
  {type: 'video', url: 'assets/ms8000/walkthrough.mp4', label: 'Cabin walkthrough'},
  {type: 'youtube', url: 'https://www.youtube.com/watch?v=YOUR_VIDEO_ID', label: 'Showcase'}
],
variants: [] // Leave empty until the actual package ID and purchase type are confirmed.
```

Add the matching files under `storefront/assets/`. Prefer descriptive file names without spaces. Supported local extensions: PNG, JPEG, WebP, GIF, AVIF, MP4, WebM. HTTPS media URLs are also supported. The included aircraft panels are intentional typography, not invented screenshots. Update `summary`, `description`, `features`, and `requirements` to your approved copy.

The existing script artwork/GIFs are linked from the official MikeScripts Tebex listings. They are not copied into this source package and can change or fail externally. The logo is a small embedded derivative of the supplied MikeScripts emblem, in `brand.js`.

## Files

- `index.html`: page structure and accessible dialogs.
- `styles.css`: responsive desktop/mobile styling and reduced-motion rules.
- `config.js`: products, media, support links, public token.
- `tebex.js`: isolated, validated Headless API client.
- `app.js`: catalog, galleries, bag, authentication return, checkout UI.
- `brand.js`: embedded supplied logo.

## Validation

Run the supplied package's tests from its root:

```sh
node --check storefront/app.js
node --check storefront/tebex.js
node --test tests/tebex.test.cjs
python tests/browser_test.py
```

The browser test requires Python Playwright and Chromium. It uses `/usr/bin/chromium`; change the executable path for your machine. The test harness inlines source into an isolated browser origin because browser navigation is blocked in the build environment. It stubs location, storage, Headless API and Tebex.js; it does not validate a live transaction or external navigation. These adapters are **test-only**, not shipped in the site.

Results: 9 API-client tests and 15 browser checks passed. Browser widths: 320, 390, 768, 1024, 1440 pixels; no page horizontal overflow. Fixed an aircraft-card overlay that intercepted the detail button and a 320px header overflow. Real payment, auth redirect, CORS, native storage persistence, fulfillment and external media loading remain launch checks. Layout screenshots in `qa/` are explicitly offline fallbacks, not product-image verification.

## Source references (checked 2026-09-25)

Store: https://mikescripts.tebex.io/category/3248219
Packages: https://mikescripts.tebex.io/package/7324328 ; https://mikescripts.tebex.io/package/7472845 ; https://mikescripts.tebex.io/package/7692812 ; https://mikescripts.tebex.io/package/7426329 ; https://mikescripts.tebex.io/package/7437723
Public token: https://docs.tebex.io/developers/headless-api/authorization
Basket flow: https://docs.tebex.io/developers/headless-api/endpoints
Checkout UI: https://docs.tebex.io/developers/tebex.js/checkout
GitHub Pages limit: https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits
