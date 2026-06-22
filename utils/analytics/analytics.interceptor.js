// Intercepts Adobe AEP Web SDK collect calls fired from the nav.
// Usage: call start() in beforeEach, stop() in afterEach.

export class AnalyticsInterceptor {
  constructor(page) {
    this.page = page;
    this._handler = null;
  }

  start() {
    this._handler = (route) => route.fulfill({ status: 200, body: '' });
    this.page.route(/\/collect\?.*configId=/, this._handler);
  }

  stop() {
    if (this._handler) {
      this.page.unroute(/\/collect\?.*configId=/, this._handler).catch(() => {});
      this._handler = null;
    }
  }
}
