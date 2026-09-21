import { expect, test } from '../../../utils/fixtures/test.fixture.js';
import { features } from '../../../features/cc/unity-acrobat/compress-pdf.spec.js';
import AcrobatVerbWidget from '../../../selectors/cc/unity-acrobat/acrobat-verb.page.js';

// Matches acrobat.adobe.com (prod) and stage.acrobat.adobe.com (stage)
const isAcrobatUrl = (url) => /(?:stage\.)?acrobat\.adobe\.com/.test(url.toString());

let acrobatVerb;

test.describe('Acrobat CompressPdf Unity Widget', () => {
  test.beforeEach(async ({ page }) => {
    acrobatVerb = new AcrobatVerbWidget(page);
  });

  test.afterEach(async ({ page }) => {
    await page.close();
  });

  // 1. Page should have the unity block to upload a file
  test(`${features[0].name}, ${features[0].tags}`, async ({ page, baseURL }) => {
    console.info(`[Test Page]: ${baseURL}${features[0].path}`);
    await test.step('Check unity upload block is present', async () => {
      await page.goto(`${baseURL}${features[0].path}`);
      await page.waitForLoadState('domcontentloaded');
      await expect(acrobatVerb.unityBlock).toBeVisible();
      await expect(acrobatVerb.uploadButton).toBeVisible();
      await expect(acrobatVerb.dropZone).toBeVisible();
    });
  });

  // 2. Select the sample pdf file from assets
  test(`${features[1].name}, ${features[1].tags}`, async ({ page, baseURL }) => {
    console.info(`[Test Page]: ${baseURL}${features[1].path}`);
    await test.step('Visit page', async () => {
      await page.goto(`${baseURL}${features[1].path}`);
      await page.waitForLoadState('domcontentloaded');
      await expect(acrobatVerb.uploadButton).toBeVisible({ timeout: 5000 });
      await expect(acrobatVerb.uploadButton).toBeEnabled({ timeout: 5000 });
    });
    await test.step('Select sample file from assets', async () => {
      const originalUrl = `${baseURL}${features[1].path}`;
      await acrobatVerb.uploadFile(features[1].data.file);
      await acrobatVerb.waitForRedirectAwayFrom(originalUrl, 15000);
    });
  });

  // 3. Check the splash screen display
  test(`${features[2].name}, ${features[2].tags}`, async ({ page, baseURL }) => {
    console.info(`[Test Page]: ${baseURL}${features[2].path}`);
    await test.step('Visit page and select sample file', async () => {
      await page.goto(`${baseURL}${features[2].path}`);
      await page.waitForLoadState('domcontentloaded');
      await acrobatVerb.uploadFile(features[2].data.file);
    });
    await test.step('Check splash screen display', async () => {
      // Splash timing varies beyond the default 5s expect timeout (confirmed
      // live: ~1-5s depending on the verb) - give it generous room. Network
      // throttling is deliberately NOT used here: confirmed live to suppress
      // the splash-loader entirely for several verbs (pdf-editor, heic-to-pdf,
      // the studentspaces tools), even though the un-throttled upload still
      // renders it reliably. The progress-holder percentage bar is part of
      // the standard verb-widget flow but doesn't render for every tool
      // (confirmed absent for the studentspaces tools), so only the
      // splash-loader itself is asserted.
      await expect(acrobatVerb.splashLoader).toBeVisible({ timeout: 15000 });
    });
  });

  // 4. Verify navigation to the given Redirection
  test(`${features[3].name}, ${features[3].tags}`, async ({ page, baseURL }) => {
    console.info(`[Test Page]: ${baseURL}${features[3].path}`);
    await test.step('Visit page and select sample file', async () => {
      await page.goto(`${baseURL}${features[3].path}`);
      await page.waitForLoadState('domcontentloaded');
    });
    await test.step('Check navigation to Redirection', async () => {
      const originalUrl = `${baseURL}${features[3].path}`;
      await acrobatVerb.uploadFile(features[3].data.file);
      await acrobatVerb.waitForRedirectAwayFrom(originalUrl, 20000);
      expect(isAcrobatUrl(page.url())).toBe(true);
    });
  });
});
