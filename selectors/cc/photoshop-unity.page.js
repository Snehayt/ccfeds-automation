export default class CCPhotoshopUnity {
    constructor(page) {
      this.page = page;
  
      this.unityBlock = page.locator('.upload-block.unity-enabled');
      this.uploadButton = this.unityBlock.locator("div.upload-grid.desktop-up button[type='button']");
      this.fileInput = this.unityBlock.locator('input[type="file"][id="file-upload"]').first();
      this.dropZone = this.unityBlock.locator('div.upload-grid.desktop-up >> div.drop-zone');
      this.alertContent = this.unityBlock.locator('div.upload-grid.desktop-up div.alert-content');
      this.dragAndDropText = this.unityBlock.locator('div.drop-zone p:has-text("Drag and drop an image")');
      this.videoElement = this.unityBlock.locator('div.upload-grid.desktop-up video');
      this.OnlineVideoElement = this.unityBlock.locator('div.media-container video');
      this.OnlinedropZoneText = this.unityBlock.locator('div.upload-grid.desktop-up div.drop-zone p:nth-child(1)');
      this.OnlineAgreementText = this.unityBlock.locator("//div[@class='upload-grid desktop-up']//p[contains(text(),'By uploading your')]");
      this.dropZoneParagraph = this.unityBlock.locator("div[class='upload-grid desktop-up'] div[class='drop-zone'] p").first();
      this.uploadDisclaimer = this.unityBlock.locator('div.upload-grid.desktop-up p', { hasText: 'By uploading your image or video' });
      this.removeBackgroundButton = page.locator('sp-action-button:has-text("Remove background")');
      this.progressHolder = page.locator('div.progress-holder');
      // The splash-loader's inner "One moment..." <p> text toggles display
      // block/none every ~800ms as the progress bar advances, so it's too
      // flickery to assert on directly. Its static <h2> heading (which stays
      // rendered for the whole time the loader is shown) is the reliable signal.
      // The id is duplicated across a hidden mobile-variant copy and the
      // rendered desktop one (same duplicate-id pattern as fileInput above),
      // so ":visible" is used to pick whichever copy is actually on screen
      // instead of guessing an index.
      this.photoshopPreviewHeading = page.locator('.splash-loader h2#adobe-photoshop:visible').first();
    }

    // On a fast connection the upload finishes and redirects to Photoshop
    // before the splash-loader (progress bar / "One moment" heading) has a
    // chance to render, making that step's assertions racy. Throttling forces
    // the loader to stay on screen long enough to reliably assert on. Only
    // supported on Chromium (CDP); no-op elsewhere.
    async throttleUploadNetwork() {
      try {
        const client = await this.page.context().newCDPSession(this.page);
        // emulateNetworkConditions is a no-op unless the Network domain has
        // been explicitly enabled on this CDP session first.
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
  }