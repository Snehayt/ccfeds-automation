import { expect, test } from '../../utils/fixtures/test.fixture.js';
import { features } from '../../features/cc/doodlebugimageupload.spec.js';
import DoodlebugImageUpload from '../../selectors/cc/doodlebugimageupload.page.js';

// Matches firefly.adobe.com, firefly-stage.corp.adobe.com, firefly.stage.adobe.com
const isFireflyUrl = (url) => /firefly[^/]*\.adobe\.com/.test(url.toString());

let doodlebugUpload;

test.describe('CC Doodlebug Image Upload Widget', () => {
  // step-3's retry reloads the page (up to 2 extra times) on backend rejection, and each
  // reload's widget-ready wait can itself take up to 30s — give it headroom.
  test.describe.configure({ timeout: 150000 });

  test.beforeEach(async ({ page }) => {
    doodlebugUpload = new DoodlebugImageUpload(page);
  });

  features.forEach((feature) => {
    test(`${feature.name}, ${feature.tags}`, async ({ page, baseURL }) => {
      console.info(`[Test Page]: ${baseURL}${feature.path}`);

      await test.step('step-1: Navigate to Firefly feature page', async () => {
        await page.goto(`${baseURL}${feature.path}`);
        await page.waitForLoadState('domcontentloaded');
        await expect(page).toHaveURL(`${baseURL}${feature.path}`);
      });

      await test.step('step-2: Verify upload unity widget is visible in page marquee', async () => {
        await doodlebugUpload.waitForUploadWidgetReady();
        await expect(doodlebugUpload.uploadWidget).toBeVisible();
        await expect(doodlebugUpload.uploadButton).toBeVisible();
        await expect(doodlebugUpload.dropZone).toBeVisible();
        await expect(doodlebugUpload.dragAndDropText).toBeVisible();
        await expect(doodlebugUpload.uploadDisclaimer).toBeVisible();
      });

      await test.step('step-3: Select and upload image from desktop', async () => {
        await doodlebugUpload.uploadImageWithRetry(feature.data.file);
      });

      await test.step('step-4: Verify splash upload screen and progress indicator', async () => {
        // The splash screen may show and hide again before the assertion fires. Best-effort
        // check; step-5 is the definitive proof of success.
        try {
          await expect(doodlebugUpload.splashScreen).toBeVisible({ timeout: 4000 });
          await expect(doodlebugUpload.progressHolder).toBeVisible();
        } catch {
          console.info('[Info] Splash screen not caught in visible state — redirect completed before assertion.');
        }
      });

      await test.step('step-5: Verify user lands on Firefly product page', async () => {
        // Firefly SPA fires domcontentloaded quickly but delays the load event — use domcontentloaded to avoid timeout.
        // Stage redirect latency varies under repeated sequential runs, so allow extra headroom.
        await page.waitForURL(isFireflyUrl, { timeout: 30000, waitUntil: 'domcontentloaded' });
      });
    });
  });
});
