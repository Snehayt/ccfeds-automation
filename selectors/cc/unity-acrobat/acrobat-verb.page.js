export default class AcrobatVerbWidget {
  constructor(page) {
    this.page = page;

    // Verb pages render one of several container patterns depending on the
    // tool (`.verb-widget`, the studentspaces `.study-marquee`, or the
    // `.verb-marquee` used by ai-resume-builder) — those add "unity-enabled"
    // to the class list once decorated, so matching on that substring covers
    // those variants without enumerating each one. The upload-to-convert
    // tools (image-to-pdf, jpg-to-pdf, etc.) instead render as
    // `verb-widget-client-upload` and never get "unity-enabled" added, even
    // once fully loaded (confirmed live via `data-block-status="loaded"`),
    // so that pattern is matched explicitly.
    // A separate, permanently-empty `<div class="unity workflow-acrobat">`
    // placeholder also exists on some pages; it never gets "unity-enabled"
    // added, so it's naturally excluded here.
    this.unityBlock = page.locator('[class*="unity-enabled"], [class*="verb-widget-client-upload"]').first();
    this.dropZone = page.locator('#drop-zone');
    this.uploadButton = this.unityBlock.locator('button[class*="-cta"]').first();
    this.fileInput = this.unityBlock.locator('input[type="file"]').first();

    // The splash-loader class is duplicated across a hidden mobile-variant
    // copy and the rendered desktop one, so ":visible" picks whichever copy
    // is actually on screen instead of hitting a strict-mode violation
    // (same duplicate pattern documented in photoshop-unity.page.js).
    this.splashLoader = page.locator('.fragment.splash-loader:visible').first();
    this.progressHolder = page.locator('div.progress-holder:visible').first();
  }

  // On a fast connection the upload can finish and redirect before the
  // splash-loader has a chance to render, making assertions on it racy.
  // Throttling forces the loader to stay on screen long enough to reliably
  // assert on (same approach as photoshop-unity.page.js). Only supported on
  // Chromium (CDP); no-op elsewhere.
  async throttleUploadNetwork() {
    try {
      const client = await this.page.context().newCDPSession(this.page);
      await client.send('Network.enable');
      await client.send('Network.emulateNetworkConditions', {
        offline: false,
        latency: 400,
        downloadThroughput: 50 * 1024,
        uploadThroughput: 20 * 1024,
      });
    } catch (e) {
      // CDP session unavailable (non-Chromium browser) — leave network as-is.
    }
  }

  async uploadFile(filePath) {
    await this.uploadButton.waitFor({ state: 'visible' });
    // The upload button is visible (and clickable) before the widget's own
    // JS finishes binding its upload handler — clicking immediately after
    // domcontentloaded lets the click land before that handler is wired up,
    // so the file gets set but the app never creates the splash-loader or
    // otherwise reacts (confirmed live: identical click, zero splash-loader
    // elements in the DOM afterwards, vs. reliable creation once a short
    // settle period is given first).
    await this.page.waitForTimeout(4000);
    try {
      const [fileChooser] = await Promise.all([
        this.page.waitForEvent('filechooser', { timeout: 5000 }),
        this.uploadButton.click(),
      ]);
      await fileChooser.setFiles(filePath);
    } catch {
      await this.fileInput.setInputFiles(filePath);
    }
  }

  // The post-upload redirect path/hash is bespoke per verb (some use the
  // page's own URL slug, some use the widget's internal codename, some
  // append a fragment with a generated asset URN) so it can't be asserted
  // literally across all verbs. The one invariant confirmed live across
  // every verb category is the destination hostname, so that's what
  // callers should assert once this resolves.
  async waitForRedirectAwayFrom(originalUrl, timeout = 20000) {
    await this.page.waitForURL((url) => url.toString() !== originalUrl, { timeout });
  }
}
