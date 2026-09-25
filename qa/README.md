# Validation record — 2026-09-25

9/9 Node API-client tests and 15/15 browser checks passed on the source in this change. JavaScript syntax checks passed. No page overflow at 320, 390, 768, 1024 or 1440 pixels. Browser tests use Playwright and Chromium with real DOM/CSS and native dialogs, but mocked location, storage, Headless API and payment SDK adapters because public browser navigation is blocked in the build environment.

Verified cases: script/aircraft counts, category filters and empty search, correct monthly package selection, explicit hosted-store fallback, cart restoration through the storage adapter, mutually exclusive one-time/monthly options, empty bag, media cleanup on close, no aircraft purchase without a mapped package, narrow layouts, trusted auth provider flow, visible ambiguous API failures, no duplicate additions on manual retry, explicit SDK launch, and no clearing of the bag on an unconfirmed payment return.

NOT LIVE-TESTED: FiveM authentication redirects, native session persistence across external navigation, public-host CORS, card payments, subscriptions, actual SDK popup behavior, receipt/fulfillment, and external images/videos. Complete these checks with the real public token on the production HTTPS host. Offline layout screenshots and detailed test results are included in the delivered source ZIP; rerunning tests also generates them here.
