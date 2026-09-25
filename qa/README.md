# V3 QA — 2026-09-25

9 API-client unit checks, 23 regression browser checks, and 15 owner-experience browser checks passed (47 total). Regression covers 35 home/product viewport combinations at 320, 390, 768, 1024 and 1440px.

New checks cover font-family wiring/fallbacks, framework filtering/reset, three-resource comparison, contained mobile comparison scrolling, Ctrl-K search and keyboard routing, honest unlisted-framework status, checklist/brief copying, session-adapter restoration, clipboard fallback, sticky purchase link, manual/device reduced motion, terminating transitions, and published-but-unverified demo instructions.

Tests use actual Chromium DOM/CSS, keyboard events, native dialogs and the Web Animations API. Location, session storage, clipboard, payment services and download navigation use explicit test adapters because the browser cannot navigate externally in this environment. No remote font, external gallery playback, live server connection, payment or fulfillment is claimed. Screenshots are OFFLINE fallback layout checks.

Files in the delivered ZIP: unit-v3.txt, browser-v3-base.log, browser-results.json, owner-tests.log, owner-results.json, and labelled layout screenshots. No font binaries are included. A narrow-screen visually hidden select overflow was found and fixed during QA.
