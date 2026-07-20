// Intercepts Adobe AEP Web SDK collect calls fired from the nav.
// Usage: call start() once (in beforeEach), then bracket whatever click/tap you want
// verified with getCollectCallCount() before and getNewCollectCalls() after — e.g.:
//
//   const before = await getCollectCallCount(page);
//   await someButton.tap();
//   const newCalls = await getNewCollectCalls(page, before);
//   // newCalls.some(name => name.startsWith(daaLl))
//
// Collect calls are sent via navigator.sendBeacon() (or fetch with keepalive) — Playwright's
// own request.postData() cannot read sendBeacon bodies on WebKit (confirmed live: always
// returns null there, even though the real data is correct and present). Patching
// sendBeacon/fetch directly in the page via addInitScript() — which must run before the
// analytics library loads, so it captures OUR patched reference instead of the native one —
// works identically across WebKit, Firefox, and Chromium, since it's plain JS interception,
// not a browser-specific protocol (unlike a CDP-based fix, which only works on Chromium).
//
// window.__collectCalls grows for the whole page lifetime (start() never resets it) —
// getCollectCallCount()/getNewCollectCalls() bracket a checkpoint around it so a match is
// guaranteed to come from the action just performed, not some earlier unrelated call that
// happens to share a name prefix.
//
// start() must be awaited by the caller — unawaited dispatch-ordering (Playwright normally
// issues commands in the order called even without awaiting) proved fragile under real
// test-runner conditions: confirmed live that analytics capture could silently come back
// empty for an entire run without this await landing before the page navigates.

export class AnalyticsInterceptor {
  constructor(page) {
    this.page = page;
    this._handler = null;
  }

  start() {
    this._handler = (route) => route.fulfill({ status: 200, body: '' });
    this.page.route(/\/collect\?.*configId=/, this._handler);

    return this.page.addInitScript(() => {
      window.__collectCalls = window.__collectCalls || [];
      const isCollectUrl = (url) => /\/collect(\?|$)/.test(url) && url.includes('configId=');
      const parseInteractionName = (body) => {
        try {
          const xdm = JSON.parse(body || '{}').events?.[0]?.xdm ?? {};
          return xdm.web?.webInteraction?.name ?? '';
        } catch { return ''; }
      };

      const origFetch = window.fetch;
      window.fetch = function (url, opts) {
        const u = typeof url === 'string' ? url : (url && url.url) || String(url);
        if (isCollectUrl(u) && opts && opts.body) {
          window.__collectCalls.push(parseInteractionName(opts.body));
        }
        return origFetch.apply(this, arguments);
      };

      const origBeacon = navigator.sendBeacon;
      navigator.sendBeacon = function (url, data) {
        const u = typeof url === 'string' ? url : String(url);
        if (isCollectUrl(u)) {
          if (data instanceof Blob) {
            data.text().then((text) => window.__collectCalls.push(parseInteractionName(text)));
          } else {
            window.__collectCalls.push(parseInteractionName(typeof data === 'string' ? data : ''));
          }
        }
        return origBeacon.apply(this, arguments);
      };
    });
  }

  stop() {
    if (this._handler) {
      this.page.unroute(/\/collect\?.*configId=/, this._handler).catch(() => {});
      this._handler = null;
    }
  }
}

// Call before the action whose analytics you want to verify.
export async function getCollectCallCount(page) {
  return page.evaluate(() => (window.__collectCalls || []).length);
}

// Call after the action. Waits briefly for any in-flight beacon to be parsed (sendBeacon
// bodies delivered as a Blob are read asynchronously), then returns only the interaction
// names added since `sinceCount` — i.e. caused by the action just performed, not by
// anything earlier in the page's history.
export async function getNewCollectCalls(page, sinceCount) {
  await page.waitForTimeout(500);
  return page.evaluate((from) => (window.__collectCalls || []).slice(from), sinceCount);
}
