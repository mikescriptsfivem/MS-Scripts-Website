# MikeScripts V3 — server-owner experience

This revision keeps the V2 media-first storefront and adds typography, motion and server-planning tools. The repository-root live site is unchanged. Publish `storefront/` only on a commerce-permitted HTTPS host after review. Keep GitHub for source control; this change does not publish or merge the draft.

## Typography and motion

Barlow Condensed (500/600) for product headings, DM Sans (400/500/600/700) for body and controls. Fonts are requested from Google Fonts with `display=swap`; system fonts remain available when offline or blocked. **No font binaries are included.**

The interface uses short Web Animations, staggered product entries, featured-media transitions, gallery/dialog transitions, responsive hover/focus states and a scroll-progress line. Content is never hidden while waiting for an animation. Native scroll, pointer and keyboard behavior remain intact. There is no particle loop, scroll hijacking, custom cursor or unsolicited audio. The footer motion control and `prefers-reduced-motion` disable the effects; the device preference wins. Media remains user-controlled.

## Server-owner tools

- Choose ESX Legacy, QBCore, Qbox or Standalone to filter by **declared** framework support. This is not a scan or guarantee about the visitor's server.
- Compare up to three scripts by package type, framework support, required/optional dependencies, editable files, protection and live price when connected. Unknown/unlisted support stays labelled; no performance numbers are invented.
- Use Ctrl/Cmd+K or `/` for quick search. Results include aircraft and all frameworks. Arrow keys navigate, Enter opens, Escape dismisses.
- Product pages provide required/optional-resource summaries, a personal four-step pre-install checklist and a copyable setup brief. Clipboard failure opens a selectable-text fallback instead of reporting false success.
- A purchase shortcut appears after the product's purchase panel scrolls away. It always uses the selected package and the same Tebex flow. The comparison tray takes priority to avoid overlapping controls.
- Demo instructions use the public address advertised on the MikeScripts listing on 2026-09-25. Availability and installed demos were not tested. No connection is initiated without the visitor's own action.
- Framework, comparison, checklist and motion preferences are kept in this tab's session storage. No account, analytics, private token or server credential is requested. See the updated privacy page.

## Local review and packaging

Open the delivered `MikeScripts_Server_Owner_Preview.html` in a browser. Code and styles are embedded; webfonts, product media and YouTube require an internet connection. The actual website has six physical product pages. For local HTTP review run `python -m http.server 8000` at this package root, then open `/storefront/`.

Run `python build_site.py` from the source root to regenerate the standalone preview, the V3 Media Studio and the source HTML entry points. Build scripts are not runtime dependencies. The new modules are `owner-data.js`, `experience.css` and `experience.js`; the core gallery/payment functionality remains separate.

`MikeScripts_Media_Studio_V3.html` accepts local aircraft/gameplay media and can export an update ZIP or an HTML preview. It does not publish to GitHub or Tebex. The aircraft galleries still need the actual approved MS100 MAX and MS8000 assets. No stock/AI aircraft screenshots are substituted. The source editor's optional preview-template feature is provided in the standalone editor.

## Checkout

The public token remains blank, so Buy on Tebex opens the correct hosted product listing. The local bag explicitly explains that it is not automatically transferred in fallback mode. The Headless API + Tebex.js implementation remains available when configured and live-tested. No private credentials or browser-side fulfillment are used. The unconfirmed monthly Flight mapping remains hidden; aircraft remain showcase-only until actual package IDs are confirmed.

## Validation

9 API-client tests, 23 regression browser checks and 15 owner-experience browser checks passed (47 checks total). The regression suite also covers 35 page/viewport combinations, from 320 to 1440 pixels. Node syntax checks passed. Keyboard navigation, native dialogs and Web Animations were exercised in Chromium. Motion effects were checked to terminate, and device/user reduced-motion behavior was checked.

The test origin is isolated: location, session storage, clipboard, Tebex API/SDK and editor-download navigation use explicit adapters. External fonts and media are blocked in this environment. The tests verify typography wiring and fallback layout, not successful font/media delivery. All QA screenshots are labelled offline. Native cross-site persistence, public-host CORS, real login, actual SDK popup behavior, subscriptions, payment, fulfillment and demo server availability remain launch checks. The website has no false online indicator, benchmark, payment confirmation or automated compatibility claim.

```sh
node --check storefront/site.js
node --check storefront/experience.js
node --test tests/tebex.test.cjs
python tests/browser_test.py
python tests/owner_test.py
```

Browser tests need Python Playwright, Pillow and Chromium. They use `/usr/bin/chromium`; adjust the path for another system.

## References checked for this revision (2026-09-25)

- https://mikescripts.tebex.io/package/7324328 — Flight framework/dependency details and advertised demo address.
- https://mikescripts.tebex.io/package/7426329 — Police framework support, optional resources and editable files.
- https://mikescripts.tebex.io/package/7437723 — Fire dependencies, bundled props and editable/protected files.
- https://mikescripts.tebex.io/package/7692812 — Wrecker contents, OneSync and optional framework permissions.
- https://developers.google.com/fonts/docs/css2 — font-family requests and display=swap.
- https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion — motion preference behavior.

Product details are short paraphrases of the owner's listings, not independent tests. Check the live listing before purchase. Privacy copy describes technical behavior and still requires the merchant's production policy review.
