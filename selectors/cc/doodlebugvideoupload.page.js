import { expect } from '@playwright/test';

export default class DoodlebugVideoUpload {
  constructor(page) {
    this.page = page;

    this.uploadWidget = page.locator('.upload-marquee');

    // Only the .desktop-up column is visible on desktop Chromium
    this.desktopDropZoneContainer = page.locator('.drop-zone-container.desktop-up');
    this.dropZone = this.desktopDropZoneContainer.locator('div.drop-zone');

    // Upload button is an <a> tag, not <button>
    this.uploadButton = this.desktopDropZoneContainer.locator('a.action-button');

    // Hidden file input — used as fallback when filechooser event doesn't fire
    this.fileInput = this.desktopDropZoneContainer.locator('input.file-upload');

    this.dragAndDropText = this.dropZone.locator('.drop-zone-heading');
    this.uploadDisclaimer = this.desktopDropZoneContainer.locator('p', { hasText: 'By uploading' });

    this.splashScreen = page.locator('.fragment.splash-loader');
    this.progressHolder = page.locator('div.progress-holder');

    // Error toast shown by Unity when the uploaded video exceeds the 20-second limit.
    // Scoped to desktop-up to avoid matching the duplicate alert in the tablet-up column.
    this.uploadErrorMessage = this.desktopDropZoneContainer.locator('div.alert-text', {
      hasText: 'Your media must be no more than 20 seconds long',
    });

    // Backend rejection, same as seen on the image-upload widgets — scoped to the page's
    // session/token, not a time-based rate limit. See uploadVideoWithRetry.
    this.uploadRejectionMessage = this.desktopDropZoneContainer.locator('p', {
      hasText: 'Unable to process the request',
    });
  }

  async waitForUploadWidgetReady(timeout = 15000) {
    await this.page.locator('.upload-marquee[data-block-status="loaded"]').waitFor({ state: 'visible', timeout });
    await this.dropZone.waitFor({ state: 'visible', timeout });
  }

  async uploadVideoViaButton(filePath) {
    await expect(this.dropZone).toBeVisible({ timeout: 5000 });
    try {
      const [fileChooser] = await Promise.all([
        this.page.waitForEvent('filechooser', { timeout: 5000 }),
        this.dropZone.click(),
      ]);
      await fileChooser.setFiles(filePath);
    } catch {
      await this.fileInput.setInputFiles(filePath);
    }
  }

  // Retries the upload if the backend responds with "Unable to process the request".
  // As with the image-upload widgets, this rejection is scoped to the page's session/token —
  // reloading the page (fresh session) clears it; waiting in place does not.
  async uploadVideoWithRetry(filePath, maxAttempts = 3) {
    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      await this.uploadVideoViaButton(filePath);

      const outcome = await Promise.race([
        this.uploadRejectionMessage.waitFor({ state: 'visible', timeout: 8000 }).then(() => 'error').catch(() => 'unknown'),
        this.splashScreen.waitFor({ state: 'visible', timeout: 8000 }).then(() => 'success').catch(() => 'unknown'),
      ]);

      if (outcome !== 'error') return;

      if (attempt === maxAttempts) {
        throw new Error(`Video upload failed after ${maxAttempts} attempts — backend returned "Unable to process the request"`);
      }
      console.info(
        `[Info] Upload attempt ${attempt} rejected by backend ("Unable to process the request") — `
        + 'reloading page for a fresh session before retrying.',
      );
      await this.page.reload({ waitUntil: 'domcontentloaded' });
      // A hard reload re-fetches everything (no prefetch/cache boost like the initial nav
      // gets), so the block can take longer than the default 15s to reach data-block-status=loaded.
      await this.waitForUploadWidgetReady(30000);
    }
  }
}
