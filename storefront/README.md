# MikeScripts — media-first storefront, V2

A static, multi-page storefront rebuilt around product media rather than slogans. No npm install, build server, private keys, stock-aircraft imagery or generated gameplay screenshots.

## Open it

The delivered **MikeScripts_Media_First_Preview.html** is a single-file browsing preview. Open it in a desktop browser. Its source, styles, logo and product information are embedded; the official product images/clips and YouTube still need internet access.

For the actual site, serve this folder over HTTP locally (`python -m http.server 8000`) or publish it on an appropriate HTTPS host. `index.html` is the home page. There are six physical product pages under `products/` and a website-data disclosure under `privacy/`.

The existing repository-root site is untouched. This changes the `storefront/` review build only. Source can stay on GitHub; use commerce-permitted production hosting rather than GitHub Pages. GitHub Pages' published limits exclude sites primarily facilitating commercial transactions.

## What changed

- Full-width featured-product preview, with a manual product selector and play/stop controls.
- Product-led copy, quiet styling, larger image areas and a compact catalogue.
- Individual product URLs, full galleries, thumbnail navigation, keyboard-operable lightbox, and on-demand videos.
- Six Flight gallery entries, four Police entries, four Fire entries, two Wrecker entries.
- Separate MS100 MAX and MS8000 aircraft pages. No invented aircraft images, purchase IDs, prices, customer counts or performance claims.
- Clear included/not-included information and direct original-listing links.
- Responsive layouts, explicit media controls and reduced-motion styling. GIF previews are painted to a canvas as stills until the visitor chooses playback. Cross-origin canvas is painted, never read or exported.
- Tebex basket and payment code separated from the presentation.

## Add the actual aircraft media

Open the supplied **MikeScripts_Media_Studio.html**. Select an aircraft, add real exterior/cabin/cockpit shots and an MP4/WebM or YouTube walkthrough, set the lead item, edit captions and export.

**Export media update ZIP** produces `storefront/media-overrides.js` and the local media files. Merge the update into this source and redeploy. **Create website preview** embeds uploaded media into a new HTML preview for local review. The tool never publishes to GitHub or changes Tebex.

The source `media-studio.html` can export the update ZIP, but its preview-template feature is available in the delivered standalone Media Studio file. Run `build_site.py` from the full source package to regenerate the standalone files.

Accepted file types: PNG, JPEG, WebP, GIF, AVIF, MP4, WebM. SVG/HTML uploads are excluded. Limit: 100 MB per file, 200 MB total. Prefer short compressed video. Unexported edits are lost when the tab closes. Keep your original media.

`media-overrides.js` can also be edited directly. Its object is keyed by product slug; allowed fields are `cover` and `media`. A media item has `type`, `url`, `label` and optional `poster`. Relative paths are rooted in this `storefront/` directory. No price or payment configuration is changed by media overrides.

## Checkout status

`config.js` still has a blank `publicToken`. Therefore **Buy on Tebex** opens the selected official product listing. The local shopping bag is not secretly passed to Tebex; its fallback explains that limitation.

To activate the implemented Headless API + Tebex.js flow, add the store's **Headless public token**, never its private key, to `config.js`. Test on the actual HTTPS production origin. Authentication, purchase restrictions, CORS, payment popups/mobile tabs, cancellation, recurring plans and fulfillment require live verification. The public-token format guard is inherited from V1 and based on Tebex's documented public-token prefix.

Prices are read from Tebex when connected, otherwise omitted. The four currently checked one-time product mappings remain active. The previous monthly Flight mapping (`7472845`) is retained with `needsConfirmation: true` and is not shown: that listing could not be revalidated in this pass. Remove the flag only after confirming the current package, recurrence, availability and content. This is not a claim the monthly product was deleted.

FiveM authentication comes from the provider/API response, not a URL hash. Unexpected basket contents stop checkout. Failed writes are not automatically retried; a manual retry reads the server basket before adding anything. The client never issues entitlements. A return URL alone never confirms a purchase.

## Validation and limitations

9 Node API-client tests and 23 automated browser checks passed. The browser checks cover 35 page/viewport combinations (home plus six products at 320, 390, 768, 1024 and 1440 pixels), galleries, filters, navigation, checkout adapters, and the editor's ZIP and embedded-media output. Two additional smoke checks confirmed standalone preview startup and its product hash navigation.

The execution environment blocks browser navigation and direct network downloads. Tests render source inline. Location, storage, Headless API, SDK and editor-download navigation use explicitly documented test adapters. Official media URLs were collected from the live product listings, but the image/GIF files could not be downloaded or rendered here. Screenshots in `qa/` intentionally show **offline fallback states**, not the real media or a live hosted site.

Real authentication, native persistence across provider redirects, hosted CORS, native download behavior, external media playback, payments, subscriptions and fulfillment remain launch checks. The two aircraft's authentic media and sale package IDs were not available in the retrieved files. Their galleries remain unfilled until supplied.

Run from the source-package root:

```sh
node --check storefront/site.js
node --check storefront/commerce.js
node --check storefront/media-studio.js
node --test tests/tebex.test.cjs
python tests/browser_test.py
```

The browser test uses Python Playwright, Pillow and `/usr/bin/chromium`; adjust that executable for your system. Build scripts are packaging conveniences, not production dependencies.

## Source notes — checked 2026-09-25

Product copy is a brief paraphrase of the owner's official listings. Gallery labels are intentionally generic where the source media could not be visually inspected. Aircraft descriptions use the owner's stated custom/walkable-interior scope, without adding unverified specifications.

- Flight: https://mikescripts.tebex.io/package/7324328
- Wrecker: https://mikescripts.tebex.io/package/7692812
- Police: https://mikescripts.tebex.io/package/7426329
- Fire: https://mikescripts.tebex.io/package/7437723
- Headless auth: https://docs.tebex.io/developers/headless-api/authorization
- Headless endpoints: https://docs.tebex.io/developers/headless-api/endpoints
- Checkout UI: https://docs.tebex.io/developers/tebex.js/checkout
- GitHub Pages limits: https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits

The privacy page describes technical behavior. Review merchant privacy, licensing, refund and purchase disclosures before launching; it is not a reviewed legal policy.
